import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '../index.js';
import Config from '../config.js';

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  mimetype: string
) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );
};

export const deleteFromS3 = async (key: string) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: key,
    })
  );
};

export const getFromS3 = async (key: string) => {
  return await s3Client.send(
    new GetObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: key,
    })
  );
};
