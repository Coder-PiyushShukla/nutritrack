import mongoose from 'mongoose';
import { env, isTest } from './env.js';

let isConnected = false;

export async function connectDB(uri = null) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const targetUri = uri || (isTest ? env.MONGODB_TEST_URI : env.MONGODB_URI);

  mongoose.connection.on('connected', () => {
    isConnected = true;
    if (!isTest) console.log(`🌿 MongoDB connected successfully: ${targetUri}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    if (!isTest) console.warn('⚠️  MongoDB disconnected');
  });

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, // Build indexes in dev/test
    });
    isConnected = true;
    return conn;
  } catch (err) {
    console.error(`❌ Failed to connect to MongoDB at ${targetUri}:`, err.message);
    throw err;
  }
}

export async function disconnectDB() {
  if (!isConnected && mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  isConnected = false;
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// Graceful process shutdown handling
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});
