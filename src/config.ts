import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  SERVER_PORT: number;
  MONGODB_URI: string;
  SESSION_SECRET: string;
  CLIENT_URL: string;
  BACKEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_BUCKET_NAME: string;
}

const Config: AppConfig = {
  SERVER_PORT: +(process.env.SERVER_PORT || '3000'),
  MONGODB_URI:
    process.env.MONGODB_URI ??
    (() => {
      throw new Error('MONGODB_URI is not defined in environment variables');
    })(),
  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    (() => {
      throw new Error('SESSION_SECRET is not defined in environment variables');
    })(),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID ??
    (() => {
      throw new Error(
        'GOOGLE_CLIENT_ID is not defined in environment variables'
      );
    })(),
  GOOGLE_CLIENT_SECRET:
    process.env.GOOGLE_CLIENT_SECRET ??
    (() => {
      throw new Error(
        'GOOGLE_CLIENT_SECRET is not defined in environment variables'
      );
    })(),
  AWS_ACCESS_KEY_ID:
    process.env.AWS_ACCESS_KEY_ID ??
    (() => {
      throw new Error(
        'AWS_ACCESS_KEY_ID is not defined in environment variables'
      );
    })(),
  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY ??
    (() => {
      throw new Error(
        'AWS_SECRET_ACCESS_KEY is not defined in environment variables'
      );
    })(),
  AWS_REGION:
    process.env.AWS_REGION ??
    (() => {
      throw new Error('AWS_REGION is not defined in environment variables');
    })(),
  AWS_BUCKET_NAME:
    process.env.AWS_BUCKET_NAME ??
    (() => {
      throw new Error(
        'AWS_AWS_BUCKET_NAME is not defined in environment variables'
      );
    })(),
};

export default Config;
