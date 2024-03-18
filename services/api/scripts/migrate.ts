#!/usr/bin/env -S npx tsx
import { initialize } from '../src/lib/db/knex';
import { loadEnvironmentVariables } from '../src/utils/environment';

const run = async (): Promise<void> => {
  loadEnvironmentVariables();
  const action = process.argv.slice(2).pop();
  const database = initialize();

  if (action === 'latest' || !action) {
    await database.migrate.latest();
  }
  if (action === 'up') {
    await database.migrate.up();
  }
  if (action === 'down') {
    await database.migrate.down();
  }

  await database.destroy();
};

run();
