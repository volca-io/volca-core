import { Logger } from '../utils/logger';
import { initialize } from '../lib/db/knex';

export const handler = async () => {
  const logger = new Logger();
  logger.info(`Running seeder`);

  const database = initialize();

  try {
    const res = await database.seed.run();
    logger.info(`Successfully ran seeds`, { seeds: res });
    database.destroy();
  } catch (error: unknown) {
    logger.error('Failed to run seeder');
    database.destroy();
    throw error;
  }
};
