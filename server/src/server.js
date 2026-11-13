import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/database.js';
import { env } from './config/env.js';
import { initSocketServer } from './services/socket/socket.service.js';

async function startServer() {
  try {
    console.log('🌿 Initializing NutriTrack Backend Infrastructure...');

    // 1. Connect to MongoDB (Resilient: non-fatal in local dev so Socket.IO and HTTP still boot)
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn(`⚠️  MongoDB connection warning: ${dbErr.message}`);
      console.warn('⚠️  Server will continue running HTTP & Socket.IO services on port ' + env.PORT);
    }

    // 2. Initialize Express App
    const app = createApp();

    // 3. Create HTTP Server & Mount Socket.IO
    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    // 4. Start Listening
    const server = httpServer.listen(env.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 NutriTrack Server running on port ${env.PORT}`);
      console.log(`📡 Environment:  ${env.NODE_ENV}`);
      console.log(`🌐 Base URL:     ${env.API_BASE_URL}`);
      console.log(`⚡ WebSocket:    ws://localhost:${env.PORT} (Socket.IO Ready)`);
      console.log(`🏥 Health Check: http://localhost:${env.PORT}/api/v1/health`);
      console.log(`🏥 Readiness:    http://localhost:${env.PORT}/api/v1/health/ready`);
      console.log(`======================================================\n`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP & WebSocket server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start NutriTrack Server:', err.message);
    process.exit(1);
  }
}

startServer();
