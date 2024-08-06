import { Server } from 'http';
import supertest from 'supertest';
import { createServer } from '../server';
import { initialize } from '../lib/db/knex';
import { Knex } from 'knex';

export function useServer() {
  let serverRef: Server;
  let databaseRef: Knex;

  beforeAll(async () => {
    databaseRef = initialize({
      host: globalThis.__CONTAINER__.getHost(),
      port: globalThis.__CONTAINER__.getPort(),
      database: globalThis.__CONTAINER__.getDatabase(),
      user: globalThis.__CONTAINER__.getUsername(),
      password: globalThis.__CONTAINER__.getPassword(),
      ssl: false,
    });

    const { server } = await createServer();
    serverRef = server.listen();
  });

  afterAll(() => {
    return Promise.all([databaseRef.destroy(), serverRef.close()]);
  });

  return () => supertest(serverRef);
}
