import Koa from 'koa';
import cors from '@koa/cors';
import { container } from 'tsyringe';
import { createRouter } from './router';
import { requestLoggingMiddleware, correlationIdMiddleware, errorHandlingMiddleware } from './middlewares';
import { EnvironmentUtils, EnvironmentVariable } from './utils/environment';

export const createServer = (): Koa => {
  const app = new Koa();
  const router = createRouter();

  const environment = container.resolve(EnvironmentUtils);

  app.use(
    cors({
      origin:
        environment.getOrFail(EnvironmentVariable.STAGE) === 'local'
          ? 'http://127.0.0.1:3000'
          : `https://${environment.getOrFail(EnvironmentVariable.APP_DOMAIN)}`,
      credentials: true,
    })
  );

  app.use(correlationIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(errorHandlingMiddleware);

  app.use(router.routes()).use(router.allowedMethods());

  return app;
};
