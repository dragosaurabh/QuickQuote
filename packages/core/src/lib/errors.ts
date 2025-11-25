// Error types for QuickQuote

export class QuickQuoteError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'QuickQuoteError';
  }
}

export class ValidationError extends QuickQuoteError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends QuickQuoteError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends QuickQuoteError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends QuickQuoteError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DB_ERROR', 500);
    this.name = 'DatabaseError';
  }
}

// Note: Halloween-themed error messages are now in halloween-messages.ts
