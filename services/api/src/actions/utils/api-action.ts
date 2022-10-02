import { StatusCodes } from 'http-status-codes';
import { CustomContext } from '../../types';
import snakecase from 'snakecase-keys';

interface ApiResult {
  status?: StatusCodes;
  body: Record<string, unknown>;
}

export const useApiAction = (action: (ctx: CustomContext) => Promise<ApiResult | void>) => {
  return async (ctx: CustomContext) => {
    const response = await action(ctx);

    if (response) {
      ctx.status = response.status || StatusCodes.OK;
      ctx.set('Content-Type', 'application/json');
      ctx.body = snakecase(response.body, { deep: true });
    } else {
      ctx.status = StatusCodes.OK;
    }
  };
};
