import Koa from 'koa';
import cors from '@koa/cors';
import * as Sentry from '@sentry/node';
import { createRouter } from './router';
import {
  requestLoggingMiddleware,
  correlationIdMiddleware,
  errorHandlingMiddleware,
  dependencyInjectionMiddleware,
} from './middlewares';
import { EnvironmentConfig, EnvironmentVariables, loadEnvironmentVariables } from './utils/environment';

export const createServer = async (): Promise<{ server: Koa }> => {
  await loadEnvironmentVariables();

  const app = new Koa();
  const router = createRouter();

  app.use(dependencyInjectionMiddleware);

  if (EnvironmentConfig.sentry) {
    Sentry.init({
      dsn: EnvironmentConfig.sentry.apiDsn,
      environment: process.env.ENVIRONMENT,
    });
  }

  app.use(
    cors({
      origin: EnvironmentVariables.APP_DOMAIN,
      credentials: true,
    })
  );

  app.use(correlationIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(errorHandlingMiddleware);

  app.use(router.routes()).use(router.allowedMethods());

  return { server: app };
};
