import crypto from 'crypto';

export const generateNonce = function generateNonce() {
  return crypto.randomBytes(24).toString('hex');
};