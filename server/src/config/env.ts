export type AppEnv = {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  db: {
    host: string | undefined;
    port: number;
    user: string | undefined;
    password: string | undefined;
    name: string | undefined;
  };
  googleApiKey: string | undefined;
  // Default image-capable model for @google/genai; override via GEMINI_IMAGE_MODEL.
  imageModel: string;
  jwtSecret: string | undefined;
  s3: {
    region: string | undefined;
    bucket: string | undefined;
  };
  cf: {
    domain?: string;
    keyPairId?: string;
    privateKey?: string;
  };
  corsOrigins: string[];
};

const numberFromEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePrivateKey = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  // Support single-line env with literal "\n" sequences.
  if (raw.includes('\\n') && !raw.includes('\n')) {
    return raw.replace(/\\n/g, '\n');
  }
  return raw;
};

const defaultCorsOrigins = [
  'http://localhost:5173',
  'https://graphics.bawebtech.com',
];

const extraCorsOrigins =
  process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

export const env: AppEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: numberFromEnv('PORT', 5000),
  db: {
    host: process.env.DB_HOST,
    port: numberFromEnv('DB_PORT', 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  // Prefer GOOGLE_API_KEY, fall back to GEMINI_API_KEY for @google/genai.
  googleApiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY,
  // Default to Gemini 3 Pro image preview unless overridden.
  imageModel: process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3-pro-image-preview',
  jwtSecret: process.env.JWT_SECRET,
  s3: {
    region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION,
    // Prefer AWS_S3_BUCKET, but fall back to ARGUS_S3_BUCKET to match existing env naming.
    bucket: process.env.AWS_S3_BUCKET ?? process.env.ARGUS_S3_BUCKET,
  },
  cf: {
    domain: process.env.CF_DOMAIN,
    keyPairId: process.env.CF_KEY_PAIR_ID,
    privateKey: normalizePrivateKey(process.env.CF_PRIVATE_KEY_PEM),
  },
  corsOrigins: Array.from(new Set([...defaultCorsOrigins, ...extraCorsOrigins])),
};

export const logEnvSummary = (): void => {
  // eslint-disable-next-line no-console
  console.log('[env] NODE_ENV:', env.nodeEnv);
  // eslint-disable-next-line no-console
  console.log('[env] CORS origins:', env.corsOrigins.join(', ') || '(none)');

  if (!env.googleApiKey) {
    // eslint-disable-next-line no-console
    console.warn('[env] GOOGLE_API_KEY is not set; Gemini AI features will be disabled.');
  }

  if (!env.jwtSecret) {
    // eslint-disable-next-line no-console
    console.warn('[env] JWT_SECRET is not set; auth tokens will use a fallback secret (NOT for production).');
  }

  if (!env.s3.region || !env.s3.bucket) {
    // eslint-disable-next-line no-console
    console.warn('[env] AWS_REGION/AWS_S3_BUCKET not fully set; S3 file storage will be disabled.');
  }

  if (env.cf.domain) {
    if (env.cf.keyPairId && env.cf.privateKey) {
      // eslint-disable-next-line no-console
      console.log(
        `[env] CloudFront signing enabled for domain=${env.cf.domain}.`,
      );
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        '[env] CF_DOMAIN set but CF_KEY_PAIR_ID/CF_PRIVATE_KEY_PEM not fully set; CloudFront signed URLs will be disabled.',
      );
    }
  }
};
