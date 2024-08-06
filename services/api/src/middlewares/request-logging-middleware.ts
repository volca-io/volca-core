import Koa from 'koa';
import { RouterContext } from '@koa/router';

export const requestLoggingMiddleware = async (ctx: RouterContext, next: Koa.Next) => {
  const {
    dependencies: {
      utils: { logger },
    },
  } = ctx;

  logger.info('Started handling request', {
    path: ctx.path,
    method: ctx.method,
    body: ctx.request.body,
  });

  await next();

  logger.info('Completed handling request', {
    path: ctx.path,
    method: ctx.method,
    body: ctx.response.body,
    status: ctx.status,
  });
};
