import type { ErrorCodes } from './errorCodes.js';

export class DatabaseError extends Error {
  code: ErrorCodes;

  constructor(code: ErrorCodes, message: string) {
    super(message);
    this.code = code;
    this.name = 'DatabaseError';
  }
}
