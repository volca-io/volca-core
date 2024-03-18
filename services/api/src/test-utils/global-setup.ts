import 'tsconfig-paths/register';

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { initialize } from '../lib/db/knex';

export default async () => {
  const container = await new PostgreSqlContainer().start();
  const database = initialize({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    user: container.getUsername(),
    password: container.getPassword(),
    ssl: false,
  });

  await database.migrate.latest();
  await database.seed.run();

  globalThis.__DATABASE__ = database;
  globalThis.__CONTAINER__ = container;
};
