import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { EnvironmentVariables } from '../../utils/environment';
import { Logger } from '../../utils/logger';
import { MigrationSource } from './migration-source';
import { SeedSource } from './seed-source';

type DatabaseConnectionParams = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: knex.Knex<any, unknown[]> | null = null;

export const initialize = (connection?: DatabaseConnectionParams) => {
  const logger = new Logger();
  logger.debug('Creating new knex client');

  const config: knex.Knex.Config = {
    client: 'pg',
    useNullAsDefault: true,
    connection: {
      host: connection?.host ?? EnvironmentVariables.DB_HOST,
      port: connection?.port ?? parseInt(EnvironmentVariables.DB_PORT, 10),
      user: connection?.user ?? EnvironmentVariables.DB_USERNAME,
      password: connection?.password ?? EnvironmentVariables.DB_PASSWORD,
      database: connection?.database ?? 'postgres',
      pool: { min: 1, max: 1, idleTimeoutMillis: 1000 },
      ssl: connection?.ssl ?? EnvironmentVariables.ENVIRONMENT !== 'local',
    },
    migrations: {
      migrationSource: new MigrationSource(),
    },
    seeds: {
      seedSource: new SeedSource(),
    },

    ...knexSnakeCaseMappers(),
  };

  if (!db) db = knex(config);

  Model.knex(db);

  return db;
};
