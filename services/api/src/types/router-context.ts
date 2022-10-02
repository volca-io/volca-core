import { RouterContext } from '@koa/router';

export interface CustomContext extends RouterContext {
  correlationId: string;
}
