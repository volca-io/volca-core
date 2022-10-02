import { injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import { ServiceError } from '../../errors/service-error';
import { ErrorNames } from '../../constants';

interface SigningKey {
  kid: string;
  secret: string;
}

@injectable()
export class Security {
  // TODO - This has to be moved to a config or a database
  public signingKeys = [
    {
      kid: '443985e5-f659-4374-8cff-b1b62ed5cc93',
      secret: 'b405204a081b33f6a0794765e68d91a638a72d78be47dd057fbcf286fa0b3885',
    },
  ] as Array<SigningKey>;

  public verifyPassword(hash: string, plain: string): boolean {
    return bcrypt.compareSync(plain, hash);
  }

  public hashPassword(password: string): string {
    return bcrypt.hashSync(password);
  }

  public createTokenWithSecret(
    payload: Record<string, unknown>,
    expiresIn: string | number | undefined,
    secret: string
  ): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  public verifyTokenWithSecret(token: string, secret: string) {
    jwt.verify(token, secret);
  }

  public createAccessToken(payload: Record<string, unknown>, expiresIn: string | number | undefined): string {
    const { kid, secret } = this.signingKeys[0];

    return jwt.sign(payload, secret, { expiresIn, keyid: kid });
  }

  public createRefreshToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  public verifyToken(token: string): JwtPayload {
    const kid = this.getKeyId(token);

    const key = this.signingKeys.find((key) => key.kid === kid);

    if (!key) {
      throw new ServiceError({
        name: ErrorNames.AUTHORIZATION_FAILED,
        message: 'Token validation failed',
        debug: `Unable to find a matching signing kid for kid ${kid}`,
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    try {
      const result = jwt.verify(token, key.secret);

      if (typeof result !== 'object') {
        throw new ServiceError({
          name: ErrorNames.INTERNAL_SERVER_ERROR,
          message: 'Token validation failed',
          debug: `Token verification did not return an object. Returned type was ${typeof result}`,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      return result;
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      throw new ServiceError({
        name: ErrorNames.AUTHORIZATION_FAILED,
        message: 'Token validation failed',
        debug: error.message,
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  }

  private getKeyId(token: string): string | undefined {
    const decoded = jwt.decode(token, { complete: true });

    return decoded?.header.kid;
  }

  public decodeToken(token: string): JwtPayload {
    const decoded = jwt.decode(token);

    if (!decoded) {
      throw new ServiceError({
        name: ErrorNames.AUTHORIZATION_FAILED,
        message: 'Token validation failed',
        debug: 'Unable to decode token',
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    if (typeof decoded !== 'object') {
      throw new ServiceError({
        name: ErrorNames.INTERNAL_SERVER_ERROR,
        message: 'Token validation failed',
        debug: `Token verification did not return an object. Returned type was ${typeof decoded}`,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    return decoded as JwtPayload;
  }
}
