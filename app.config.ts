import { Config, Environments, PlanId } from './types/types';

const coreConfig: Omit<Config, 'environments'> = {
  name: 'my-app',
  github: {
    organization: 'my-github-organization',
    repository: 'my-github-repository',
  },
  domain: 'my-domain.com',
  fromEmail: 'admin@mail.my-domain.com',
  aws: {
    account: '012345678901',
    region: 'us-east-1',
  },
  // Add your website id from crisp.chat to enable the chat widget on your landing page and app
  crisp: {
    websiteId: 'crisp-website-id',
  },
  // Add your measurement id from google analytics to collect analytics data from your landing page
  googleAnalytics: {
    measurementId: 'measurement-id',
  },
};

const environments: Environments = {
  local: {
    authentication: {
      // Add identity providers and login domain section to use "real" authentication with AWS Cognito locally
      // This requires that you have deployed your infrastructure stacks.
      // identityProviders: {
      //   google: {},
      //   facebook: {},
      //   apple: {},
      // },
      // loginDomain: `login.staging.${coreConfig.domain}`,

      // Specifying a mock user in the config will bypass AWS Cognito and let you run the app locally.
      // To use actual authentication, you can deploy your infrastructure to aws and specify a login domain
      // instead of a mock user.
      mockUser: {
        sub: 'c8a03b26-970d-463d-a256-feb0dbb51574',
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe@${coreConfig.domain}`,
      },
    },
    plans: [
      {
        id: PlanId.BASIC,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PLUS,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PREMIUM,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
    ],
    freeTrialDays: 7,
    testCardEnabled: true,
  },
  staging: {
    authentication: {
      identityProviders: {
        google: {
          clientId: 'google-app-client-id',
          // Create a client with Google and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          clientSecretSsmPath: `/${coreConfig.name}/AWS_COGNITO_GOOGLE_CLIENT_SECRET`,
        },
        facebook: {
          clientId: 'facebook-app-client-id',
          // Create a client with Facebook and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          clientSecretSsmPath: `/${coreConfig.name}/AWS_COGNITO_FACEBOOK_CLIENT_SECRET`,
        },
        apple: {
          clientId: 'apple-app-client-id',
          teamId: 'apple-team-id',
          keyId: 'apple-key-id',
          // Create a client with Apple and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          privateKeySsmPath: `/${coreConfig.name}/AWS_COGNITO_APPLE_PRIVATE_KEY`,
        },
      },

      // This will whitelist the localhost domain for you to use real authentication locally
      allowLocalhost: true,
    },
    deploymentConfig: {
      // Specify on what subdomain to deploy this environment. The app will be available on app.<subdomain>.<your-domain>.
      subdomain: 'staging',

      // A public database will make your databse accessible over the internet.
      // This will reduce the cost of deployment and can be good for easy debugging, but is not recommended for production use.
      publicDatabase: true,
    },
    plans: [
      {
        id: PlanId.BASIC,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PLUS,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PREMIUM,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
    ],
    freeTrialDays: 7,
    testCardEnabled: true,

    // Optional, get your dsn from senty.io for error tracking
    // sentry: {
    //   webappDsn: '',
    //   apiDsn: '',
    // },
  },
  production: {
    authentication: {
      identityProviders: {
        google: {
          clientId: 'google-app-client-id',
          // Create a client with Google and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          clientSecretSsmPath: `/${coreConfig.name}/AWS_COGNITO_GOOGLE_CLIENT_SECRET`,
        },
        facebook: {
          clientId: 'facebook-app-client-id',
          // Create a client with Facebook and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          clientSecretSsmPath: `/${coreConfig.name}/AWS_COGNITO_FACEBOOK_CLIENT_SECRET`,
        },
        apple: {
          clientId: 'apple-app-client-id',
          teamId: 'apple-team-id',
          keyId: 'apple-key-id',
          // Create a client with Apple and add the secret to AWS SSM. Then reference that secret here to enable Google auth.
          privateKeySsmPath: `/${coreConfig.name}/AWS_COGNITO_APPLE_PRIVATE_KEY`,
        },
      },
    },
    deploymentConfig: {
      publicDatabase: false,
    },
    plans: [
      {
        id: PlanId.BASIC,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PLUS,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
      {
        id: PlanId.PREMIUM,
        // Create a product in Stripe and add the price id here to enable subscriptions to this plan.
        stripePriceId: 'price-id',
      },
    ],
    freeTrialDays: 7,
    testCardEnabled: false,

    // Optional, get your dsn from senty.io for error tracking
    // sentry: {
    //   webappDsn: '',
    //   apiDsn: '',
    // },
  },
};

export const config: Config = {
  ...coreConfig,
  environments,
};
