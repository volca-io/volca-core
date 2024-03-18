import { App, Tags } from 'aws-cdk-lib';
import { config } from '@project/config';
import { Environment } from '../../types/types';
import { CoreStack } from '../stacks/core-stack';
import { ApiStack } from '../stacks/api-stack';
import { DashboardStack } from '../stacks/dashboard-stack';
import { CertificateStack } from '../stacks/certificate-stack';
import { LandingPageStack } from '../stacks/landing-page-stack';

const app = new App();

const environment = app.node.tryGetContext('environment') as Environment;
const { name, github, aws, domain, fromEmail } = config;

new CoreStack(app, `${name}-core-stack`, {
  env: aws,
  name,
  domain,
  email: fromEmail,
  githubOrg: github.organization,
  githubRepo: github.repository,
});

if (environment) {
  // Certificates used by CloudFront needs to be in the us-east-1 region. These certificates are placed in
  // a separate stack in us-east-1 with crossRegionReferences enabled.
  const certificateStack = new CertificateStack(app, `${name}-${environment}-certificate-stack`, {
    domain,
    environment,
    env: {
      ...aws,
      region: 'us-east-1',
    },
    crossRegionReferences: true,
  });

  const landingPageStack = new LandingPageStack(app, `${name}-${environment}-landing-page-stack`, {
    certificate: certificateStack.publicWebCertificate,
    domain,
    environment,
    env: aws,
    crossRegionReferences: true,
  });

  Tags.of(landingPageStack).add('name', name);
  Tags.of(landingPageStack).add('environment', environment);

  const apiStack = new ApiStack(app, `${name}-${environment}-api-stack`, {
    domain,
    name,
    environment,
    env: aws,
    fromEmail,
    cognitoCertificate: certificateStack.cognitoCertificate,
    crossRegionReferences: true,
  });

  // Api stack needs the root domain from the landing page to create the Cognito login domain
  apiStack.addDependency(landingPageStack);

  Tags.of(apiStack).add('name', name);
  Tags.of(apiStack).add('environment', environment);

  const dashboardStack = new DashboardStack(app, `${name}-${environment}-dashboard-stack`, {
    domain,
    name,
    environment,
    env: aws,
    dashboardCertificate: certificateStack.dashboardCertificate,
    crossRegionReferences: true,
  });

  Tags.of(dashboardStack).add('name', name);
  Tags.of(dashboardStack).add('environment', environment);
}
