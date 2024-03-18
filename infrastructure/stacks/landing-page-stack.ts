import * as path from 'path';
import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Bucket, ObjectOwnership, RedirectProtocol } from 'aws-cdk-lib/aws-s3';
import {
  CloudFrontWebDistribution,
  ViewerCertificate,
  SecurityPolicyProtocol,
  SSLMethod,
  OriginProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { execSync } from 'child_process';
import { Environment } from '../../types/types';
import { config } from '@project/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LandingPageStackProps extends StackProps {
  domain: string;
  environment: Environment;
  certificate: Certificate;
}

export class LandingPageStack extends Stack {
  public distribution: CloudFrontWebDistribution;
  public bucket: Bucket;
  private path: string;

  constructor(scope: Construct, id: string, props: LandingPageStackProps) {
    super(scope, id, props);

    const { deploymentConfig } = config.environments[props.environment];
    if (!deploymentConfig) {
      throw new Error(
        'Can not deploy an environment without a deployment config. Please add one to your environment in app.config.ts'
      );
    }

    const { subdomain } = deploymentConfig;

    this.path = path.join(__dirname, '../../clients/landing-page');
    const domain = subdomain ? `${subdomain}.${props.domain}` : props.domain;

    // List of redirects that can be used for redirecting existing urls. Good for SEO purposes when moving paths
    const redirects = [
      { from: 'authentication/', to: 'features/authentication/' },
      { from: 'cicd/', to: 'features/cicd/' },
      { from: 'multitenant/', to: 'features/multitenancy/' },
      { from: 'logging/', to: 'features/logging/' },
      { from: 'admin-dashboard-template/', to: 'use-cases/admin-dashboard-template/' },
      { from: 'serverless/', to: 'features/serverless/' },
      { from: 'nodejs-saas-boilerplate/', to: '' },
    ];

    // Creates a new bucket that we will upload our React app to
    this.bucket = new Bucket(this, 'LandingPageBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
      websiteRoutingRules: redirects.map(({ from, to }) => ({
        condition: {
          keyPrefixEquals: from,
        },
        httpRedirectCode: '301',
        hostName: domain,
        protocol: RedirectProtocol.HTTPS,
        replaceKey: {
          withKey: to,
        },
      })),
    });

    // Creates a new CloudFront distribution that we will use to access the S3 bucket content
    this.distribution = new CloudFrontWebDistribution(this, 'LandingPageDistribution', {
      viewerCertificate: ViewerCertificate.fromAcmCertificate(props.certificate, {
        aliases: [domain, `www.${domain}`],
        securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: SSLMethod.SNI,
      }),
      originConfigs: [
        {
          customOriginSource: {
            domainName: this.bucket.bucketWebsiteDomainName,
            originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
    });

    const hostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: props.domain });

    if (Stack.of(this).bundlingRequired) {
      this.buildWebsite();
      this.deployWebsite();
    }

    new ARecord(this, 'LandingPageARecord', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      zone: hostedZone,
      recordName: domain,
    });
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

  private buildWebsite = () => {
    execSync('yarn build', {
      cwd: this.path,
      stdio: 'inherit',
      env: this.getBuildEnvVars(),
    });
  };

  private deployWebsite = () => {
    const cachedFileEndings = `.{css,js}`;
    new BucketDeployment(this, 'DeployCachedWebsite', {
      sources: [
        Source.asset(`${this.path}/dist/client`, {
          exclude: ['**/*.*', '!**/*' + cachedFileEndings],
        }),
      ],
      destinationBucket: this.bucket,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.immutable(),
        CacheControl.maxAge(Duration.seconds(31536000)),
      ],
      distribution: this.distribution,
      prune: false,
    });

    new BucketDeployment(this, 'DeployNonCachedWebsite', {
      sources: [Source.asset(`${this.path}/dist/client`, { exclude: ['**/*' + cachedFileEndings] })],
      destinationBucket: this.bucket,
      cacheControl: [CacheControl.noCache()],
      distribution: this.distribution,
      prune: false,
    });
  };
}
