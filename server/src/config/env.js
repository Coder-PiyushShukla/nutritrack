import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_BASE_URL: z.string().default('http://localhost:5000/api/v1'),
  CLIENT_URL: z.string().default('http://localhost:5173,http://localhost:5174'),
  
  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_TEST_URI: z.string().default('mongodb://127.0.0.1:27017/nutritrack_test'),

  // Authentication & Cryptography
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_ISSUER: z.string().default('nutritrack-auth'),
  JWT_AUDIENCE: z.string().default('nutritrack-client'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters long'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),

  // Email (Optional — gracefully report if unconfigured)
  EMAIL_HOST: z.string().optional().default(''),
  EMAIL_PORT: z.coerce.number().optional().default(587),
  EMAIL_USER: z.string().optional().default(''),
  EMAIL_PASSWORD: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('"NutriTrack Health" <no-reply@nutritrack.io>'),

  // External Food Data Provider (Optional — USDA)
  FOOD_DATA_PROVIDER: z.string().default('usda'),
  FOOD_DATA_API_KEY: z.string().optional().default(''),

  // Storage
  FILE_STORAGE_PROVIDER: z.enum(['local', 's3', 'cloudinary']).default('local'),
  FILE_STORAGE_BUCKET: z.string().optional().default(''),
  FILE_STORAGE_ACCESS_KEY: z.string().optional().default(''),
  FILE_STORAGE_SECRET_KEY: z.string().optional().default(''),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ FATAL: Environment validation failed:');
  parsedEnv.error.issues.forEach((issue) => {
    console.error(`  - [${issue.path.join('.')}] ${issue.message}`);
  });
  throw new Error('Environment configuration validation failure');
}

export const env = parsedEnv.data;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDevelopment = env.NODE_ENV === 'development';
