import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/index.js';
import Config from '@/config.js';

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

export const getBase64ImageFromS3 = async (key: string) => {
  const s3Object = await getFromS3(key);

  const chunks: Buffer[] = [];
  for await (const chunk of s3Object.Body as AsyncIterable<Buffer>) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};
