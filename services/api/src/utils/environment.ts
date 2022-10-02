import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';

import { ErrorNames } from '../constants';
import { ServiceError } from '../errors/service-error';

export enum EnvironmentVariable {
  APP_DOMAIN = 'APP_DOMAIN',
  STAGE = 'STAGE',
  DB_HOST = 'DB_HOST',
  DB_USER = 'DB_USER',
  DB_PASSWORD = 'DB_PASSWORD',
  SKIP_TOKEN_VERIFICATION = 'SKIP_TOKEN_VERIFICATION',
  STRIPE_PRICE_ID = 'STRIPE_PRICE_ID',
  STRIPE_KEY = 'STRIPE_KEY',
  LOG_LEVEL = 'LOG_LEVEL',
  FROM_EMAIL = 'FROM_EMAIL',
  LOGGING_DISABLED = 'LOGGING_DISABLED',
  REGION = 'REGION',
}

@singleton()
export class EnvironmentUtils {
  getOrFail(key: EnvironmentVariable): string {
    const value = this.get(key);

    if (!value) {
      throw new ServiceError({
        name: ErrorNames.ENVIRONMENT_ERROR,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        debug: `Missing value for environment variable with key ${key}`,
      });
    }

    return value;
  }

  get(key: EnvironmentVariable): string | undefined {
    return process.env[key];
  }
}
