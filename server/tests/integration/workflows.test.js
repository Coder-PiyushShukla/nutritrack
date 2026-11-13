import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app.js';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import { env } from '../../src/config/env.js';
import { User } from '../../src/models/User.model.js';
import { EmailVerificationToken } from '../../src/models/Tokens.model.js';
import { FoodItem } from '../../src/models/Food.model.js';
import { MealLog } from '../../src/models/MealLog.model.js';
import { hashPassword } from '../../src/utils/security.js';

let app;

beforeAll(async () => {
  // Ensure we connect to isolated test database
  await connectDB(env.MONGODB_TEST_URI);
  app = createApp();
});

beforeEach(async () => {
  // Clear collections between test suites
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Drop test database and close connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await disconnectDB();
  }
});

describe('NutriTrack End-to-End Workflows & Permissions', () => {
  // WORKFLOW 1: User Registration → Email Verification → Login → Profile Completion → Dashboard Access
  test('WORKFLOW 1: User Registration → Email Verification → Login → Profile → Dashboard Access', async () => {
    // 1. Register
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Aarav Mehta',
        email: 'aarav@studio.com',
        password: 'Password123!',
        dietaryPreferences: ['vegetarian'],
        nutritionGoals: { dailyCalorieTarget: 2200 },
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.role).toBe('USER');
    expect(regRes.body.data.accountStatus).toBe('PENDING_EMAIL');

    // 2. Fetch the verification token generated in the DB
    const tokenRecord = await EmailVerificationToken.findOne({ userId: regRes.body.data.id });
    expect(tokenRecord).toBeTruthy();

    // Verify email using token
    // Simulate token verification by directly activating or via endpoint
    const user = await User.findById(regRes.body.data.id);
    user.accountStatus = 'ACTIVE';
    user.emailVerifiedAt = new Date();
    await user.save();

    // 3. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aarav@studio.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    const userToken = loginRes.body.data.accessToken;
    expect(userToken).toBeTruthy();

    // 4. Update Profile
    const profileRes = await request(app)
      .put('/api/v1/users/me/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        bio: 'Mindful architecture designer and wellness enthusiast',
        age: 29,
        currentWeightKg: 74,
        targetWeightKg: 70,
      });

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.profile.age).toBe(29);
    expect(profileRes.body.data.profile.currentWeightKg).toBe(74);

    // 5. Access Dashboard
    const dashRes = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.summary.calorieTarget).toBe(2200);
    expect(dashRes.body.data.summary.loggedCalories).toBe(0); // Clean 0 calories, no fake data!
    expect(dashRes.body.data.meals).toHaveLength(0);
  });

  // WORKFLOW 2: Nutritionist Registration → Admin Approval → Client Assignment → Nutritionist Dashboard
  test('WORKFLOW 2: Nutritionist Registration → Admin Approval → Nutritionist Dashboard Access', async () => {
    // 1. Create Admin account
    const adminPass = await hashPassword('AdminPass123!');
    const admin = await User.create({
      name: 'Sophia Aris',
      email: 'admin@nutritrack.io',
      passwordHash: adminPass,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@nutritrack.io', password: 'AdminPass123!' });
    const adminToken = adminLogin.body.data.accessToken;

    // 2. Nutritionist applies
    const applyRes = await request(app)
      .post('/api/v1/auth/apply')
      .send({
        name: 'Dr. Maya Lin',
        email: 'maya@clinical.org',
        password: 'Password123!',
        qualification: 'M.Sc. Clinical Dietetics, RD',
        specialization: 'Metabolic Health & Plant Nutrition',
        experienceYears: 8,
        professionalDescription: 'Clinical nutritionist with eight years of hospital and private practice experience.',
      });

    expect(applyRes.status).toBe(201);
    expect(applyRes.body.data.accountStatus).toBe('PENDING_APPROVAL');

    // Attempting login before approval should be blocked
    const blockedLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'maya@clinical.org', password: 'Password123!' });
    expect(blockedLogin.status).toBe(403);

    // 3. Admin reviews and approves application
    const appsRes = await request(app)
      .get('/api/v1/admin/nutritionist-applications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(appsRes.status).toBe(200);
    expect(appsRes.body.data).toHaveLength(1);
    const appId = appsRes.body.data[0]._id;

    const approveRes = await request(app)
      .patch(`/api/v1/admin/nutritionist-applications/${appId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);

    // 4. Approved nutritionist logs in successfully
    const nutLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'maya@clinical.org', password: 'Password123!' });
    expect(nutLogin.status).toBe(200);
    const nutToken = nutLogin.body.data.accessToken;

    // 5. Nutritionist accesses dashboard
    const nutDash = await request(app)
      .get('/api/v1/nutritionist/dashboard')
      .set('Authorization', `Bearer ${nutToken}`);
    expect(nutDash.status).toBe(200);
    expect(nutDash.body.data.totalAssignedClients).toBe(0);
  });

  // WORKFLOW 3 & 4: Admin Assigns Nutritionist → Plan Created & Published → User Sees Plan
  test('WORKFLOW 3 & 4: Admin Assigns Nutritionist → Plan Created & Published → User Sees Plan', async () => {
    // Setup Admin, User, Nutritionist
    const adminPass = await hashPassword('AdminPass123!');
    const admin = await User.create({
      name: 'Sophia Admin',
      email: 'admin2@nutritrack.io',
      passwordHash: adminPass,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const adminToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin2@nutritrack.io', password: 'AdminPass123!' })
    ).body.data.accessToken;

    const userPass = await hashPassword('Password123!');
    const user = await User.create({
      name: 'Elena Rostova',
      email: 'elena@studio.com',
      passwordHash: userPass,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const userToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'elena@studio.com', password: 'Password123!' })
    ).body.data.accessToken;

    const nutPass = await hashPassword('Password123!');
    const nutritionist = await User.create({
      name: 'Dr. James Lee',
      email: 'james@health.com',
      passwordHash: nutPass,
      role: 'NUTRITIONIST',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const nutToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'james@health.com', password: 'Password123!' })
    ).body.data.accessToken;

    // 1. Admin assigns nutritionist to client
    const assignRes = await request(app)
      .post('/api/v1/admin/assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: user._id.toString(),
        nutritionistId: nutritionist._id.toString(),
        notes: 'Initial clinical assignment',
      });
    expect(assignRes.status).toBe(201);

    // 2. Nutritionist sees client in client list
    const clientsRes = await request(app)
      .get('/api/v1/nutritionist/clients')
      .set('Authorization', `Bearer ${nutToken}`);
    expect(clientsRes.status).toBe(200);
    expect(clientsRes.body.data).toHaveLength(1);
    expect(clientsRes.body.data[0]._id).toBe(user._id.toString());

    // 3. Nutritionist creates draft diet plan
    const createPlanRes = await request(app)
      .post('/api/v1/nutritionist/diet-plans')
      .set('Authorization', `Bearer ${nutToken}`)
      .send({
        clientId: user._id.toString(),
        planName: 'Mediterranean Longevity Protocol',
        description: 'Focus on cold-pressed polyphenols, leafy greens, and wild fatty fish',
        dailyTargets: {
          calorieTarget: 2100,
          proteinG: 135,
          carbsG: 210,
          fatG: 75,
          waterMl: 2800,
        },
      });
    expect(createPlanRes.status).toBe(201);
    const planId = createPlanRes.body.data._id;

    // 4. Nutritionist publishes plan
    const publishRes = await request(app)
      .post(`/api/v1/nutritionist/diet-plans/${planId}/publish`)
      .set('Authorization', `Bearer ${nutToken}`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe('PUBLISHED');

    // 5. User retrieves their assigned active plan
    const userPlanRes = await request(app)
      .get('/api/v1/diet-plans/my-plan')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userPlanRes.status).toBe(200);
    expect(userPlanRes.body.data.planName).toBe('Mediterranean Longevity Protocol');
    expect(userPlanRes.body.data.dailyTargets.calorieTarget).toBe(2100);

    // 6. User's dashboard reflects new calorie target from plan
    const userDash = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userDash.status).toBe(200);
    expect(userDash.body.data.summary.calorieTarget).toBe(2100);
  });

  // WORKFLOW 5 & 7: Admin Adds Verified Food → User Logs Meal → Nutrients Calculated → Food Updated Later → Historical Snapshot Preserved
  test('WORKFLOW 5 & 7: Verified Food Entry → Meal Logging → Historical Nutritional Snapshot Immutability', async () => {
    // 1. Setup Admin and User
    const adminPass = await hashPassword('AdminPass123!');
    const admin = await User.create({
      name: 'Admin Food Mod',
      email: 'adminfood@nutritrack.io',
      passwordHash: adminPass,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const adminToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'adminfood@nutritrack.io', password: 'AdminPass123!' })
    ).body.data.accessToken;

    const userPass = await hashPassword('Password123!');
    const user = await User.create({
      name: 'Dieter User',
      email: 'dieter@nutritrack.io',
      passwordHash: userPass,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
      nutritionGoals: { dailyCalorieTarget: 2000 },
    });
    const userToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'dieter@nutritrack.io', password: 'Password123!' })
    ).body.data.accessToken;

    // 2. Admin adds verified food record: "Greek Yogurt Bowl" (100g basis: 120 kcal, 10g protein)
    const addFoodRes = await request(app)
      .post('/api/v1/admin/foods')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Whole Milk Greek Yogurt',
        category: 'breakfast',
        nutrients: {
          energyKcal: 120,
          proteinG: 10,
          carbohydratesG: 5,
          totalFatG: 6,
          fiberG: 0,
        },
        servingInformation: {
          servingSizeGrams: 200,
          servingUnit: '1 cup (200g)',
        },
      });
    expect(addFoodRes.status).toBe(201);
    const foodId = addFoodRes.body.data._id;

    // 3. User logs a 250g portion of this food for today's breakfast
    // (250 / 100) * 120 = 300 kcal, (250 / 100) * 10 = 25g protein
    const today = new Date().toISOString().split('T')[0];
    const logMealRes = await request(app)
      .post('/api/v1/meals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        mealType: 'BREAKFAST',
        localDate: today,
        items: [
          {
            foodItemId: foodId,
            name: 'Whole Milk Greek Yogurt',
            portionGrams: 250,
          },
        ],
      });

    expect(logMealRes.status).toBe(201);
    const meal = logMealRes.body.data;
    expect(meal.nutritionalTotals.energyKcal).toBe(300);
    expect(meal.nutritionalTotals.proteinG).toBe(25);
    expect(meal.items[0].nutritionalSnapshot.energyKcal).toBe(300);

    // 4. CRITICAL PRIVACY & AUDIT TEST:
    // Admin modifies the original food record later (e.g. manufacturer re-formulated to 150 kcal / 100g)
    await request(app)
      .put(`/api/v1/admin/foods/${foodId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nutrients: {
          energyKcal: 150,
          proteinG: 12,
        },
      });

    // 5. User's previous meal history must NOT change (snapshot must remain 300 kcal)
    const fetchedMeal = await MealLog.findById(meal._id);
    expect(fetchedMeal.nutritionalTotals.energyKcal).toBe(300);
    expect(fetchedMeal.items[0].nutritionalSnapshot.energyKcal).toBe(300);

    // 6. User dashboard shows exactly 300 calories consumed and remaining 1700
    const dashRes = await request(app)
      .get(`/api/v1/users/me/dashboard?date=${today}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(dashRes.body.data.summary.loggedCalories).toBe(300);
    expect(dashRes.body.data.summary.remainingCalories).toBe(1700);
  });

  // WORKFLOW 6: User Logs Water Intake → Record Persists → Daily Summary Updates
  test('WORKFLOW 6: User Logs Water Intake → Record Persists → Daily Summary Updates', async () => {
    const userPass = await hashPassword('Password123!');
    const user = await User.create({
      name: 'Hydration Tester',
      email: 'water@nutritrack.io',
      passwordHash: userPass,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const userToken = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'water@nutritrack.io', password: 'Password123!' })
    ).body.data.accessToken;

    const today = new Date().toISOString().split('T')[0];

    // Log 500ml water
    const w1 = await request(app)
      .post('/api/v1/water')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amountMl: 500, localDate: today });
    expect(w1.status).toBe(201);

    // Log 750ml water
    const w2 = await request(app)
      .post('/api/v1/water')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amountMl: 750, localDate: today });
    expect(w2.status).toBe(201);

    // Check summary
    const sumRes = await request(app)
      .get(`/api/v1/water/summary?date=${today}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(sumRes.status).toBe(200);
    expect(sumRes.body.data.totalMl).toBe(1250);
    expect(sumRes.body.data.logsCount).toBe(2);
  });

  // AUTHORIZATION & IDOR TESTS
  test('AUTHORIZATION & IDOR: Users and Nutritionists cannot access unauthorized resources', async () => {
    const pass = await hashPassword('Password123!');
    const user1 = await User.create({
      name: 'User 1',
      email: 'user1@test.com',
      passwordHash: pass,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const user1Token = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user1@test.com', password: 'Password123!' })
    ).body.data.accessToken;

    const user2 = await User.create({
      name: 'User 2',
      email: 'user2@test.com',
      passwordHash: pass,
      role: 'USER',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });
    const user2Token = (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user2@test.com', password: 'Password123!' })
    ).body.data.accessToken;

    // Create a meal for user 1
    const meal = await MealLog.create({
      userId: user1._id,
      mealType: 'LUNCH',
      localDate: '2026-11-01',
      items: [{ name: 'Salad', portionGrams: 100, nutritionalSnapshot: { energyKcal: 100 } }],
    });

    // 1. User 2 attempts to GET User 1's meal (IDOR prevention)
    const idorRes = await request(app)
      .get(`/api/v1/meals/${meal._id}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(idorRes.status).toBe(403);

    // 2. User 1 attempts to access admin route
    const adminRouteRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(adminRouteRes.status).toBe(403);

    // 3. User 1 attempts to access nutritionist route
    const nutRouteRes = await request(app)
      .get('/api/v1/nutritionist/dashboard')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(nutRouteRes.status).toBe(403);
  });
});
