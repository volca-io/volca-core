import Koa from 'koa';
import { CustomContext } from '../types';
import {
  StatusService,
} from '../services';
import { Logger } from '../utils/logger';

export const dependencyInjectionMiddleware = async (ctx: CustomContext, next: Koa.Next) => {
  const logger = new Logger();

  const statusService = new StatusService();

  ctx.dependencies = {
    utils: {
      logger,
    },
    services: {
      statusService,
    },
  };

  await next();
};
