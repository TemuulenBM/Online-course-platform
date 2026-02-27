/**
 * Database seed script
 * Хөгжүүлэлтийн орчинд анхны хэрэглэгчдийг үүсгэнэ.
 *
 * Ажиллуулах: pnpm db:seed (root-оос)
 */

import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

/** Prisma 7 — driver adapter шаардлагатай */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

/** Seed хэрэглэгчдийн мэдээлэл */
const seedUsers = [
  {
    email: 'admin@ocp.mn',
    password: 'Admin123!',
    role: Role.ADMIN,
    firstName: 'Админ',
    lastName: 'Хэрэглэгч',
  },
  {
    email: 'teacher@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Багш',
    lastName: 'Хэрэглэгч',
  },
  {
    email: 'student@ocp.mn',
    password: 'Student123!',
    role: Role.STUDENT,
    firstName: 'Оюутан',
    lastName: 'Хэрэглэгч',
  },
];

async function seed() {
  console.log('Seed эхэлж байна...\n');

  for (const userData of seedUsers) {
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        role: userData.role,
        passwordHash,
      },
      create: {
        email: userData.email,
        passwordHash,
        role: userData.role,
        emailVerified: true,
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      create: {
        userId: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });

    console.log(`  ✓ ${userData.role}: ${userData.email} (${user.id})`);
  }

  console.log('\nSeed амжилттай дууслаа!');
  console.log('\nНэвтрэх мэдээлэл:');
  console.log('  Admin:   admin@ocp.mn   / Admin123!');
  console.log('  Teacher: teacher@ocp.mn / Teacher123!');
  console.log('  Student: student@ocp.mn / Student123!');
}

seed()
  .catch((error) => {
    console.error('Seed алдаа:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
