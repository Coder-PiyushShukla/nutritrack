export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NutriTrack REST API',
    version: '1.0.0',
    description:
      'NutriTrack — Production-ready, secure, role-based nutrition and diet management platform API.',
    contact: {
      name: 'NutriTrack Engineering Team',
      email: 'engineering@nutritrack.io',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'NUTRITIONIST', 'ADMIN'] },
          accountStatus: { type: 'string' },
          profile: { type: 'object' },
          nutritionGoals: { type: 'object' },
        },
      },
      MealLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] },
          localDate: { type: 'string', example: '2026-11-01' },
          time: { type: 'string', example: '08:30' },
          items: { type: 'array' },
          nutritionalTotals: { type: 'object' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          meta: { type: 'object' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'System health probe',
        tags: ['System'],
        responses: { 200: { description: 'API is healthy' } },
      },
    },
    '/health/ready': {
      get: {
        summary: 'Database readiness check',
        tags: ['System'],
        responses: {
          200: { description: 'MongoDB connected and ready' },
          503: { description: 'Database unavailable' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user dieter account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  dietaryPreferences: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Registration successful' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive JWT and refresh cookie',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/users/me/dashboard': {
      get: {
        summary: 'Get real personalized dashboard data for current calendar day',
        tags: ['User'],
        parameters: [
          {
            name: 'date',
            in: 'query',
            schema: { type: 'string', example: '2026-11-01' },
          },
        ],
        responses: { 200: { description: 'Dashboard data retrieved' } },
      },
    },
    '/meals': {
      post: {
        summary: 'Log a meal with immutable nutritional snapshot calculation',
        tags: ['Meals'],
        responses: { 201: { description: 'Meal logged' } },
      },
      get: {
        summary: 'List meal logs for user',
        tags: ['Meals'],
        responses: { 200: { description: 'Meals retrieved' } },
      },
    },
    '/water': {
      post: {
        summary: 'Log water intake',
        tags: ['Water'],
        responses: { 201: { description: 'Water logged' } },
      },
    },
    '/nutritionist/dashboard': {
      get: {
        summary: 'Get clinical nutritionist aggregated dashboard',
        tags: ['Nutritionist'],
        responses: { 200: { description: 'Nutritionist dashboard retrieved' } },
      },
    },
    '/admin/dashboard': {
      get: {
        summary: 'Get platform-wide governance metrics and audit counts',
        tags: ['Admin'],
        responses: { 200: { description: 'Admin dashboard retrieved' } },
      },
    },
  },
};
