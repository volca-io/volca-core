/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';
import { Knex } from 'knex';
import Koa from 'koa';
import { createServer } from '../server';
import { loadEnvironmentVariables } from '../utils/environment';
import { initialize } from '../lib/db/knex';

let serverRef: Koa;
let databaseRef: Knex;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  await loadEnvironmentVariables();

  context.callbackWaitsForEmptyEventLoop = false;

  if (!databaseRef || serverRef) {
    const { server } = await createServer();
    const database = initialize();

    serverRef = server;
    databaseRef = database;
  }

  const serverlessHandler = serverless(serverRef);
  return serverlessHandler(event, context);
};
