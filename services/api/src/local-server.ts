import { createServer } from './server';

const run = async () => {
  const { server } = await createServer();
  server.listen(4000, () => {
    console.log('🌋 Server is litening at port 4000');
  });
};

run();
