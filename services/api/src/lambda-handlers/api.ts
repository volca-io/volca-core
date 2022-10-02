/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'reflect-metadata';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import serverless from 'serverless-http';

import { createServer } from '../server';
import { initialize } from '../lib/db/knex';
import { Knex } from 'knex';

let knex: Knex;

const server = createServer();
const serverlessHandler = serverless(server);

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!knex) {
    knex = initialize();
  }

  return serverlessHandler(event, context);
};
