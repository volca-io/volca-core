import { initialize } from '../lib/db/knex';
import { Logger } from '../utils/logger';

enum MigrationType {
  UP = 'up',
  DOWN = 'down',
  LATEST = 'latest',
}

type MigrationEvent = {
  type: 'up' | 'down' | 'latest';
};

export const handler = async (event: MigrationEvent): Promise<void> => {
  const logger = new Logger();

  const type = event.type || 'latest';

  if (!Object.values(MigrationType).includes(type as MigrationType)) {
    throw new Error(`Unsupported migration type: ${type}`);
  }

  logger.info(`Running ${type} migrations`);

  const database = initialize();
  try {
    const res = await database.migrate[type]();
    logger.info(`Successfully ran ${type} migration`, res);
    database.destroy();
  } catch (error: unknown) {
    logger.error('Failed to run migration');
    database.destroy();
    throw error;
  }
};
