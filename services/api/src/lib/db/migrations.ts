import { Knex } from 'knex';

export type Migration = {
  name: string;
  up(knex: Knex): PromiseLike<unknown>;
  down(knex: Knex): PromiseLike<unknown>;
};

export default [
  {
    name: '01_create_uuid_extension',
    up: (knex: Knex) => {
      return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    },
    down: (knex: Knex) => {
      return knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
    },
  },
  {
    name: '02_create_users_table',
    up: (knex: Knex) => {
      return knex.schema.createTable('users', (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.string('email').unique().notNullable();
        table.string('password').nullable();
        table.string('first_name').nullable();
        table.string('last_name').nullable();
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('users');
    },
  },
  {
    name: '03_create_projects_table',
    up: (knex: Knex) => {
      return knex.schema.createTable('projects', (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.string('name').notNullable();
        table.uuid('admin_id').notNullable().index().references('id').inTable('users');
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('projects');
    },
  },
  {
    name: '04_create_project_invitations_table',
    up: (knex: Knex) => {
      return knex.schema.createTable('project_invitations', (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.uuid('project_id').notNullable().index().references('id').inTable('projects');
        table.uuid('from_user_id').notNullable().index().references('id').inTable('users');
        table.uuid('to_user_id').notNullable().index().references('id').inTable('users');
        table.uuid('key').defaultTo(knex.raw('uuid_generate_v4()')).notNullable();
        table.timestamp('expires_at').notNullable();
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('project_invitations');
    },
  },
  {
    name: '05_create_project_users_table',
    up: (knex: Knex) => {
      return knex.schema.createTable('project_users', (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table
          .uuid('project_id')
          .notNullable()
          .index()
          .references('id')
          .inTable('projects')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table
          .uuid('user_id')
          .notNullable()
          .index()
          .references('id')
          .inTable('users')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('project_users');
    },
  },
  {
    name: '06_create_stripe_columns',
    up: (knex: Knex) => {
      return knex.schema.alterTable('users', (table) => {
        table.string('stripe_id').nullable();
        table.boolean('has_active_subscription').defaultTo(false);
        table.boolean('free_trial_activated').defaultTo(false);
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('users');
    },
  },
  {
    name: '06_create_refresh_tokens',
    up: (knex: Knex) => {
      return knex.schema.createTable('refresh_tokens', (table) => {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
        table.string('session_id').notNullable();
        table.string('subject').notNullable();
        table.string('token').unique().notNullable();
        table.timestamp('expires_at').notNullable();
        table.index('token', 'token_index');
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('refresh_tokens');
    },
  },
] as Array<Migration>;
