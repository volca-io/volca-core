import winston from 'winston';
import { injectable } from 'tsyringe';
import correlator from 'correlation-id';
import { EnvironmentUtils, EnvironmentVariable } from './environment';

export enum LoggingFormat {
  JSON = 'json',
  SIMPLE = 'simple',
}

enum LogLevel {
  info = 'info',
  error = 'error',
  debug = 'debug',
  warn = 'warn',
}

interface LoggingConfig {
  level: 'info' | 'error' | 'debug' | 'warn';
  format: LoggingFormat;
  defaultMeta?: Record<string, unknown>;
  silent?: boolean;
}

const simpleLoggingFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

const getLoggingFormat = (format: LoggingFormat) => {
  switch (format) {
    case LoggingFormat.JSON:
      return winston.format.json();
    case LoggingFormat.SIMPLE:
      return simpleLoggingFormat;
  }
};

const createLogger = ({ level, format, defaultMeta = {}, silent = false }: LoggingConfig) => {
  return winston.createLogger({
    level,
    format: getLoggingFormat(format),
    defaultMeta: defaultMeta,
    transports: [new winston.transports.Console()],
    silent,
  });
};

@injectable()
export class Logger {
  private logger;

  public constructor(private environment: EnvironmentUtils) {
    const definedLevel = this.environment.get(EnvironmentVariable.LOG_LEVEL) || 'info';
    const disabled = this.environment.get(EnvironmentVariable.LOGGING_DISABLED) || 'false';

    const level = LogLevel[definedLevel as keyof typeof LogLevel];

    this.logger = createLogger({
      level,
      format: this.environment.getOrFail(EnvironmentVariable.STAGE) ? LoggingFormat.SIMPLE : LoggingFormat.JSON,
      silent: disabled === 'true',
    });
  }

  private buildMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    const correlationId = correlator.getId();
    return {
      ...meta,
      ...(correlationId ? { correlationId } : {}),
    };
  }

  trace(msg: string, meta?: Record<string, unknown>) {
    this.logger.log('trace', msg, this.buildMetadata(meta));
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.logger.debug(msg, this.buildMetadata(meta));
  }

  info(msg: string, meta?: Record<string, unknown>) {
    this.logger.info(msg, this.buildMetadata(meta));
  }

  warn(msg: string, meta?: Record<string, unknown>) {
    this.logger.warn(msg, this.buildMetadata(meta));
  }

  error(msg: string, meta?: Record<string, unknown>) {
    this.logger.error(msg, this.buildMetadata(meta));
  }

  fatal(msg: string, meta?: Record<string, unknown>) {
    this.logger.log('fatal', msg, this.buildMetadata(meta));
  }
}
