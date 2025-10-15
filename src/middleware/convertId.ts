import { type RequestHandler } from 'express';
import { Document, Types } from 'mongoose';

export type WithId<T> = T extends (infer U)[]
  ? WithId<U>[]
  : T extends Document
    ? Omit<T, '_id'> & { id: string }
    : T extends object
      ? { [K in keyof T as K extends '_id' ? never : K]: WithId<T[K]> } & {
          id?: string;
        }
      : T;

function hasToObject<T>(value: T): value is T & { toObject(): object } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toObject' in value &&
    typeof (value as { toObject?: unknown }).toObject === 'function'
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Object.prototype.toString.call(value) === '[object Object]' &&
    !(value instanceof Date) &&
    !(value instanceof Buffer) &&
    !(value instanceof Types.ObjectId)
  );
}

function replaceIdDeep<T>(value: T): WithId<T> {
  if (Array.isArray(value)) {
    return value.map(v => replaceIdDeep(v)) as WithId<T>;
  }

  if (typeof value === 'object' && value !== null) {
    const obj: object = hasToObject(value) ? value.toObject() : value;

    if (!isPlainObject(obj)) {
      return obj as WithId<T>;
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (key === '_id') {
        result.id = String(val);
      } else {
        result[key] = replaceIdDeep(val);
      }
    }
    return result as WithId<T>;
  }

  return value as WithId<T>;
}

export function convertIdMiddleware<T extends Document>(): RequestHandler {
  const middleware: RequestHandler = (req, res, next) => {
    const oldJson = res.json.bind(res);

    res.json = (data: T | T[] | null) => {
      const result = replaceIdDeep(data);
      return oldJson(result);
    };

    next();
  };

  return middleware;
}
