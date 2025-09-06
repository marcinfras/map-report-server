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
};

export default Config;
