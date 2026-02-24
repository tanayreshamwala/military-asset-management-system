export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    "0.0.0.0"
  );
};
