import { VerifySesDomain } from '@seeebiii/ses-verify-identities';
import { CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { IOpenIdConnectProvider, OpenIdConnectProvider, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { config } from '@project/config';

import { Construct } from 'constructs';
import { DeploymentPolicy } from '../constructs';

interface CoreStackProps extends StackProps {
  name: string;
  domain: string;
  githubOrg: string;
  githubRepo: string;
  email: string;
}

export class CoreStack extends Stack {
  public provider: IOpenIdConnectProvider;
  public hostedZone: HostedZone;

  constructor(scope: Construct, id: string, props: CoreStackProps) {
    super(scope, id, props);

    if (!props.env || !props.env.region || !props.env.account) {
      throw new Error('Environment was not set when trying to deploy account bootstrap stack');
    }

    // Creates a new OIDC provider for the account that allows GitHub actions to connect to the account
    // and get short lived tokens
    this.provider = config.aws.oidcProviderArn
      ? OpenIdConnectProvider.fromOpenIdConnectProviderArn(this, 'GithubOidcProviderImport', config.aws.oidcProviderArn)
      : new OpenIdConnectProvider(this, 'GithubOidcProvider', {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
          thumbprints: ['6938fd4d98bab03faadb97b34396831e3780aea1', '1c58a3a8518e8759bf075b76b750d4f2df264fcd'],
        });

    // Creates a hosted zone for us to later add DNS records when we deploy the API and dashboard
    this.hostedZone = new HostedZone(this, 'HostedZone', { zoneName: props.domain });

    new VerifySesDomain(this, 'SesDomainVerification', {
      domainName: props.email.split('@')[1],
      hostedZoneId: this.hostedZone.hostedZoneId,
    });

    // Creates a new role that will be assumed by GitHub actions.
    // The role gives limited access to your AWS account so it can deploy volca to your account
    const deploymentRole = new Role(this, 'GithubActionsDeploymentRole', {
      roleName: `${props.name}-github-actions-deployment-role`,
      assumedBy: new WebIdentityPrincipal(this.provider.openIdConnectProviderArn, {
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${props.githubOrg}/${props.githubRepo}:*`,
        },
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
      }),
    });

    const { cloudformationDeploymentRoleArn } = new DeploymentPolicy(this, 'DeploymentPolicy', {
      name: props.name,
      region: props.env.region,
      account: props.env.account,
      deploymentRole,
    });

    if (!this.hostedZone.hostedZoneNameServers) {
      throw new Error('Failed to get hosted zone name servers');
    }

    // Exports the name servers to know where to point the domain to
    new CfnOutput(this, 'NameServers', { value: Fn.join(', ', this.hostedZone.hostedZoneNameServers) });

    // Creates some outputs so the serverless framework knows what role to use when deploying
    new CfnOutput(this, 'DeploymentRoleArn', { value: deploymentRole.roleArn });
    new CfnOutput(this, 'ApiCloudformationDeploymentRoleArn', { value: cloudformationDeploymentRoleArn });
  }
}
