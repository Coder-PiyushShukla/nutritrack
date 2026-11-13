import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import crypto from 'crypto';

import { env, isProduction, isTest } from './config/env.js';
import { isDBConnected } from './config/database.js';
import { centralizedErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { sendSuccess, sendError } from './utils/response.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

// Route Imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import mealRoutes from './modules/meals/meal.routes.js';
import waterRoutes from './modules/water/water.routes.js';
import dietPlanUserRoutes from './modules/dietPlans/dietPlan.user.routes.js';
import foodRoutes from './modules/foods/food.routes.js';
import recipeRoutes from './modules/recipes/recipe.routes.js';
import progressRoutes from './modules/progress/progress.routes.js';
import clientRequestRoutes from './modules/assignments/clientRequest.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import nutritionistRoutes from './modules/nutritionists/nutritionist.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

export function createApp() {
  const app = express();

  // 1. Request Correlation ID
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  // 2. Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 3. Strict CORS Whitelist
  const allowedOrigins = env.CLIENT_URL.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // 4. Request Logging
  if (!isTest) {
    app.use(morgan(isProduction ? 'combined' : 'dev'));
  }

  // 5. Body Parsers & Cookie Parser
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // 6. Global Rate Limiter
  app.use('/api/', generalLimiter);

  // 7. Health & Readiness Checks
  app.get('/api/v1/health', (req, res) => {
    return sendSuccess(
      res,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'NutriTrack API is healthy',
      200
    );
  });

  app.get('/api/v1/health/ready', (req, res) => {
    const dbReady = isDBConnected();
    if (!dbReady) {
      return sendError(
        res,
        'Database connection unavailable',
        503,
        'DATABASE_UNAVAILABLE'
      );
    }
    return sendSuccess(
      res,
      { database: 'CONNECTED', status: 'READY' },
      'NutriTrack API is ready to serve traffic',
      200
    );
  });

  // Swagger OpenAPI Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 8. REST API Endpoints Mounting
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/meals', mealRoutes);
  app.use('/api/v1/water', waterRoutes);
  app.use('/api/v1/diet-plans', dietPlanUserRoutes);
  app.use('/api/v1', foodRoutes);
  app.use('/api/v1', recipeRoutes);
  app.use('/api/v1/progress', progressRoutes);
  app.use('/api/v1/client-requests', clientRequestRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/nutritionist', nutritionistRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 9. 404 Route Handler
  app.use((req, res, next) => {
    return sendError(
      res,
      `Cannot ${req.method} ${req.originalUrl}`,
      404,
      'ROUTE_NOT_FOUND'
    );
  });

  // 10. Centralized Error Handling Middleware
  app.use(centralizedErrorHandler);

  return app;
}

export default createApp;
