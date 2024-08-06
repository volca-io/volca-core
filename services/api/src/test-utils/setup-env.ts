import { PlanId } from '../../../../types/types';

const mockConfig = {
  name: 'volca',
  github: {
    organization: 'volca-io',
    repository: 'volca-internal',
  },
  domain: 'volca.io',
  fromEmail: 'admin@mail.volca.io',
  aws: {
    account: '428245413678',
    region: 'eu-central-1',
  },
  environments: {
    local: {
      authentication: {
        mockUser: {
          sub: '7997a1a2-37d2-4843-aa78-bb2844f5e292',
          firstName: 'Volca',
          lastName: 'Test',
          email: 'test@volca.io',
        },
      },
      plans: [
        {
          id: PlanId.BASIC,
          stripePriceId: 'price-id',
        },
        {
          id: PlanId.PLUS,
          stripePriceId: 'price-id-2',
        },
        {
          id: PlanId.PREMIUM,
          stripePriceId: 'price-id-3',
        },
      ],
    },
  },
};

jest.mock('../utils/environment', () => {
  return {
    loadEnvironmentVariables: () => {},
    config: mockConfig,
    EnvironmentConfig: mockConfig.environments.local,
    EnvironmentVariables: process.env,
  };
});
