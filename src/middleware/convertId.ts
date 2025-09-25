import { type RequestHandler } from 'express';
import type { Document } from 'mongoose';

export type WithId<T> = Omit<T, '_id'> & { id: string };

export function convertIdMiddleware<T extends Document>(): RequestHandler {
  const middleware: RequestHandler = (req, res, next) => {
    const oldJson = res.json.bind(res);

    res.json = (data: T | T[] | null) => {
      const convert = (doc: T): WithId<T> => {
        const obj = 'toObject' in doc ? doc.toObject() : doc;
        const { _id, ...rest } = obj;
        return { id: _id.toString(), ...rest } as WithId<T>;
      };

      const result = Array.isArray(data)
        ? data.map(convert)
        : data
          ? convert(data)
          : data;

      return oldJson(result);
    };

    next();
  };

  return middleware;
}
