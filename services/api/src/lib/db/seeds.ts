import { Knex } from 'knex';

export default [
  {
    seed: async (knex: Knex) => {
      await knex('users').del();
      await knex('users').insert([
        {
          first_name: 'Test',
          last_name: 'Testsson',
          email: 'test@test.com',
          password: '$2a$10$WoOkXRC6yXdT4csIBSO1suSYLjCD1C5m2CITTinKJL.yfKvkBHyjG',
        },
        {
          first_name: 'Steven',
          last_name: 'Hawking',
          email: 'stephen@hawking.com',
          password: '$2a$10$WoOkXRC6yXdT4csIBSO1suSYLjCD1C5m2CITTinKJL.yfKvkBHyjG',
        },
      ]);
    },
  },
] as Array<Knex.Seed>;
