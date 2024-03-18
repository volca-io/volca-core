import { Stack, StackProps, SecretValue, Duration } from 'aws-cdk-lib';
import { SubnetType, SecurityGroup, Vpc, IpAddresses } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import * as path from 'path';
import { config } from '@project/config';
import { ApiGateway, ApiLambdaExecutionRole, Database, SsmVariableGroup } from '../constructs';
import { Environment } from '../../types/types';
import { Cognito } from '../constructs/cognito';
import { S3Assets } from '../constructs/s3-assets';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { InvocationType, Trigger } from 'aws-cdk-lib/triggers';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ApiStackProps extends StackProps {
  domain: string;
  name: string;
  environment: Environment;
  fromEmail: string;
  cognitoCertificate: Certificate;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    if (!props.env || !props.env.region || !props.env.account) {
      throw new Error('Environment was not set when trying to deploy account bootstrap stack');
    }

    const { deploymentConfig, authentication } = config.environments[props.environment];
    if (!deploymentConfig) {
      throw new Error(
        'Can not deploy an environment without a deployment config. Please add one to your environment in app.config.ts'
      );
    }

    const { publicDatabase, subdomain } = deploymentConfig;
    const fullDomain = subdomain ? `${subdomain}.${props.domain}` : props.domain;

    // Creates a VPC that the api lambda functions will run in
    const vpc = new Vpc(this, 'ApplicationVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 3,
      natGateways: publicDatabase ? 0 : 1,
      vpcName: `${props.name}-${props.environment}-vpc`,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: 'isolated',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
        {
          name: 'private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Creates a security group that the api lambda functions will be attached to.
    const apiSecurityGroup = new SecurityGroup(this, 'ApiSecurityGroup', {
      description: 'Security group for lambda funcitons',
      allowAllOutbound: true,
      vpc,
    });

    // Creates an RDS database and attaches permissions for the API to access it
    const database = new Database(this, 'RdsDatabase', {
      vpc,
      public: publicDatabase,
      password: SecretValue.ssmSecure(`/${props.name}/${props.environment}/api/DB_PASSWORD`),
      apiSecurityGroup,
    });

    const hostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: props.domain });

    // Creates a new API gateway that will proxy requests to our API lambdas
    const api = new ApiGateway(this, 'ApiGateway', {
      name: props.name,
      environment: props.environment,
      domain: fullDomain,
      hostedZone,
    });

    // This role will be attached to the API lambdas and control what they are allowed to do in the AWS account
    const lambdaExecutionRole = new ApiLambdaExecutionRole(this, 'ApiLambdaExecutionRole', {
      name: props.name,
      environment: props.environment,
      region: props.env?.region,
      account: props.env?.account,
      publicDatabase,
    });

    // Cognito
    const cognito = new Cognito(this, 'Cognito', {
      name: props.name,
      environment: props.environment,
      fromEmail: props.fromEmail,
      hostedZone,
      domain: fullDomain,
      authenticationConfig: authentication,
      certificate: props.cognitoCertificate,
      createRootDomainPlaceholder: false,
    });

    const s3Assets = new S3Assets(this, 'S3Assets', {
      authenticatedRole: cognito.authenticatedRole,
      domain: fullDomain,
    });

    const envVars = new SsmVariableGroup(this, 'ApiEnvironmentVariables', {
      pathPrefix: `/${props.name}/${props.environment}/api`,
      variables: [
        {
          key: 'DB_USERNAME',
          value: 'postgres',
        },
        {
          key: 'DB_HOST',
          value: database.endpointAddress,
        },
        {
          key: 'DB_PORT',
          value: '5432',
        },
        {
          key: 'LOG_LEVEL',
          value: 'info',
        },
        {
          key: 'LOGGING_ENABLED',
          value: '1',
        },
        {
          key: 'APP_DOMAIN',
          value: `https://app.${fullDomain}`,
        },
        {
          key: 'AWS_COGNITO_USER_POOL_ID',
          value: cognito.userPool.userPoolId,
        },
        {
          key: 'AWS_COGNITO_APP_CLIENT_ID',
          value: cognito.userPoolAppClient.userPoolClientId,
        },
        {
          key: 'AWS_COGNITO_IDENTITY_POOL_ID',
          value: cognito.identityPool.ref,
        },
        {
          key: `AWS_S3_ASSETS_BUCKET`,
          value: s3Assets.bucket.bucketName,
        },
      ],
    });

    const lambdaOptions: Partial<NodejsFunctionProps> = {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      role: lambdaExecutionRole.role,
      vpc: publicDatabase ? undefined : vpc,
      securityGroups: publicDatabase ? undefined : [apiSecurityGroup],
      vpcSubnets: publicDatabase ? undefined : { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      bundling: {
        externalModules: ['sqlite3', 'better-sqlite3', 'mysql2', 'mysql', 'tedious', 'oracledb', 'pg-query-stream'],
      },
      environment: {
        ENVIRONMENT: props.environment,
        REGION: props.env.region,
      },
    };

    const migrationFunction = new NodejsFunction(this, 'MigrationHandler', {
      functionName: `${config.name}-${props.environment}-migration-handler`,
      entry: path.resolve(__dirname, '../../services/api/src/lambda-handlers/migrate.ts'),
      timeout: Duration.seconds(60),
      memorySize: 512,
      ...lambdaOptions,
    });

    const migrationTrigger = new Trigger(this, 'MigrationTrigger', {
      handler: migrationFunction,
      invocationType: InvocationType.REQUEST_RESPONSE,
    });

    migrationTrigger.node.addDependency(envVars);

    const apiHandler = new NodejsFunction(this, 'ApiHandler', {
      functionName: `${config.name}-${props.environment}-api-handler`,
      entry: path.resolve(__dirname, '../../services/api/src/lambda-handlers/api.ts'),
      timeout: Duration.seconds(30),
      memorySize: 1024,
      ...lambdaOptions,
    });

    apiHandler.node.addDependency(migrationTrigger);

    const lambdaIntegration = new LambdaIntegration(apiHandler);
    const apiResource = api.rootResource.addResource('{proxy+}');
    apiResource.addMethod('ANY', lambdaIntegration);
  }
}
