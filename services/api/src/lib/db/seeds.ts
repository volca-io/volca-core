import { Knex } from 'knex';

export default [
  {
    seed: async (knex: Knex) => {
      await knex('users').del();
      await knex('users').insert([
        {
          firstName: 'Test',
          lastName: 'Testsson',
          email: 'test@test.com',
          cognitoSubject: 'dfa6ee84-e222-4c4b-a504-7952b741a315',
          cognitoIdentityId: '44c8dc49-2b10-45eb-9867-8b48cba91514',
          hasActiveSubscription: true,
        },
        {
          firstName: 'Steven',
          lastName: 'Hawking',
          email: 'stephen@hawking.com',
          cognitoSubject: 'ee3361e3-e6b3-4b6f-8b37-a46fee1312ea',
          cognitoIdentityId: '84d4acbb-e586-4b18-b04b-a4aeca1cc5af',
          hasActiveSubscription: true,
        },
      ]);
    },
  },
] as Array<Knex.Seed>;
