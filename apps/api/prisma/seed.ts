/**
 * Database seed script
 * Платформын жишиг мэдээллийг үүсгэнэ.
 *
 * Агуулга:
 *   - 1 admin + 5 teacher + 20 student хэрэглэгч
 *   - 5 ангилал (эх) + 10 дэд ангилал
 *   - 20 сургалт (MongoDB-д контент байхгүй, зөвхөн metadata)
 *   - 100 хичээл (сургалт бүрт 5)
 *   - 50+ элсэлт
 *   - Элсэлт бүрт хичээлийн ахиц
 *
 * Ажиллуулах: pnpm db:seed (root-оос)
 */

import 'dotenv/config';
import {
  PrismaClient,
  Role,
  CourseDifficulty,
  CourseStatus,
  LessonType,
  EnrollmentStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

/** Prisma 7 — driver adapter шаардлагатай */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 10;

// ─── Хэрэглэгчдийн өгөгдөл ───────────────────────────────────────────────────

const ADMIN_USER = {
  email: 'admin@ocp.mn',
  password: 'Admin123!',
  role: Role.ADMIN,
  firstName: 'Админ',
  lastName: 'Хэрэглэгч',
};

const TEACHERS = [
  {
    email: 'teacher@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Багш',
    lastName: 'Хэрэглэгч',
    bio: 'Дадлагатай хөгжүүлэгч, 10 жилийн туршлагатай.',
  },
  {
    email: 'dorj.bagsh@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Дорж',
    lastName: 'Батбаяр',
    bio: 'Full-stack хөгжүүлэгч. React, Node.js, Python чиглэлээр заадаг.',
  },
  {
    email: 'enkh.bagsh@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Энхтуул',
    lastName: 'Ганбат',
    bio: 'UI/UX дизайнер, Figma болон Adobe XD-ийн мэргэжилтэн.',
  },
  {
    email: 'bold.bagsh@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Болд',
    lastName: 'Нямсүрэн',
    bio: 'Мэдээллийн аюулгүй байдал, кибер халдлагаас хамгаалалт чиглэлээр.',
  },
  {
    email: 'saraa.bagsh@ocp.mn',
    password: 'Teacher123!',
    role: Role.TEACHER,
    firstName: 'Сараа',
    lastName: 'Батмөнх',
    bio: 'Бизнесийн менежмент, дижитал маркетингийн зөвлөх.',
  },
];

const STUDENTS = [
  { email: 'student@ocp.mn', password: 'Student123!', firstName: 'Оюутан', lastName: 'Хэрэглэгч' },
  { email: 'bat.od@ocp.mn', password: 'Student123!', firstName: 'Бат-Өлзий', lastName: 'Дорж' },
  {
    email: 'narantsetseg@ocp.mn',
    password: 'Student123!',
    firstName: 'Нарантсэцэг',
    lastName: 'Гантулга',
  },
  { email: 'tsolmon@ocp.mn', password: 'Student123!', firstName: 'Цолмон', lastName: 'Бат' },
  { email: 'gantulga@ocp.mn', password: 'Student123!', firstName: 'Гантулга', lastName: 'Мөнх' },
  {
    email: 'enkhjargal@ocp.mn',
    password: 'Student123!',
    firstName: 'Энхжаргал',
    lastName: 'Сүрэн',
  },
  { email: 'tumur@ocp.mn', password: 'Student123!', firstName: 'Төмөр', lastName: 'Цэрэн' },
  { email: 'delgermaa@ocp.mn', password: 'Student123!', firstName: 'Дэлгэрмаа', lastName: 'Лхам' },
  { email: 'ganzorig@ocp.mn', password: 'Student123!', firstName: 'Ганзориг', lastName: 'Батаа' },
  {
    email: 'munkhtsetseg@ocp.mn',
    password: 'Student123!',
    firstName: 'Мөнхцэцэг',
    lastName: 'Ням',
  },
  { email: 'erdene@ocp.mn', password: 'Student123!', firstName: 'Эрдэнэ', lastName: 'Баяр' },
  {
    email: 'otgonbaatar@ocp.mn',
    password: 'Student123!',
    firstName: 'Отгонбаатар',
    lastName: 'Дулам',
  },
  { email: 'uyanga@ocp.mn', password: 'Student123!', firstName: 'Уянга', lastName: 'Чимэд' },
  {
    email: 'byambasuren@ocp.mn',
    password: 'Student123!',
    firstName: 'Бямбасүрэн',
    lastName: 'Авирмэд',
  },
  { email: 'nomin@ocp.mn', password: 'Student123!', firstName: 'Номин', lastName: 'Сэлэнгэ' },
  {
    email: 'altantsetseg@ocp.mn',
    password: 'Student123!',
    firstName: 'Алтантсэцэг',
    lastName: 'Буянт',
  },
  { email: 'ganchimeg@ocp.mn', password: 'Student123!', firstName: 'Ганчимэг', lastName: 'Пүрэв' },
  {
    email: 'sukhbaatar@ocp.mn',
    password: 'Student123!',
    firstName: 'Сүхбаатар',
    lastName: 'Лувсан',
  },
  { email: 'enerel@ocp.mn', password: 'Student123!', firstName: 'Энэрэл', lastName: 'Батсайхан' },
  { email: 'zolzaya@ocp.mn', password: 'Student123!', firstName: 'Золзая', lastName: 'Гомбо' },
];

// ─── Ангиллын өгөгдөл ─────────────────────────────────────────────────────────

const CATEGORIES_DATA = [
  {
    name: 'Програм хөгжүүлэлт',
    slug: 'programming',
    description: 'Веб, мобайл болон бэкэнд хөгжүүлэлтийн сургалтууд',
    displayOrder: 1,
    children: [
      { name: 'Веб хөгжүүлэлт', slug: 'web-development', displayOrder: 1 },
      { name: 'Мобайл хөгжүүлэлт', slug: 'mobile-development', displayOrder: 2 },
      { name: 'Бэкэнд хөгжүүлэлт', slug: 'backend-development', displayOrder: 3 },
    ],
  },
  {
    name: 'Дизайн',
    slug: 'design',
    description: 'UI/UX болон график дизайны сургалтууд',
    displayOrder: 2,
    children: [
      { name: 'UI/UX дизайн', slug: 'uiux-design', displayOrder: 1 },
      { name: 'График дизайн', slug: 'graphic-design', displayOrder: 2 },
    ],
  },
  {
    name: 'Өгөгдөл ба аналитик',
    slug: 'data-analytics',
    description: 'Мэдээллийн шинжилгээ, машин сургалтын сургалтууд',
    displayOrder: 3,
    children: [
      { name: 'Мэдээллийн шинжилгээ', slug: 'data-analysis', displayOrder: 1 },
      { name: 'Машин сургалт', slug: 'machine-learning', displayOrder: 2 },
    ],
  },
  {
    name: 'Бизнес',
    slug: 'business',
    description: 'Менежмент, маркетинг болон бизнесийн сургалтууд',
    displayOrder: 4,
    children: [
      { name: 'Менежмент', slug: 'management', displayOrder: 1 },
      { name: 'Дижитал маркетинг', slug: 'digital-marketing', displayOrder: 2 },
    ],
  },
  {
    name: 'Аюулгүй байдал',
    slug: 'cybersecurity',
    description: 'Кибер аюулгүй байдлын сургалтууд',
    displayOrder: 5,
    children: [],
  },
];

// ─── Сургалтын өгөгдөл ────────────────────────────────────────────────────────
/** Сургалт бүрийн thumbnailUrl нь Unsplash-ийн нийтэд нээлттэй зураг */

const COURSES_DATA = [
  {
    title: 'JavaScript-ээс React хүртэл: Дэлгэрэнгүй гарын авлага',
    slug: 'javascript-react-guide',
    description:
      'JavaScript-ийн суурь мэдлэгээс эхлэн React хүртэл алхам алхмаар суралцана. Hooks, Context API, React Router, state удирдлагыг бүрэн сурна. Практик төслүүд бүхий дэлгэрэнгүй курс.',
    categorySlug: 'web-development',
    teacherEmail: 'dorj.bagsh@ocp.mn',
    price: 149000,
    discountPrice: 89000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1800,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&auto=format&fit=crop',
    tags: ['JavaScript', 'React', 'Frontend', 'Web'],
    lessons: [
      {
        title: 'JavaScript суурь — хувьсагч ба функц',
        type: LessonType.VIDEO,
        duration: 45,
        isPreview: true,
      },
      { title: 'DOM болон event listener', type: LessonType.VIDEO, duration: 40 },
      { title: 'React-ийн танилцуулга ба JSX', type: LessonType.VIDEO, duration: 50 },
      { title: 'Hooks: useState ба useEffect', type: LessonType.VIDEO, duration: 60 },
      { title: 'Нэгдсэн дасгал — Todo апп үүсгэх', type: LessonType.ASSIGNMENT, duration: 90 },
    ],
  },
  {
    title: 'Python програмчлалын үндэс',
    slug: 'python-fundamentals',
    description:
      'Python хэлийг эхнээс нь сурч, өдөр тутмын ажлаа автоматжуулан, хурдан хөгжүүлэлтэд хэрэглэнэ. Мэдээллийн бүтэц, функц, файл, OOP сэдвүүдийг хамарна.',
    categorySlug: 'backend-development',
    teacherEmail: 'dorj.bagsh@ocp.mn',
    price: 99000,
    discountPrice: null,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1200,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop',
    tags: ['Python', 'Програмчлал', 'Суурь'],
    lessons: [
      {
        title: 'Python суулгах ба эхний код',
        type: LessonType.VIDEO,
        duration: 30,
        isPreview: true,
      },
      { title: 'Хувьсагч, өгөгдлийн төрөл', type: LessonType.VIDEO, duration: 45 },
      { title: 'Нөхцөл ба давталт', type: LessonType.VIDEO, duration: 50 },
      { title: 'Функц ба модуль', type: LessonType.VIDEO, duration: 55 },
      { title: 'Python дасгалын шалгалт', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'Figma-гаар UI/UX дизайн: Суурьаас мэргэжлийн түвшинд',
    slug: 'figma-uiux-design',
    description:
      'Дизайны суурь зарчмуудаас эхлэн Figma хэрэгслийг бүрэн эзэмших. Wireframe, prototype, дизайн систем, handoff зэрэг бодит ажлын урсгалыг сурна.',
    categorySlug: 'uiux-design',
    teacherEmail: 'enkh.bagsh@ocp.mn',
    price: 129000,
    discountPrice: 79000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1500,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
    tags: ['Figma', 'UI/UX', 'Дизайн', 'Прототип'],
    lessons: [
      {
        title: 'Figma интерфейс болон суурь хэрэгслүүд',
        type: LessonType.VIDEO,
        duration: 35,
        isPreview: true,
      },
      { title: 'Дизайны зарчим — Grid, Typography', type: LessonType.VIDEO, duration: 45 },
      { title: 'Wireframe ба Flow диаграм', type: LessonType.VIDEO, duration: 50 },
      { title: 'Component ба Auto Layout', type: LessonType.VIDEO, duration: 60 },
      { title: 'Прототип болон Developer Handoff', type: LessonType.VIDEO, duration: 45 },
    ],
  },
  {
    title: 'React Native-ээр мобайл апп хөгжүүлэх',
    slug: 'react-native-mobile',
    description:
      'React-ийн мэдлэгийг ашиглан iOS болон Android-д ажиллах мобайл апп үүсгэнэ. Expo, navigation, state, API холболт зэрэг бодит онцлогуудыг хамарна.',
    categorySlug: 'mobile-development',
    teacherEmail: 'enkh.bagsh@ocp.mn',
    price: 159000,
    discountPrice: null,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 2100,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
    tags: ['React Native', 'Expo', 'iOS', 'Android'],
    lessons: [
      {
        title: 'Expo болон React Native танилцуулга',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'Компонент ба StyleSheet', type: LessonType.VIDEO, duration: 50 },
      { title: 'Navigation — Stack болон Tab', type: LessonType.VIDEO, duration: 55 },
      { title: 'API дуудлага ба AsyncStorage', type: LessonType.VIDEO, duration: 60 },
      { title: 'Апп publish хийх — App Store / Play Store', type: LessonType.VIDEO, duration: 45 },
    ],
  },
  {
    title: 'Мэдээллийн шинжилгээ: Excel болон Python',
    slug: 'data-analysis-excel-python',
    description:
      'Excel-ийн дэвшилтэт функцуудаас Python pandas хүртэл өгөгдлийг шинжилж, дүгнэлт гаргах арга барилыг эзэмшинэ. Бодит мэдээлэл дээр ажиллана.',
    categorySlug: 'data-analysis',
    teacherEmail: 'bold.bagsh@ocp.mn',
    price: 119000,
    discountPrice: 89000,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 1650,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    tags: ['Excel', 'Python', 'Pandas', 'Өгөгдлийн шинжилгээ'],
    lessons: [
      {
        title: 'Excel: Pivot Table болон дэвшилтэт функцүүд',
        type: LessonType.VIDEO,
        duration: 45,
        isPreview: true,
      },
      { title: 'Python Pandas суурь', type: LessonType.VIDEO, duration: 50 },
      { title: 'Matplotlib ашиглан визуалчлал', type: LessonType.VIDEO, duration: 55 },
      { title: 'Бодит мэдээлэл дээр дасгал', type: LessonType.ASSIGNMENT, duration: 90 },
      { title: 'Шинжилгээний тайлан бэлтгэх', type: LessonType.TEXT, duration: 30 },
    ],
  },
  {
    title: 'Кибер аюулгүй байдлын үндэс',
    slug: 'cybersecurity-fundamentals',
    description:
      'Сүлжээний аюулгүй байдал, нийтлэг халдлагын арга, хамгаалах технологи, хууль эрхзүйн зохицуулалтын үндсийг судална. Кибер аюулгүй байдлын карьерт бэлтгэнэ.',
    categorySlug: 'cybersecurity',
    teacherEmail: 'bold.bagsh@ocp.mn',
    price: 139000,
    discountPrice: null,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1350,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop',
    tags: ['Cybersecurity', 'Аюулгүй байдал', 'Сүлжээ', 'Хамгаалалт'],
    lessons: [
      {
        title: 'Кибер аюулгүй байдлын тойм',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'Нийтлэг халдлагын төрлүүд', type: LessonType.VIDEO, duration: 50 },
      { title: 'Firewall болон VPN', type: LessonType.VIDEO, duration: 45 },
      { title: 'Нууцлал болон шифрлэлт', type: LessonType.VIDEO, duration: 50 },
      { title: 'Аюулгүй байдлын шалгалт', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'SQL болон PostgreSQL дадлага',
    slug: 'sql-postgresql',
    description:
      'SQL-ийн суурь хэллэгүүдээс эхлэн PostgreSQL-ийн дэвшилтэт чадваруудыг бүрэн эзэмшинэ. Бодит ажлын орчинд мэдээллийн сан удирдах чадварыг олж авна.',
    categorySlug: 'data-analysis',
    teacherEmail: 'bold.bagsh@ocp.mn',
    price: 109000,
    discountPrice: 79000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1200,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop',
    tags: ['SQL', 'PostgreSQL', 'Мэдээллийн сан', 'Backend'],
    lessons: [
      {
        title: 'SQL: SELECT, WHERE, ORDER BY',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'JOIN ба холбоо хамаарал', type: LessonType.VIDEO, duration: 50 },
      { title: 'Aggregate функцүүд ба GROUP BY', type: LessonType.VIDEO, duration: 45 },
      { title: 'Index ба Performance', type: LessonType.VIDEO, duration: 50 },
      { title: 'SQL шалгалт', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'Дижитал маркетинг стратеги',
    slug: 'digital-marketing-strategy',
    description:
      'SEO, нийгмийн сүлжээний маркетинг, email кампейн, Google Ads зэрэг дижитал маркетингийн бүх чиглэлийг практикаар судална. Бодит брэндэд хэрэглэгдэх боломжтой.',
    categorySlug: 'digital-marketing',
    teacherEmail: 'saraa.bagsh@ocp.mn',
    price: 89000,
    discountPrice: null,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1050,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    tags: ['Маркетинг', 'SEO', 'Google Ads', 'SMM'],
    lessons: [
      { title: 'Дижитал маркетингийн тойм', type: LessonType.VIDEO, duration: 35, isPreview: true },
      { title: 'SEO: Хайлтын системд оновчлол', type: LessonType.VIDEO, duration: 45 },
      { title: 'Нийгмийн сүлжээний контент', type: LessonType.VIDEO, duration: 40 },
      { title: 'Google Ads кампейн', type: LessonType.VIDEO, duration: 50 },
      { title: 'Маркетингийн тайлан', type: LessonType.ASSIGNMENT, duration: 60 },
    ],
  },
  {
    title: 'Бизнес удирдлагын үндэс',
    slug: 'business-management-basics',
    description:
      'Бизнес байгуулах, удирдах, хөгжүүлэх зарчмуудыг практик жишээн дээр суралцана. Санхүү, хүний нөөц, стратегийн удирдлагын үндэсийг хамарна.',
    categorySlug: 'management',
    teacherEmail: 'saraa.bagsh@ocp.mn',
    price: 99000,
    discountPrice: 69000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 900,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    tags: ['Бизнес', 'Менежмент', 'Стратеги', 'Удирдлага'],
    lessons: [
      { title: 'Бизнесийн загварын суурь', type: LessonType.VIDEO, duration: 40, isPreview: true },
      { title: 'Санхүүгийн үндсэн ойлголт', type: LessonType.VIDEO, duration: 45 },
      { title: 'Хүний нөөцийн удирдлага', type: LessonType.VIDEO, duration: 40 },
      { title: 'Бизнесийн стратеги боловсруулах', type: LessonType.VIDEO, duration: 45 },
      { title: 'Бизнес план дасгал', type: LessonType.ASSIGNMENT, duration: 80 },
    ],
  },
  {
    title: 'Node.js ба NestJS: REST API хөгжүүлэлт',
    slug: 'nodejs-nestjs-api',
    description:
      'Node.js-ийн суурийг тавьж, NestJS framework дээр production-ready REST API үүсгэнэ. Authentication, validation, database, deployment бүгдийг хамарна.',
    categorySlug: 'backend-development',
    teacherEmail: 'teacher@ocp.mn',
    price: 179000,
    discountPrice: 129000,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 2400,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop',
    tags: ['Node.js', 'NestJS', 'API', 'Backend'],
    lessons: [
      {
        title: 'Node.js болон npm танилцуулга',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'NestJS модулийн бүтэц', type: LessonType.VIDEO, duration: 55 },
      { title: 'Prisma ORM ба PostgreSQL', type: LessonType.VIDEO, duration: 60 },
      { title: 'JWT Authentication хэрэгжүүлэх', type: LessonType.VIDEO, duration: 65 },
      { title: 'API deploy хийх — Docker ба Railway', type: LessonType.VIDEO, duration: 50 },
    ],
  },
  // ── Шинэ 10 сургалт ───────────────────────────────────────────────────────
  {
    title: 'TypeScript дэвшилтэт: Төрлийн систем ба Pattern-ууд',
    slug: 'typescript-advanced',
    description:
      'TypeScript-ийн дэвшилтэт Generic, Conditional Type, Mapped Type, Decorator болон Design Pattern-уудыг эзэмшинэ. Том масштабын апп хөгжүүлэхэд шаардлагатай мэдлэг.',
    categorySlug: 'web-development',
    teacherEmail: 'teacher@ocp.mn',
    price: 139000,
    discountPrice: 99000,
    difficulty: CourseDifficulty.ADVANCED,
    language: 'mn',
    durationMinutes: 1800,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    tags: ['TypeScript', 'Advanced', 'Design Patterns', 'Frontend'],
    lessons: [
      {
        title: 'Generic Type ба constraint-ууд',
        type: LessonType.VIDEO,
        duration: 50,
        isPreview: true,
      },
      { title: 'Conditional болон Mapped Type', type: LessonType.VIDEO, duration: 55 },
      { title: 'Decorator ба Metadata', type: LessonType.VIDEO, duration: 60 },
      { title: 'Design Pattern: SOLID зарчим', type: LessonType.VIDEO, duration: 65 },
      { title: 'TypeScript дасгал — Type Challenge', type: LessonType.ASSIGNMENT, duration: 90 },
    ],
  },
  {
    title: 'Vue.js 3-ийн суурь: Composition API',
    slug: 'vuejs-composition-api',
    description:
      'Vue.js 3-ийн Composition API, Pinia state management, Vue Router болон практик application үүсгэхийг сурна. React-ийн өөр хувилбар болох Vue-г гүнзгий судалнэ.',
    categorySlug: 'web-development',
    teacherEmail: 'dorj.bagsh@ocp.mn',
    price: 119000,
    discountPrice: null,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 1500,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=800&auto=format&fit=crop',
    tags: ['Vue.js', 'Composition API', 'Pinia', 'Frontend'],
    lessons: [
      {
        title: 'Vue.js 3 болон Composition API танилцуулга',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'ref, reactive болон computed', type: LessonType.VIDEO, duration: 50 },
      { title: 'Vue Router 4 — Dynamic route', type: LessonType.VIDEO, duration: 50 },
      { title: 'Pinia ашиглан state удирдлага', type: LessonType.VIDEO, duration: 55 },
      { title: 'Vue апп байрлуулах — Vercel / Netlify', type: LessonType.VIDEO, duration: 40 },
    ],
  },
  {
    title: 'Docker ба Kubernetes: Контейнер технологи',
    slug: 'docker-kubernetes',
    description:
      'Docker container-ийн суурийг тавьж, Kubernetes дээр micro-service ажиллуулна. DevOps engineer-ийн зайлшгүй мэдлэг болох container orchestration-г практикаар сурна.',
    categorySlug: 'backend-development',
    teacherEmail: 'teacher@ocp.mn',
    price: 169000,
    discountPrice: 119000,
    difficulty: CourseDifficulty.ADVANCED,
    language: 'mn',
    durationMinutes: 2100,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&auto=format&fit=crop',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'Container'],
    lessons: [
      {
        title: 'Docker суурь — Image ба Container',
        type: LessonType.VIDEO,
        duration: 45,
        isPreview: true,
      },
      { title: 'Dockerfile болон Docker Compose', type: LessonType.VIDEO, duration: 55 },
      { title: 'Kubernetes: Pod, Service, Deployment', type: LessonType.VIDEO, duration: 65 },
      { title: 'Helm Chart ба CI/CD pipeline', type: LessonType.VIDEO, duration: 60 },
      {
        title: 'Kubernetes дасгал — micro-service deploy',
        type: LessonType.ASSIGNMENT,
        duration: 90,
      },
    ],
  },
  {
    title: 'Машин сургалт Python-оор: Scikit-learn ба TensorFlow',
    slug: 'machine-learning-python',
    description:
      'Машин сургалтын алгоритмуудыг Python дээр хэрэгжүүлэх. Regression, Classification, Clustering, Neural Network зэрэг нийтлэг арга барилыг бодит мэдээлэл дээр ажиллуулна.',
    categorySlug: 'machine-learning',
    teacherEmail: 'bold.bagsh@ocp.mn',
    price: 189000,
    discountPrice: 149000,
    difficulty: CourseDifficulty.ADVANCED,
    language: 'mn',
    durationMinutes: 2400,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop',
    tags: ['Machine Learning', 'Python', 'TensorFlow', 'AI'],
    lessons: [
      {
        title: 'Машин сургалтын тойм болон Scikit-learn',
        type: LessonType.VIDEO,
        duration: 50,
        isPreview: true,
      },
      { title: 'Regression болон Classification', type: LessonType.VIDEO, duration: 60 },
      { title: 'Neural Network ба TensorFlow суурь', type: LessonType.VIDEO, duration: 70 },
      { title: 'CNN ашиглан зургийн таних систем', type: LessonType.VIDEO, duration: 65 },
      { title: 'ML загвар deploy хийх', type: LessonType.ASSIGNMENT, duration: 90 },
    ],
  },
  {
    title: 'Photoshop болон Illustrator: Визуал дизайн',
    slug: 'photoshop-illustrator',
    description:
      'Adobe Photoshop болон Illustrator хэрэгслийг эзэмшиж, лого, постер, брэндийн материал зэрэг бодит дизайн бүтээх чадвар олж авна. График дизайнерийн карьерт бэлтгэнэ.',
    categorySlug: 'graphic-design',
    teacherEmail: 'enkh.bagsh@ocp.mn',
    price: 99000,
    discountPrice: 69000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 1200,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&auto=format&fit=crop',
    tags: ['Photoshop', 'Illustrator', 'Graphic Design', 'Adobe'],
    lessons: [
      {
        title: 'Photoshop интерфейс ба суурь хэрэгслүүд',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'Давхарга (Layer) болон маск', type: LessonType.VIDEO, duration: 45 },
      { title: 'Illustrator — Vector болон зам', type: LessonType.VIDEO, duration: 50 },
      { title: 'Лого болон брэнд материал үүсгэх', type: LessonType.VIDEO, duration: 55 },
      { title: 'Дизайн дасгал — постер гүйцэтгэх', type: LessonType.ASSIGNMENT, duration: 60 },
    ],
  },
  {
    title: 'Flutter-ээр кросс-платформ мобайл апп',
    slug: 'flutter-cross-platform',
    description:
      'Google-ийн Flutter framework ашиглан iOS болон Android-д ажиллах апп нэг кодоор хөгжүүлнэ. Dart хэл, Widget систем, State management, Firebase интеграцийг хамарна.',
    categorySlug: 'mobile-development',
    teacherEmail: 'enkh.bagsh@ocp.mn',
    price: 149000,
    discountPrice: null,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 1950,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&auto=format&fit=crop',
    tags: ['Flutter', 'Dart', 'Firebase', 'Mobile'],
    lessons: [
      {
        title: 'Dart хэл болон Flutter танилцуулга',
        type: LessonType.VIDEO,
        duration: 45,
        isPreview: true,
      },
      { title: 'Widget систем — Stateless ба Stateful', type: LessonType.VIDEO, duration: 55 },
      { title: 'Navigation болон Routing', type: LessonType.VIDEO, duration: 50 },
      { title: 'Firebase: Auth болон Firestore', type: LessonType.VIDEO, duration: 60 },
      { title: 'Flutter апп publish хийх', type: LessonType.VIDEO, duration: 40 },
    ],
  },
  {
    title: 'Email маркетинг ба автоматжуулалт',
    slug: 'email-marketing-automation',
    description:
      'Mailchimp, ActiveCampaign зэрэг хэрэгслийг ашиглан email кампейн зохион байгуулах, автоматжуулах, conversion нэмэгдүүлэх арга техникийг сурна.',
    categorySlug: 'digital-marketing',
    teacherEmail: 'saraa.bagsh@ocp.mn',
    price: 79000,
    discountPrice: null,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 900,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop',
    tags: ['Email Marketing', 'Mailchimp', 'Автоматжуулалт', 'Маркетинг'],
    lessons: [
      {
        title: 'Email маркетингийн үндэс болон стратеги',
        type: LessonType.VIDEO,
        duration: 35,
        isPreview: true,
      },
      { title: 'Mailchimp тохиргоо ба жагсаалт удирдлага', type: LessonType.VIDEO, duration: 40 },
      { title: 'Email загвар болон copywriting', type: LessonType.VIDEO, duration: 45 },
      { title: 'Автомат дарааллал (Sequence) тохируулах', type: LessonType.VIDEO, duration: 50 },
      { title: 'Шалгалт — email кампейн эхлүүлэх', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'MongoDB болон NoSQL мэдээллийн сан',
    slug: 'mongodb-nosql',
    description:
      'MongoDB-ийн суурь ойлголт, schema дизайн, aggregation pipeline, index оновчлол болон Node.js-тэй хамт ашиглахыг бүрэн эзэмшинэ. NoSQL шийдэл сонгох мэдлэг олгоно.',
    categorySlug: 'backend-development',
    teacherEmail: 'teacher@ocp.mn',
    price: 109000,
    discountPrice: 79000,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 1350,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop',
    tags: ['MongoDB', 'NoSQL', 'Database', 'Backend'],
    lessons: [
      {
        title: 'MongoDB болон NoSQL танилцуулга',
        type: LessonType.VIDEO,
        duration: 35,
        isPreview: true,
      },
      { title: 'CRUD үйлдэл болон Schema дизайн', type: LessonType.VIDEO, duration: 50 },
      { title: 'Aggregation Pipeline', type: LessonType.VIDEO, duration: 55 },
      { title: 'Index болон performance оновчлол', type: LessonType.VIDEO, duration: 50 },
      { title: 'MongoDB шалгалт', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'Agile болон Scrum: Төслийн удирдлага',
    slug: 'agile-scrum-management',
    description:
      'Agile арга зүй, Scrum framework-ийн зарчмуудыг практикаар сурна. Sprint, Backlog, Daily Standup, Retrospective зэрэг Scrum ceremony-уудыг бодит багийн ажилд хэрхэн хэрэглэхийг эзэмшинэ.',
    categorySlug: 'management',
    teacherEmail: 'saraa.bagsh@ocp.mn',
    price: 89000,
    discountPrice: 59000,
    difficulty: CourseDifficulty.BEGINNER,
    language: 'mn',
    durationMinutes: 900,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop',
    tags: ['Agile', 'Scrum', 'Төслийн удирдлага', 'Менежмент'],
    lessons: [
      {
        title: 'Agile manifesto болон зарчмууд',
        type: LessonType.VIDEO,
        duration: 35,
        isPreview: true,
      },
      { title: 'Scrum роль: PO, SM, Team', type: LessonType.VIDEO, duration: 40 },
      { title: 'Sprint төлөвлөлт болон Backlog', type: LessonType.VIDEO, duration: 45 },
      { title: 'Retrospective болон Kanban', type: LessonType.VIDEO, duration: 40 },
      { title: 'Agile Scrum шалгалт', type: LessonType.QUIZ, duration: 30 },
    ],
  },
  {
    title: 'Санхүүгийн тайлан ба Excel-ийн дэвшилтэт чадварууд',
    slug: 'financial-reporting-excel',
    description:
      'Санхүүгийн тайлан уншиж дүн шинжилгээ хийх, Excel-ийн дэвшилтэт функцуудыг ашиглан санхүүгийн загвар үүсгэх. Нягтлан бодогч, санхүүгийн шинжээчдэд чиглэсэн курс.',
    categorySlug: 'data-analysis',
    teacherEmail: 'bold.bagsh@ocp.mn',
    price: 99000,
    discountPrice: null,
    difficulty: CourseDifficulty.INTERMEDIATE,
    language: 'mn',
    durationMinutes: 1050,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    tags: ['Excel', 'Санхүү', 'Тайлан', 'Мэдээллийн шинжилгээ'],
    lessons: [
      {
        title: 'Санхүүгийн тайлангийн бүтэц болон уншилт',
        type: LessonType.VIDEO,
        duration: 40,
        isPreview: true,
      },
      { title: 'Excel: XLOOKUP, SUMIFS, динамик массив', type: LessonType.VIDEO, duration: 50 },
      { title: 'DCF болон санхүүгийн загвар', type: LessonType.VIDEO, duration: 55 },
      { title: 'Power Query ба Power Pivot', type: LessonType.VIDEO, duration: 55 },
      { title: 'Санхүүгийн тайлан дасгал', type: LessonType.ASSIGNMENT, duration: 75 },
    ],
  },
];

// ─── Элсэлтийн тохиргоо ──────────────────────────────────────────────────────

/**
 * Оюутан бүрт хэдэн курсд элсэхийг тодорхойлно.
 * Жагсаалт: [student_index, course_index[]]
 */
const ENROLLMENT_MAP: [number, number[]][] = [
  // Эхний 10 сургалт (0–9)
  [0, [0, 1, 9, 10]],
  [1, [0, 2, 7, 11]],
  [2, [1, 3, 8, 12]],
  [3, [0, 4, 6, 13]],
  [4, [2, 5, 9, 14]],
  [5, [1, 6, 7, 15]],
  [6, [0, 3, 8, 16]],
  [7, [2, 4, 5, 17]],
  [8, [1, 7, 9, 18]],
  [9, [0, 6, 8, 19]],
  // Шинэ 10 сургалт (10–19)
  [10, [3, 5, 10, 13]],
  [11, [1, 2, 11, 14]],
  [12, [0, 8, 12, 15]],
  [13, [4, 6, 16, 19]],
  [14, [2, 9, 10, 17]],
  [15, [1, 5, 11, 18]],
  [16, [3, 7, 12, 13]],
  [17, [0, 4, 14, 19]],
  [18, [6, 8, 15, 16]],
  [19, [2, 5, 17, 18]],
];

// ─── Тусдаа функцүүд ─────────────────────────────────────────────────────────

/** Хэрэглэгч үүсгэх/шинэчлэх */
async function upsertUser(
  email: string,
  password: string,
  role: Role,
  firstName: string,
  lastName: string,
  bio?: string,
): Promise<string> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role, passwordHash },
    create: { email, passwordHash, role, emailVerified: true },
  });
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: { firstName, lastName, bio: bio ?? null },
    create: { userId: user.id, firstName, lastName, bio: bio ?? null },
  });
  return user.id;
}

/** Ангилал үүсгэх/шинэчлэх */
async function upsertCategory(
  name: string,
  slug: string,
  parentId: string | null,
  displayOrder: number,
  description?: string,
): Promise<string> {
  const cat = await prisma.category.upsert({
    where: { slug },
    update: { name, parentId, displayOrder, description: description ?? null },
    create: { name, slug, parentId, displayOrder, description: description ?? null },
  });
  return cat.id;
}

// ─── Үндсэн seed функц ───────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Seed эхэлж байна...\n');

  // ── 1. ХЭРЭГЛЭГЧИД ─────────────────────────────────────────────────────────
  console.log('👤  Хэрэглэгчид үүсгэж байна...');

  // Admin
  const adminId = await upsertUser(
    ADMIN_USER.email,
    ADMIN_USER.password,
    ADMIN_USER.role,
    ADMIN_USER.firstName,
    ADMIN_USER.lastName,
  );
  console.log(`  ✓ ADMIN: ${ADMIN_USER.email}`);

  // Багш нар
  const teacherIds: string[] = [];
  for (const t of TEACHERS) {
    const id = await upsertUser(t.email, t.password, t.role, t.firstName, t.lastName, t.bio);
    teacherIds.push(id);
    console.log(`  ✓ TEACHER: ${t.email}`);
  }

  // Оюутан нар
  const studentIds: string[] = [];
  for (const s of STUDENTS) {
    const id = await upsertUser(s.email, s.password, Role.STUDENT, s.firstName, s.lastName);
    studentIds.push(id);
  }
  console.log(`  ✓ STUDENT x${studentIds.length} үүслээ\n`);

  // Нэвтрэх мэдээлэл хэвлэх
  console.log('  📋  Нэвтрэх мэдээлэл:');
  console.log(`    Admin:   admin@ocp.mn          / Admin123!`);
  console.log(`    Teacher: teacher@ocp.mn         / Teacher123!`);
  console.log(`    Teacher: dorj.bagsh@ocp.mn      / Teacher123!`);
  console.log(`    Teacher: enkh.bagsh@ocp.mn      / Teacher123!`);
  console.log(`    Teacher: bold.bagsh@ocp.mn      / Teacher123!`);
  console.log(`    Teacher: saraa.bagsh@ocp.mn     / Teacher123!`);
  console.log(`    Student: student@ocp.mn         / Student123!`);
  console.log(`    Student: bat.od@ocp.mn          / Student123!\n`);

  // ── 2. АНГИЛЛУУД ────────────────────────────────────────────────────────────
  console.log('📂  Ангиллууд үүсгэж байна...');

  const categoryIdBySlug: Record<string, string> = {};

  for (const cat of CATEGORIES_DATA) {
    const parentId = await upsertCategory(
      cat.name,
      cat.slug,
      null,
      cat.displayOrder,
      cat.description,
    );
    categoryIdBySlug[cat.slug] = parentId;

    for (const child of cat.children) {
      const childId = await upsertCategory(child.name, child.slug, parentId, child.displayOrder);
      categoryIdBySlug[child.slug] = childId;
    }
  }
  console.log(`  ✓ ${Object.keys(categoryIdBySlug).length} ангилал үүслээ\n`);

  // ── 3. СУРГАЛТ + ХИЧЭЭЛҮҮД ──────────────────────────────────────────────────
  console.log('📚  Сургалт ба хичээлүүд үүсгэж байна...');

  /** Багшийн email → userId хөрвүүлэлт */
  const teacherEmailToId: Record<string, string> = {};
  for (let i = 0; i < TEACHERS.length; i++) {
    teacherEmailToId[TEACHERS[i].email] = teacherIds[i];
  }

  const courseIds: string[] = [];

  for (const courseData of COURSES_DATA) {
    const instructorId = teacherEmailToId[courseData.teacherEmail];
    const categoryId = categoryIdBySlug[courseData.categorySlug];

    if (!instructorId || !categoryId) {
      console.warn(`  ⚠ Алдаа: ${courseData.slug} — instructor эсвэл category олдсонгүй`);
      continue;
    }

    // Сургалт upsert
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        discountPrice: courseData.discountPrice,
        difficulty: courseData.difficulty,
        language: courseData.language,
        durationMinutes: courseData.durationMinutes,
        thumbnailUrl: courseData.thumbnailUrl,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
        instructorId,
        categoryId,
      },
      create: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        price: courseData.price,
        discountPrice: courseData.discountPrice,
        difficulty: courseData.difficulty,
        language: courseData.language,
        durationMinutes: courseData.durationMinutes,
        thumbnailUrl: courseData.thumbnailUrl,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
        instructorId,
        categoryId,
      },
    });

    courseIds.push(course.id);

    // Tag-ууд
    for (const tagName of courseData.tags) {
      const existing = await prisma.courseTag.findFirst({
        where: { courseId: course.id, tagName },
      });
      if (!existing) {
        await prisma.courseTag.create({ data: { courseId: course.id, tagName } });
      }
    }

    // Хичээлүүд
    for (let i = 0; i < courseData.lessons.length; i++) {
      const lessonData = courseData.lessons[i];
      const existingLesson = await prisma.lesson.findFirst({
        where: { courseId: course.id, orderIndex: i + 1 },
      });

      if (!existingLesson) {
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: lessonData.title,
            orderIndex: i + 1,
            lessonType: lessonData.type,
            durationMinutes: lessonData.duration,
            isPreview: lessonData.isPreview ?? false,
            isPublished: true,
          },
        });
      }
    }

    console.log(`  ✓ "${courseData.title.slice(0, 40)}..."`);
  }
  console.log(`  ✓ ${courseIds.length} сургалт, ${courseIds.length * 5} хичээл үүслээ\n`);

  // ── 4. ЭЛСЭЛТ + АХИЦ ───────────────────────────────────────────────────────
  console.log('📝  Элсэлт ба ахиц үүсгэж байна...');

  let enrollmentCount = 0;
  let progressCount = 0;

  for (const [studentIdx, courseIndices] of ENROLLMENT_MAP) {
    const studentId = studentIds[studentIdx];
    if (!studentId) continue;

    for (const courseIdx of courseIndices) {
      const courseId = courseIds[courseIdx];
      if (!courseId) continue;

      // Элсэлт upsert
      const enrollment = await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: studentId, courseId } },
        update: {},
        create: {
          userId: studentId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
          enrolledAt: new Date(Date.now() - Math.random() * 60 * 24 * 3600 * 1000), // Сүүлийн 60 хоногийн дотор
        },
      });
      enrollmentCount++;

      // Хичээлүүдийн ахиц — анхны 2-3 хичээл дуусгасан гэж тооцно
      const lessons = await prisma.lesson.findMany({
        where: { courseId, isPublished: true },
        orderBy: { orderIndex: 'asc' },
      });

      // Оюутан бүрт 0–3 хичээл дуусгана
      const completedCount = Math.floor(Math.random() * 4);

      for (let li = 0; li < lessons.length; li++) {
        const lesson = lessons[li];
        const isCompleted = li < completedCount;
        const progressPct = isCompleted
          ? 100
          : li === completedCount
            ? Math.floor(Math.random() * 80)
            : 0;

        if (progressPct > 0) {
          await prisma.userProgress.upsert({
            where: { userId_lessonId: { userId: studentId, lessonId: lesson.id } },
            update: {},
            create: {
              userId: studentId,
              lessonId: lesson.id,
              progressPercentage: progressPct,
              completed: isCompleted,
              timeSpentSeconds: lesson.durationMinutes * 60 * (progressPct / 100),
              lastPositionSeconds: isCompleted ? 0 : lesson.durationMinutes * 60 * 0.8,
              completedAt: isCompleted ? new Date() : null,
            },
          });
          progressCount++;
        }
      }

      // Элсэлтийн статус шинэчлэх — бүх хичээл дуусгасан бол COMPLETED
      if (completedCount >= lessons.length && lessons.length > 0) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: EnrollmentStatus.COMPLETED, completedAt: new Date() },
        });
      }
    }
  }

  console.log(`  ✓ ${enrollmentCount} элсэлт үүслээ`);
  console.log(`  ✓ ${progressCount} ахицын бичлэг үүслээ\n`);

  // ── 5. СИСТЕМИЙН ТОХИРГОО ──────────────────────────────────────────────────
  console.log('⚙️   Системийн тохиргоо үүсгэж байна...');

  const settings = [
    {
      key: 'site.name',
      value: 'OCP Learnify',
      category: 'general',
      isPublic: true,
      description: 'Платформын нэр',
    },
    {
      key: 'site.tagline',
      value: 'Монголын онлайн сургалтын платформ',
      category: 'general',
      isPublic: true,
      description: 'Платформын товч тодорхойлолт',
    },
    {
      key: 'site.supportEmail',
      value: 'support@ocp.mn',
      category: 'general',
      isPublic: true,
      description: 'Дэмжлэгийн имэйл хаяг',
    },
    {
      key: 'payment.bankAccount',
      value: '1234567890',
      category: 'payment',
      isPublic: false,
      description: 'Банкны дансны дугаар',
    },
    {
      key: 'payment.bankName',
      value: 'Хаан банк',
      category: 'payment',
      isPublic: true,
      description: 'Банкны нэр',
    },
    {
      key: 'payment.currency',
      value: 'MNT',
      category: 'payment',
      isPublic: true,
      description: 'Үндсэн валют',
    },
    {
      key: 'email.fromName',
      value: 'OCP Learnify',
      category: 'email',
      isPublic: false,
      description: 'Имэйлийн илгээгчийн нэр',
    },
    {
      key: 'security.maxLoginAttempts',
      value: 5,
      category: 'security',
      isPublic: false,
      description: 'Нэвтрэлтийн оролдлогын дээд тоо',
    },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: {
        key: s.key,
        value: s.value,
        category: s.category,
        isPublic: s.isPublic,
        description: s.description,
        updatedBy: adminId,
      },
    });
  }
  console.log(`  ✓ ${settings.length} тохиргоо үүслээ\n`);

  console.log('✅  Seed амжилттай дууслаа!');
  console.log('\n📊  Нийт үүсгэсэн:');
  console.log(`    👤 Хэрэглэгч:   ${1 + TEACHERS.length + STUDENTS.length}`);
  console.log(`    📂 Ангилал:     ${Object.keys(categoryIdBySlug).length}`);
  console.log(`    📚 Сургалт:     ${courseIds.length}`);
  console.log(`    📖 Хичээл:      ${courseIds.length * 5}`);
  console.log(`    📝 Элсэлт:      ${enrollmentCount}`);
  console.log(`    📈 Ахиц:        ${progressCount}`);
  console.log(`    ⚙️  Тохиргоо:    ${settings.length}`);
}

seed()
  .catch((error) => {
    console.error('❌  Seed алдаа:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
