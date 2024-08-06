import { StatusCodes } from 'http-status-codes';
import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { ServiceError } from '../errors/service-error';
import { ErrorNames } from '../constants';
import { Environments } from '../../../../types/types';
import { config } from '@project/config';
import { EnvironmentVariable } from '../types/environment-variables';
export { config };

const Environment = process.env.ENVIRONMENT as keyof Environments;

export const EnvironmentConfig = config.environments[Environment];
export const EnvironmentVariables = {} as Record<EnvironmentVariable, string>;

let cacheTime: Date | undefined;

const fetchFromSSM = async (): Promise<Record<string, string | undefined>> => {
  if (cacheTime) {
    const cacheTimeSeconds = Math.round((cacheTime.getTime() - new Date().getTime()) / 1000);
    if (cacheTimeSeconds < 300) {
      return EnvironmentVariables;
    }
  }

  const environment = process.env.ENVIRONMENT;
  if (!environment) {
    throw new ServiceError({
      name: ErrorNames.ENVIRONMENT_ERROR,
      message: 'An unexpected error occurred',
      debug: 'The environment was not set when trying to resolve environment variables from SSM',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  const key = `/${config.name}/${environment}/api`;
  const client = new SSMClient({ region: config.aws.region });
  const result: Record<string, string | undefined> = {};
  try {
    let nextToken;
    do {
      const command = new GetParametersByPathCommand({
        Path: key,
        WithDecryption: true,
        NextToken: nextToken,
      });
      const { Parameters, NextToken } = await client.send(command);

      (Parameters || []).forEach((parameter) => {
        if (!parameter.Name) {
          throw new ServiceError({
            name: ErrorNames.ENVIRONMENT_ERROR,
            message: 'An unexpected error occurred',
            debug: 'Encountered SSM parameter with undefined name',
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          });
        }

        const splitName = parameter.Name.split('/');
        const parameterName = splitName[splitName.length - 1];

        result[parameterName] = parameter.Value;
        nextToken = NextToken;
      });
    } while (nextToken);
  } catch (err) {
    console.error(err);
    throw new ServiceError({
      name: ErrorNames.ENVIRONMENT_ERROR,
      message: 'An unexpected error occurred',
      debug: 'Failed to fetch secret',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  cacheTime = new Date();
  return result;
};

export const loadEnvironmentVariables = async () => {
  const variables = Environment !== 'local' ? { ...process.env, ...(await fetchFromSSM()) } : process.env;

  for (const envVar of Object.keys(EnvironmentVariable)) {
    const value = variables[envVar];
    if (!value) {
      console.error('Failed to determine value for variable ' + envVar);
      throw new ServiceError({
        name: ErrorNames.ENVIRONMENT_ERROR,
        message: 'An unexpected error occurred',
        debug: 'Failed to fetch secret',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    EnvironmentVariables[envVar as EnvironmentVariable] = value;
  }
};
