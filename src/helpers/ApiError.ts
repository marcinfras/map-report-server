type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(errorCode: ErrorCode, message: string) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = this.getStatusCode(errorCode);
  }

  private getStatusCode(errorCode: ErrorCode): number {
    const statusCodeMap: Record<ErrorCode, number> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      INTERNAL_SERVER_ERROR: 500,
    };

    return statusCodeMap[errorCode] || 500;
  }
}
