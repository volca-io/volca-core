import { initialize } from './lib/db/knex';
import { createServer } from './server';

const run = async () => {
  const { server } = await createServer();
  initialize();
  server.listen(4000, () => {
    console.log('🌋 Server is litening at port 4000');
  });
};

run();
