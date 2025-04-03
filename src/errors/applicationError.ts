import type { ErrorCodes } from './errorCodes.js';

export class ApplicationError extends Error {
  code: ErrorCodes;

  constructor(code: ErrorCodes, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApplicationError';
  }
}
