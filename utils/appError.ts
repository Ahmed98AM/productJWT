import {Response, Request, NextFunction } from 'express'

interface Error {
    statusCode: number;
    status?: string;
    message?: string;
    response?: any;
    errors?: {message: string}[];
}

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.errorHandler = this.errorHandler.bind(this);
  }

  errorHandler (err: Error , req: Request, res: Response, next: NextFunction) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
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


