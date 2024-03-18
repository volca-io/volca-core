import jwt from 'jsonwebtoken';

export const generateJwtToken = (payload: Record<string, unknown>) => jwt.sign(payload, 'test-token');
