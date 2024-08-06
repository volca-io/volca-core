import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import {
  OriginAccessIdentity,
  CloudFrontWebDistribution,
  ViewerCertificate,
  SecurityPolicyProtocol,
  SSLMethod,
} from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { execSync } from 'child_process';
import * as path from 'path';
import { config } from '@project/config';
import { Environment } from '../../types/types';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface DashboardStackProps extends StackProps {
  domain: string;
  name: string;
  environment: Environment;
  dashboardCertificate: Certificate;
}

export class DashboardStack extends Stack {
  public distribution: CloudFrontWebDistribution;
  public bucket: Bucket;
  public domain: string;
  private path: string;

  constructor(scope: Construct, id: string, props: DashboardStackProps) {
    super(scope, id, props);

    const { deploymentConfig } = config.environments[props.environment];
    if (!deploymentConfig) {
      throw new Error(
        'Can not deploy an environment without a deployment config. Please add one to your environment in app.config.ts'
      );
    }

    const { subdomain } = deploymentConfig;

    this.path = path.join(__dirname, '../../clients/dashboard');
    this.domain = subdomain ? `app.${subdomain}.${props.domain}` : `app.${props.domain}`;

    // Creates a new bucket that we will upload our React app to
    this.bucket = new Bucket(this, 'DashboardHostingBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      blockPublicAccess: new BlockPublicAccess({ restrictPublicBuckets: false }),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Creates an origin access identity so we can control access to the bucket
    const oai = new OriginAccessIdentity(this, 'DashboardCloudFrontOriginAccessIdentity');
    this.bucket.grantRead(oai.grantPrincipal);

    // Creates a new CloudFront distribution that we will use to access our dashboard
    this.distribution = new CloudFrontWebDistribution(this, 'DashboardDistribution', {
      viewerCertificate: ViewerCertificate.fromAcmCertificate(props.dashboardCertificate, {
        aliases: [this.domain, `www.${this.domain}`],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: SSLMethod.SNI,
      }),
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.bucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 300,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    const hostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: props.domain });

    // Create a new A record for our domain that will route requests from app.<your-domain> to the react app
    new ARecord(this, 'DashboardARecord', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      zone: hostedZone,
      recordName: this.domain,
    });

    if (Stack.of(this).bundlingRequired) {
      this.buildWebsite(props.environment);
      this.deployWebsite();
    }

    // Creates some stack outputs that we can read when deploying to know where to upload the dashboard
    new CfnOutput(this, 'DashboardHostingBucketName', { value: this.bucket.bucketName });
    new CfnOutput(this, 'CloudFrontID', { value: this.distribution.distributionId });
  }

  private getBuildEnvVars() {
    const env: Record<string, string> = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v) {
        env[k] = v;
      }
    }
    return env;
  }

  private buildWebsite = (environment: Environment) => {
    execSync(`yarn build:${environment}`, {
      cwd: this.path,
      stdio: 'inherit',
      env: this.getBuildEnvVars(),
    });
  };

  private deployWebsite = () => {
    const cachedFileEndings = `.{css,js}`;
    new BucketDeployment(this, 'DeployCachedWebsite', {
      sources: [
        Source.asset(`${this.path}/dist`, {
          exclude: ['**/*.*', '!**/*' + cachedFileEndings],
        }),
      ],
      destinationBucket: this.bucket,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.immutable(),
        CacheControl.maxAge(Duration.seconds(31536000)),
      ],
      prune: false,
    });

    new BucketDeployment(this, 'DeployNonCachedWebsite', {
      sources: [Source.asset(`${this.path}/dist`, { exclude: ['**/*' + cachedFileEndings] })],
      destinationBucket: this.bucket,
      cacheControl: [CacheControl.noCache()],
      prune: false,
    });
  };
}
