import { Stack, StackProps } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';

import { Construct } from 'constructs';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { config } from '@project/config';
import { Environment } from '../../types/types';

interface CertificateStackProps extends StackProps {
  domain: string;
  environment: Environment;
  subdomain?: string;
}

export class CertificateStack extends Stack {
  public cognitoCertificate: Certificate;
  public dashboardCertificate: Certificate;
  public publicWebCertificate: Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { deploymentConfig } = config.environments[props.environment];
    if (!deploymentConfig) {
      throw new Error(
        'Can not deploy an environment without a deployment config. Please add one to your environment in app.config.ts'
      );
    }

    const { subdomain } = deploymentConfig;
    const fullDomain = subdomain ? `${subdomain}.${props.domain}` : props.domain;

    const hostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: props.domain });

    const cognitoDomainName = `login.${fullDomain}`;
    this.cognitoCertificate = new Certificate(this, 'CognitoCertificate', {
      domainName: cognitoDomainName,
      subjectAlternativeNames: [`www.${cognitoDomainName}`],
      validation: CertificateValidation.fromDns(hostedZone),
    });

    const dashboardDomainName = `app.${fullDomain}`;
    this.dashboardCertificate = new Certificate(this, 'DashboardCertificate', {
      domainName: dashboardDomainName,
      subjectAlternativeNames: [`www.${dashboardDomainName}`],
      validation: CertificateValidation.fromDns(hostedZone),
    });

    this.publicWebCertificate = new Certificate(this, 'PublicWebCertificate', {
      domainName: fullDomain,
      subjectAlternativeNames: [`www.${fullDomain}`],
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
