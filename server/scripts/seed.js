import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { hashPassword } from '../src/utils/security.js';
import {
  User,
  FoodCategory,
  FoodItem,
  MealLog,
  WaterLog,
  DietPlan,
  NutritionistApplication,
  ClientAssignment,
} from '../src/models/index.js';

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('🌱 NUTRITRACK — SEEDING MONGODB ATLAS CLOUD DATABASE');
  console.log('======================================================\n');

  try {
    await connectDB();

    console.log('🧹 Purging existing sample data...');
    await Promise.all([
      User.deleteMany({}),
      FoodCategory.deleteMany({}),
      FoodItem.deleteMany({}),
      MealLog.deleteMany({}),
      WaterLog.deleteMany({}),
      DietPlan.deleteMany({}),
      NutritionistApplication.deleteMany({}),
      ClientAssignment.deleteMany({}),
    ]);
    console.log('✅ Collections cleaned.');

    const defaultPasswordHash = await hashPassword('NutriTrack@2026');

    // 1. Create Users
    console.log('\n👥 Seeding Users...');
    const users = await User.create([
      // Admin
      {
        name: 'Sophia Aris',
        email: 'sophia.aris@lead.net',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: new Date(),
        profile: {
          bio: 'Platform Governor & Senior Operations Lead at NutriTrack.',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        },
      },
      // Nutritionist
      {
        name: 'Dr. Maya Lin, RD',
        email: 'maya.lin@clinical.org',
        passwordHash: defaultPasswordHash,
        role: 'NUTRITIONIST',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: new Date(),
        profile: {
          bio: 'Lead Clinical Nutritionist specializing in metabolic equilibrium and gut microbiome health.',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        },
        dietaryPreferences: ['Mediterranean', 'Functional Whole Foods'],
      },
      // Dieter 1: Aarav Mehta
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@studio.com',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: new Date(),
        profile: {
          bio: 'Architect & mindful wellness enthusiast.',
          age: 29,
          gender: 'male',
          heightCm: 178,
          currentWeightKg: 68.5,
          targetWeightKg: 66.0,
          activityLevel: 'moderate',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
        dietaryPreferences: ['High Protein', 'Whole Foods'],
      },
      // Dieter 2: Chloe Sinclair
      {
        name: 'Chloe Sinclair',
        email: 'chloe.s@kinfolk.co',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: new Date(),
        profile: {
          bio: 'Creative director & distance runner.',
          age: 27,
          gender: 'female',
          heightCm: 168,
          currentWeightKg: 58.0,
          targetWeightKg: 57.0,
          activityLevel: 'active',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        },
        dietaryPreferences: ['Strict Vegan', 'Gluten-Free'],
      },
      // Dieter 3: Marcus Vance
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@architect.net',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        accountStatus: 'ACTIVE',
        emailVerifiedAt: new Date(),
        profile: {
          bio: 'Urban planner, focus on insulin sensitivity.',
          age: 34,
          gender: 'male',
          heightCm: 182,
          currentWeightKg: 82.0,
          targetWeightKg: 78.0,
          activityLevel: 'light',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        },
        dietaryPreferences: ['Pescatarian', 'Low Sodium'],
      },
    ]);

    const admin = users[0];
    const nutritionist = users[1];
    const dieterAarav = users[2];
    const dieterChloe = users[3];
    console.log(`✅ Seeded ${users.length} users with verified credentials.`);

    // 2. Nutritionist Application Record
    console.log('\n📄 Seeding Nutritionist Application...');
    await NutritionistApplication.create({
      userId: nutritionist._id,
      qualification: 'M.S. Clinical Nutrition, Columbia University',
      specialization: 'Metabolic Equilibrium & Functional Nutrition',
      experienceYears: 8,
      professionalDescription: 'Board Certified Specialist in Sports Dietetics and Clinical Nutrition.',
      approvalStatus: 'APPROVED',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    });
    console.log('✅ Seeded approved nutritionist application.');

    // 3. Client Assignments
    console.log('\n🤝 Seeding Clinical Client Assignments...');
    await ClientAssignment.create([
      {
        nutritionistId: nutritionist._id,
        userId: dieterAarav._id,
        assignedBy: admin._id,
        status: 'ACTIVE',
        notes: 'Lean Muscle & Metabolic Equilibrium (Target: 2150 kcal)',
        assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        nutritionistId: nutritionist._id,
        userId: dieterChloe._id,
        assignedBy: admin._id,
        status: 'ACTIVE',
        notes: 'Plant-Based Endurance & Iron Absorption (Target: 1900 kcal)',
        assignedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log('✅ Seeded 2 active client consultations.');

    // 4. Food Categories
    console.log('\n🥗 Seeding Food Categories...');
    const categories = await FoodCategory.create([
      { name: 'Breakfast Nourish', slug: 'breakfast', description: 'Mindful morning bowls, sourdough tartines, oats' },
      { name: 'Midday Sustain', slug: 'lunch', description: 'Grain bowls, lentil salads, nutrient-dense plates' },
      { name: 'Evening Equilibrium', slug: 'dinner', description: 'Clean proteins, wild fish, roasted roots' },
      { name: 'Mindful Snacks', slug: 'snack', description: 'Matcha bites, kefir, activated seeds, berries' },
    ]);
    console.log(`✅ Seeded ${categories.length} food categories.`);

    // 5. Food Items
    console.log('\n🥑 Seeding Whole Food Items Database...');
    const foodItems = await FoodItem.create([
      {
        name: 'Wild Blueberry & Greek Yogurt Nourish Bowl',
        normalizedName: 'wild blueberry greek yogurt nourish bowl',
        categoryId: categories[0]._id,
        category: 'breakfast',
        description: 'Whole milk Greek yogurt with organic wild Maine blueberries, toasted hemp hearts, and cold-pressed honey.',
        nutrients: {
          energyKcal: 380,
          proteinG: 26,
          carbohydratesG: 48,
          totalFatG: 9,
          fiberG: 6,
        },
        servingInformation: {
          servingSizeGrams: 320,
          servingUnit: '1 bowl',
          householdMeasure: '1 bowl (320g)',
        },
        source: 'ADMIN_MANUAL',
      },
      {
        name: 'Avocado Tartine with Sprouted Seed Bread',
        normalizedName: 'avocado tartine sprouted seed bread',
        categoryId: categories[0]._id,
        category: 'breakfast',
        description: 'Crushed Hass avocado on slow-fermented sprouted sourdough with Maldon flake salt and microgreens.',
        nutrients: {
          energyKcal: 340,
          proteinG: 11,
          carbohydratesG: 32,
          totalFatG: 20,
          fiberG: 8,
        },
        servingInformation: {
          servingSizeGrams: 180,
          servingUnit: '2 slices',
          householdMeasure: '2 slices (180g)',
        },
        source: 'ADMIN_MANUAL',
      },
      {
        name: 'Forest Kale & French Puy Lentil Salad',
        normalizedName: 'forest kale french puy lentil salad',
        categoryId: categories[1]._id,
        category: 'lunch',
        description: 'Lacinato dinosaur kale, warm French green lentils, roasted golden beets, walnuts, and creamy tahini-lime vinaigrette.',
        nutrients: {
          energyKcal: 520,
          proteinG: 24,
          carbohydratesG: 62,
          totalFatG: 21,
          fiberG: 14,
        },
        servingInformation: {
          servingSizeGrams: 380,
          servingUnit: '1 large bowl',
          householdMeasure: '1 large bowl (380g)',
        },
        source: 'ADMIN_MANUAL',
      },
      {
        name: 'Charbroiled Wild Salmon & Tender Broccolini',
        normalizedName: 'charbroiled wild salmon tender broccolini',
        categoryId: categories[2]._id,
        category: 'dinner',
        description: 'Sustainably caught Pacific king salmon pan-seared with fresh dill, charred baby broccolini, and extra virgin olive oil.',
        nutrients: {
          energyKcal: 610,
          proteinG: 48,
          carbohydratesG: 18,
          totalFatG: 37,
          fiberG: 5,
        },
        servingInformation: {
          servingSizeGrams: 340,
          servingUnit: '1 plate',
          householdMeasure: '1 plate (340g)',
        },
        source: 'ADMIN_MANUAL',
      },
      {
        name: 'Ceremonial Matcha & Pistachio Energy Bites',
        normalizedName: 'ceremonial matcha pistachio energy bites',
        categoryId: categories[3]._id,
        category: 'snack',
        description: 'Hand-rolled Medjool dates, raw California pistachios, oats, and organic Uji ceremonial green tea powder.',
        nutrients: {
          energyKcal: 190,
          proteinG: 6,
          carbohydratesG: 18,
          totalFatG: 11,
          fiberG: 3,
        },
        servingInformation: {
          servingSizeGrams: 60,
          servingUnit: '2 bites',
          householdMeasure: '2 bites (60g)',
        },
        source: 'ADMIN_MANUAL',
      },
    ]);
    console.log(`✅ Seeded ${foodItems.length} verified whole foods.`);

    // 6. Meal Logs for Aarav Mehta (Today's Date)
    console.log('\n🍽️  Seeding Live Meal Logs for Aarav Mehta...');
    const todayStr = new Date().toISOString().slice(0, 10);

    await MealLog.create([
      {
        userId: dieterAarav._id,
        mealType: 'BREAKFAST',
        localDate: todayStr,
        items: [
          {
            foodItemId: foodItems[0]._id,
            name: foodItems[0].name,
            portionGrams: 320,
            servingUnit: '1 bowl',
            nutritionalSnapshot: {
              energyKcal: 380,
              proteinG: 26,
              carbohydratesG: 48,
              totalFatG: 9,
              fiberG: 6,
            },
          },
        ],
        totalNutrients: {
          calories: 380,
          protein: 26,
          carbs: 48,
          fat: 9,
          fiber: 6,
        },
        loggedAt: new Date(new Date().setHours(8, 15, 0, 0)),
      },
      {
        userId: dieterAarav._id,
        mealType: 'LUNCH',
        localDate: todayStr,
        items: [
          {
            foodItemId: foodItems[2]._id,
            name: foodItems[2].name,
            portionGrams: 380,
            servingUnit: '1 large bowl',
            nutritionalSnapshot: {
              energyKcal: 520,
              proteinG: 24,
              carbohydratesG: 62,
              totalFatG: 21,
              fiberG: 14,
            },
          },
        ],
        totalNutrients: {
          calories: 520,
          protein: 24,
          carbs: 62,
          fat: 21,
          fiber: 14,
        },
        loggedAt: new Date(new Date().setHours(13, 10, 0, 0)),
      },
      {
        userId: dieterAarav._id,
        mealType: 'SNACK',
        localDate: todayStr,
        items: [
          {
            foodItemId: foodItems[4]._id,
            name: foodItems[4].name,
            portionGrams: 60,
            servingUnit: '2 bites',
            nutritionalSnapshot: {
              energyKcal: 190,
              proteinG: 6,
              carbohydratesG: 18,
              totalFatG: 11,
              fiberG: 3,
            },
          },
        ],
        totalNutrients: {
          calories: 190,
          protein: 6,
          carbs: 18,
          fat: 11,
          fiber: 3,
        },
        loggedAt: new Date(new Date().setHours(16, 30, 0, 0)),
      },
    ]);
    console.log('✅ Seeded 3 real-time meal logs.');

    // 7. Water Log for Aarav Mehta
    console.log('\n💧 Seeding Water Log...');
    await WaterLog.create({
      userId: dieterAarav._id,
      amountMl: 1250, // 5 glasses (250ml each)
      localDate: todayStr,
      loggedAt: new Date(),
    });
    console.log('✅ Seeded 1250 ml (5 glasses) water log.');

    // 8. Clinical Diet Plan
    console.log('\n📋 Seeding Clinical Diet Plan...');
    await DietPlan.create({
      planName: 'Kinfolk High-Protein Metabolic Equilibrium Plan',
      description: 'Prescribed personalized clinical diet plan targeting 2150 kcal with antioxidant density.',
      nutritionistId: nutritionist._id,
      clientId: dieterAarav._id,
      durationDays: 14,
      dailyTargets: {
        calorieTarget: 2150,
        proteinG: 140,
        carbsG: 215,
        fatG: 65,
        waterMl: 2000,
      },
      isActive: true,
    });
    console.log('✅ Seeded clinical diet plan.');

    console.log('\n======================================================');
    console.log('🎉 ATLAS SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Database Name: nutritrack');
    console.log('Collections Populated:');
    console.log('  • users (Admin, Nutritionist, Dieters)');
    console.log('  • nutritionistapplications (Approved credentials)');
    console.log('  • clientassignments (Active consultations)');
    console.log('  • foodcategories (4 categories)');
    console.log('  • fooditems (5 verified items)');
    console.log('  • meallogs (Today’s breakfast, lunch, snack)');
    console.log('  • waterlogs (5 glasses logged today)');
    console.log('  • dietplans (Target macros 2150 kcal)');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error seeding MongoDB Atlas database:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedDatabase();
