import 'reflect-metadata';
import { container } from 'tsyringe';

import { Logger } from '../utils/logger';
import { initialize } from '../lib/db/knex';

enum MigrationType {
  UP = 'up',
  DOWN = 'down',
  LATEST = 'latest',
}

type MigrationEvent = {
  type: 'up' | 'down' | 'latest';
};

export const handler = async (event: MigrationEvent): Promise<void> => {
  const logger = container.resolve(Logger);

  if (!event.type) throw new Error('No migration type specified');

  if (!Object.values(MigrationType).includes(event.type as MigrationType)) {
    throw new Error(`Unsupported migration type: ${event.type}`);
  }

  logger.info(`Running ${event.type} migrations`);

  const knex = initialize();
  try {
    const res = await knex.migrate[event.type]();
    logger.info(`Successfully ran ${event.type} migration`, res);
    knex.destroy();
  } catch (error: unknown) {
    logger.error('Failed to run migration');
    knex.destroy();
    throw error;
  }
};
