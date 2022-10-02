export enum StackStrategy {
  COST = 'COST',
  SECURITY = 'SECURITY',
}

type AwsConfig = {
  account: string;
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
  stackStrategy: StackStrategy;
};

type LocalEnvironment = {
  aws?: AwsConfig;
  fromEmail: string;
};

export type DeployableEnvironmentConfig = {
  aws: AwsConfig;
  domain?: string;
  fromEmail: string;
};

type GithubConfig = {
  organization: string;
  repository: string;
};

export enum Environment {
  LOCAL = 'local',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export type Config = {
  environments: {
    [Environment.LOCAL]: LocalEnvironment;
    [Environment.STAGING]: DeployableEnvironmentConfig;
    [Environment.PRODUCTION]: DeployableEnvironmentConfig;
  };
  name: string;
  github: GithubConfig;
};
