import Knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { container } from 'tsyringe';
import { EnvironmentUtils, EnvironmentVariable } from '../../utils/environment';
import { Logger } from '../../utils/logger';
import { MigrationSource } from './migration-source';
import { SeedSource } from './seed-source';

export const initialize = () => {
  const logger = container.resolve(Logger);
  const environment = container.resolve(EnvironmentUtils);

  logger.debug('Creating new knex client');

  const knex = Knex({
    client: 'postgres',
    useNullAsDefault: true,
    connection: {
      host: environment.getOrFail(EnvironmentVariable.DB_HOST),
      port: 5432,
      user: environment.getOrFail(EnvironmentVariable.DB_USER),
      password: environment.getOrFail(EnvironmentVariable.DB_PASSWORD),
      database: 'postgres',
      pool: { min: 1, max: 1, idleTimeoutMillis: 1000 },
    },
    migrations: {
      migrationSource: new MigrationSource(),
    },
    seeds: {
      seedSource: new SeedSource(),
    },
    ...knexSnakeCaseMappers(),
  });

  Model.knex(knex);

  return knex;
};
