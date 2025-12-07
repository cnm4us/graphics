import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

let s3Client: S3Client | null = null;

export const getS3Client = (): S3Client | null => {
  if (!env.s3.region || !env.s3.bucket) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: env.s3.region,
    });
    // eslint-disable-next-line no-console
    console.log(
      `[s3] S3 client initialized for region=${env.s3.region}, bucket=${env.s3.bucket}.`,
    );
  }

  return s3Client;
};

export const uploadImageToS3 = async (
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> => {
  const client = getS3Client();
  if (!client || !env.s3.bucket) {
    throw new Error('S3_NOT_CONFIGURED');
  }

  const command = new PutObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);
};

export const deleteObjectFromS3 = async (key: string): Promise<void> => {
  const client = getS3Client();
  if (!client || !env.s3.bucket) {
    // If S3 is not configured, treat as a no-op.
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: env.s3.bucket,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (error) {
    // For now, log and continue; we want DB state to remain consistent even if S3 cleanup fails.
    // eslint-disable-next-line no-console
    console.error('[s3] Failed to delete object:', key, error);
  }
};

export const logS3Status = (): void => {
  if (env.s3.region && env.s3.bucket) {
    // eslint-disable-next-line no-console
    console.log(
      `[s3] S3 configured with region=${env.s3.region}, bucket=${env.s3.bucket}.`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      '[s3] AWS_REGION/AWS_S3_BUCKET not fully set; S3-backed storage is currently disabled.',
    );
  }
};
