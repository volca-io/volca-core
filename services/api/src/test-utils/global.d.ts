/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
declare namespace globalThis {
  var __DATABASE__: Knex<any, unknown[]>;
  var __CONTAINER__: StartedPostgreSqlContainer;
}
