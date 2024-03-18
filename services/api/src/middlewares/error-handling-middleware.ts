import Koa from 'koa';
import * as Sentry from '@sentry/node';
import { ServiceError } from '../errors/service-error';
import { ErrorNames } from '../constants';
import { EnvironmentConfig } from '../utils/environment';
import { CustomContext } from '../types';

const logError = (ctx: CustomContext, error: unknown) => {
  if (EnvironmentConfig.sentry) {
    Sentry.withScope((scope) => {
      scope.addEventProcessor((event) => {
        return Sentry.addRequestDataToEvent(event, ctx.request as unknown as Sentry.PolymorphicRequest);
      });
      Sentry.captureException(error);
    });
  }
};

export const errorHandlingMiddleware = async (ctx: CustomContext, next: Koa.Next) => {
  const {
    dependencies: {
      utils: { logger },
    },
  } = ctx;

  try {
    await next();
  } catch (error: unknown) {
    if (error instanceof ServiceError) {
      logger.error(error.message, { status: error.statusCode, name: error.name, debug: error.debug });

      ctx.status = error.statusCode;
      ctx.body = {
        name: error.name,
        message: error.message,
      };

      if (error.statusCode >= 500 && error.statusCode <= 599) {
        logError(ctx, error);
      }
    } else {
      if (error instanceof Error) {
        logger.error(error.message, { stackTrace: error.stack });
      } else {
        logger.error('An error of unknown type was caught');
      }

      ctx.status = 500;
      ctx.body = {
        name: ErrorNames.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
      };

      logError(ctx, error);
    }
  }
};
