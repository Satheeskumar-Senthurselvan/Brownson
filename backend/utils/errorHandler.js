class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture the stack trace and exclude constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
