/**
 * Cleanup script
 * Seed өгөгдөлд ороогүй тест сургалт болон хэрэглэгчдийг устгана.
 *
 * Ажиллуулах: pnpm db:cleanup (root-оос)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Seed-д тодорхойлсон ангиллын slug-ууд */
const SEED_CATEGORY_SLUGS = [
  'programming',
  'web-development',
  'mobile-development',
  'backend-development',
  'design',
  'uiux-design',
  'graphic-design',
  'data-analytics',
  'data-analysis',
  'machine-learning',
  'business',
  'management',
  'digital-marketing',
  'cybersecurity',
];

/** Seed-д тодорхойлсон сургалтын slug-ууд */
const SEED_COURSE_SLUGS = [
  'javascript-react-guide',
  'python-fundamentals',
  'figma-uiux-design',
  'react-native-mobile',
  'data-analysis-excel-python',
  'cybersecurity-fundamentals',
  'sql-postgresql',
  'digital-marketing-strategy',
  'business-management-basics',
  'nodejs-nestjs-api',
  'typescript-advanced',
  'vuejs-composition-api',
  'docker-kubernetes',
  'machine-learning-python',
  'photoshop-illustrator',
  'flutter-cross-platform',
  'email-marketing-automation',
  'mongodb-nosql',
  'agile-scrum-management',
  'financial-reporting-excel',
];

/** Seed-д тодорхойлсон хэрэглэгчийн имэйлүүд */
const SEED_USER_EMAILS = [
  'admin@ocp.mn',
  'teacher@ocp.mn',
  'dorj.bagsh@ocp.mn',
  'enkh.bagsh@ocp.mn',
  'bold.bagsh@ocp.mn',
  'saraa.bagsh@ocp.mn',
  'student@ocp.mn',
  'bat.od@ocp.mn',
  'narantsetseg@ocp.mn',
  'tsolmon@ocp.mn',
  'gantulga@ocp.mn',
  'enkhjargal@ocp.mn',
  'tumur@ocp.mn',
  'delgermaa@ocp.mn',
  'ganzorig@ocp.mn',
  'munkhtsetseg@ocp.mn',
  'erdene@ocp.mn',
  'otgonbaatar@ocp.mn',
  'uyanga@ocp.mn',
  'byambasuren@ocp.mn',
  'nomin@ocp.mn',
  'altantsetseg@ocp.mn',
  'ganchimeg@ocp.mn',
  'sukhbaatar@ocp.mn',
  'enerel@ocp.mn',
  'zolzaya@ocp.mn',
];

async function cleanup() {
  console.log('🧹  Cleanup эхэлж байна...\n');

  // ── Тест ангиллууд устгах ────────────────────────────────────────────────────
  console.log('🗂️   Тест ангиллуудыг шалгаж байна...');

  const extraCategories = await prisma.category.findMany({
    where: { slug: { notIn: SEED_CATEGORY_SLUGS } },
    select: { id: true, name: true, slug: true },
  });

  if (extraCategories.length === 0) {
    console.log('  ✓ Тест ангилал олдсонгүй\n');
  } else {
    for (const category of extraCategories) {
      await prisma.category.delete({ where: { id: category.id } });
      console.log(`  🗑  Устгасан: "${category.name}" (${category.slug})`);
    }
    console.log(`  ✓ ${extraCategories.length} ангилал устгагдлаа\n`);
  }

  // ── Тест сургалтууд устгах ───────────────────────────────────────────────────
  console.log('📚  Тест сургалтуудыг шалгаж байна...');

  const extraCourses = await prisma.course.findMany({
    where: { slug: { notIn: SEED_COURSE_SLUGS } },
    select: { id: true, title: true, slug: true },
  });

  if (extraCourses.length === 0) {
    console.log('  ✓ Тест сургалт олдсонгүй\n');
  } else {
    for (const course of extraCourses) {
      await prisma.course.delete({ where: { id: course.id } });
      console.log(`  🗑  Устгасан: "${course.title}" (${course.slug})`);
    }
    console.log(`  ✓ ${extraCourses.length} сургалт устгагдлаа\n`);
  }

  // ── Тест хэрэглэгчид устгах ──────────────────────────────────────────────────
  console.log('👤  Тест хэрэглэгчдийг шалгаж байна...');

  const extraUsers = await prisma.user.findMany({
    where: { email: { notIn: SEED_USER_EMAILS } },
    select: { id: true, email: true, role: true },
  });

  if (extraUsers.length === 0) {
    console.log('  ✓ Тест хэрэглэгч олдсонгүй\n');
  } else {
    for (const user of extraUsers) {
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`  🗑  Устгасан: ${user.email} (${user.role})`);
    }
    console.log(`  ✓ ${extraUsers.length} хэрэглэгч устгагдлаа\n`);
  }

  console.log('✅  Cleanup амжилттай дууслаа!');
}

cleanup()
  .catch((error) => {
    console.error('❌  Cleanup алдаа:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
