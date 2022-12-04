class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorHandler = this.errorHandler.bind(this);
  }

  errorHandler (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (err.errors) {
      err.message = err.errors[0].message || err.message;
    }
    if (err.response?.data?.message) {
        err.message = err.response.data.message;
        err.status = err.status;
        err.statusCode = err.response.data.statusCode;
    }
    
    return res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
    });
 };
}
module.exports = AppError;
