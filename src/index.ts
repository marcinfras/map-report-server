import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import Config from './config.js';
import { S3Client } from '@aws-sdk/client-s3';

export const connectDB = async () => {
  try {
    await mongoose.connect(Config.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

export const googleClient = new OAuth2Client(
  Config.GOOGLE_CLIENT_ID,
  Config.GOOGLE_CLIENT_SECRET,
  `${Config.BACKEND_URL}/auth/google/callback`
);

export const s3Client = new S3Client({
  region: Config.AWS_REGION,
  credentials: {
    accessKeyId: Config.AWS_ACCESS_KEY_ID,
    secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
  },
});
