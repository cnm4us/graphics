import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { env } from '../config/env.js';

const isConfigured = (): boolean =>
  Boolean(env.cf.domain && env.cf.keyPairId && env.cf.privateKey);

/**
 * Create a CloudFront signed URL for an object key in the graphics media
 * distribution. Returns undefined if CloudFront signing is not configured.
 */
export const getSignedImageUrl = (
  s3Key: string,
  expiresInSeconds = 600,
): string | undefined => {
  if (!isConfigured()) {
    return undefined;
  }

  const baseDomain = env.cf.domain!;
  const trimmedKey = s3Key.startsWith('/') ? s3Key.slice(1) : s3Key;
  const url = `https://${baseDomain}/${trimmedKey}`;

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  try {
    return getSignedUrl({
      url,
      keyPairId: env.cf.keyPairId!,
      privateKey: env.cf.privateKey!,
      dateLessThan: expiresAt.toISOString(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[cloudfront] Failed to sign URL:', error);
    return undefined;
  }
};

