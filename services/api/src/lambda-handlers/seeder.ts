import 'reflect-metadata';
import { container } from 'tsyringe';

import { Logger } from '../utils/logger';
import { initialize } from '../lib/db/knex';

export const handler = async () => {
  const logger = container.resolve(Logger);

  logger.info(`Running seeder`);

  const knex = initialize();
  try {
    const res = await knex.seed.run();
    logger.info(`Successfully ran seeds`, { seeds: res });
    knex.destroy();
  } catch (error: unknown) {
    logger.error('Failed to run seeder');
    knex.destroy();
    throw error;
  }
};
