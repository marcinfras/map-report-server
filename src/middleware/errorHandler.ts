import type { NextFunction, Request, Response } from "express";

type ErrorType = {
  status: number;
  message: string;
};

export const errorHandler = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, message } = err;
  res.status(status).json({ error: message });
};
