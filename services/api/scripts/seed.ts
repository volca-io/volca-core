#!/usr/bin/env -S npx tsx
import { initialize } from '../src/lib/db/knex';

const run = async (): Promise<void> => {
  const database = initialize();
  await database.seed.run();
  await database.destroy();
};

run();
