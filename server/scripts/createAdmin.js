import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.model.js';
import { hashPassword } from '../src/utils/security.js';

async function bootstrapAdmin() {
  console.log('\n======================================================');
  console.log('   NUTRITRACK — ADMINISTRATIVE BOOTSTRAP CLI');
  console.log('======================================================\n');

  await connectDB();

  const rl = readline.createInterface({ input, output });

  try {
    const name = (await rl.question('Enter Administrator Full Name: ')).trim();
    if (!name || name.length < 2) {
      console.error('❌ Name must be at least 2 characters');
      process.exit(1);
    }

    const email = (await rl.question('Enter Administrator Email Address: ')).trim().toLowerCase();
    if (!email || !email.includes('@')) {
      console.error('❌ Please enter a valid email address');
      process.exit(1);
    }

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      console.error(`❌ An account with email "${email}" already exists! (Role: ${existing.role})`);
      process.exit(1);
    }

    const password = (await rl.question('Enter Administrator Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number): ')).trim();
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      console.error('❌ Password must be at least 8 characters and contain uppercase, lowercase, and numeric characters.');
      process.exit(1);
    }

    const passwordHash = await hashPassword(password);

    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      emailVerifiedAt: new Date(),
    });

    console.log('\n✅ Administrator account bootstrapped successfully!');
    console.log(`   ID:    ${admin._id}`);
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}\n`);
  } catch (err) {
    console.error('❌ Error during administrative bootstrap:', err.message);
  } finally {
    rl.close();
    await disconnectDB();
    process.exit(0);
  }
}

bootstrapAdmin();
