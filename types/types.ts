interface AwsConfig {
  account: string;
  oidcProviderArn?: string;
  region:
    | 'us-east-1'
    | 'us-east-2'
    | 'us-gov-east-1'
    | 'us-gov-west-1'
    | 'us-iso-east-1'
    | 'us-iso-west-1'
    | 'us-isob-east-1'
    | 'us-west-1'
    | 'us-west-2'
    | 'af-south-1'
    | 'ap-east-1'
    | 'ap-northeast-1'
    | 'ap-northeast-2'
    | 'ap-northeast-3'
    | 'ap-south-1'
    | 'ap-southeast-1'
    | 'ap-southeast-2'
    | 'ap-southeast-3'
    | 'ca-central-1'
    | 'cn-north-1'
    | 'cn-northwest-1'
    | 'eu-central-1'
    | 'eu-north-1'
    | 'eu-south-1'
    | 'eu-west-1'
    | 'eu-west-2'
    | 'eu-west-3'
    | 'me-south-1'
    | 'sa-east-1';
}

export type AuthenticationConfig = {
  identityProviders?: {
    facebook?:
      | {
          clientId: string;
          clientSecret: string;
          clientSecretSsmPath?: never;
        }
      | {
          clientId: string;
          clientSecret?: never;
          clientSecretSsmPath: string;
        }
      | Record<string, never>;
    google?:
      | {
          clientId: string;
          clientSecret: string;
          clientSecretSsmPath?: never;
        }
      | {
          clientId: string;
          clientSecret?: never;
          clientSecretSsmPath: string;
        }
      | Record<string, never>;
    apple?:
      | {
          clientId: string;
          teamId: string;
          keyId: string;
          privateKey: string;
          privateKeySsmPath?: never;
        }
      | {
          clientId: string;
          teamId: string;
          keyId: string;
          privateKey?: never;
          privateKeySsmPath: string;
        }
      | Record<string, never>;
  };
  loginDomain?: string;
  allowLocalhost?: boolean;
  mockUser?: {
    sub: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export enum PlanId {
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
}

type Plan = {
  id: PlanId;
  stripePriceId: string;
};

export interface EnvironmentConfig {
  plans: Plan[];
  freeTrialDays: number;
  testCardEnabled: boolean;
  authentication: AuthenticationConfig;
  deploymentConfig?: {
    subdomain?: string;
    publicDatabase: boolean;
  };
  sentry?: {
    dashboardDsn: string;
    apiDsn: string;
  };
}

type GithubConfig = {
  organization: string;
  repository: string;
};

type CrispConfig = {
  websiteId: string;
};

type GoogleAnalyticsConfig = {
  measurementId: string;
};

export enum Environment {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export type Environments = {
  [env in Environment]: EnvironmentConfig;
};

export type Config = {
  name: string;
  github: GithubConfig;
  crisp?: CrispConfig;
  googleAnalytics?: GoogleAnalyticsConfig;
  aws: AwsConfig;
  domain: string;
  fromEmail: string;
  environments: Environments;
};
