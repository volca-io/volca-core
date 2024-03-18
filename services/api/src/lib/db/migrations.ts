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
        table.string('email').notNullable();
        table.string('first_name').nullable();
        table.string('last_name').nullable();
        table.string('stripe_id').nullable();
        table.boolean('has_active_subscription').defaultTo(false);
        table.boolean('free_trial_activated').defaultTo(false);
        table.string('plan_id').nullable().defaultTo(null);
        table.string('picture').nullable();
        table.string('cognito_subject').notNullable().unique();
        table.timestamps(true, true);
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
        table
          .uuid('owner_id')
          .notNullable()
          .index()
          .references('id')
          .inTable('users')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table.timestamps(true, true);
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
        table
          .uuid('project_id')
          .notNullable()
          .index()
          .references('id')
          .inTable('projects')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table
          .uuid('from_user_id')
          .notNullable()
          .index()
          .references('id')
          .inTable('users')
          .onUpdate('CASCADE')
          .onDelete('CASCADE');
        table.timestamp('expires_at').notNullable();
        table.timestamps(true, true);
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
        table.string('role').defaultTo('MEMBER').notNullable();
        table.timestamps(true, true);
      });
    },
    down: (knex: Knex) => {
      return knex.schema.dropTable('project_users');
    },
  },
  {
    name: '06_add_identity_id_to_users',
    up: (knex: Knex) => {
      return knex.schema.alterTable('users', (table) => {
        table.string('cognito_identity_id').notNullable().unique();
      });
    },
    down: (knex: Knex) => {
      return knex.schema.alterTable('users', (table) => {
        table.dropColumn('cognito_identity_id');
      });
    },
  },
] as Array<Migration>;
