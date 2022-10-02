import { Next } from 'koa';
import joi from 'joi';
import { CustomContext } from '../types';
import { ServiceError } from '../errors/service-error';
import { StatusCodes } from 'http-status-codes';
import { ErrorNames } from '../constants';

export const schemaValidationMiddleware = (schema: joi.Schema) => {
  return async (ctx: CustomContext, next: Next) => {
    const { body } = ctx.request;
    if (!body) {
      throw new ServiceError({
        name: ErrorNames.VALIDATION_ERROR,
        message: 'Missing request body',
        debug: 'ctx.request.body was not set',
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const res = schema.validate(ctx.request.body);

    if (res.error) {
      throw new ServiceError({
        name: ErrorNames.VALIDATION_ERROR,
        message: res.error?.message,
        debug: 'Joi validation failed for request body',
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    return next();
  };
};
