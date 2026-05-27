class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

class ServerError extends AppError {
  constructor(message = 'An error occurred while processing your request') {
    super(message, 500);
  }
}

module.exports = { AppError, NotFoundError, ValidationError, ServerError };
