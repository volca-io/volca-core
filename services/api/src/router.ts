import Router from '@koa/router';
import Application from 'koa';
import body from 'koa-bodyparser';

import { statusAction } from './actions/status';

import { CustomContext } from './types';

export const createRouter = (): Router<Application.DefaultState, CustomContext> => {
  const router = new Router<Application.DefaultState, CustomContext>();

  // Pre action middlewares
  router.use(body());

  // Actions

  // Status
  router.get('/status', statusAction);


  // Post action middlewares

  return router;
};
