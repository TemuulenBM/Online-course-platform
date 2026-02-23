/**
 * React Query cache key-ууд.
 * Бүх query/mutation-д ашиглагдана — typo, key mismatch-аас хамгаална.
 */
export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    profile: ['users', 'profile'] as const,
  },
  courses: {
    list: (params?: object) => ['courses', 'list', params] as const,
    detail: (slug: string) => ['courses', 'detail', slug] as const,
    byId: (id: string) => ['courses', 'byId', id] as const,
  },
  categories: {
    tree: ['categories', 'tree'] as const,
  },
  enrollments: {
    my: (params?: object) => ['enrollments', 'my', params] as const,
    check: (courseId: string) => ['enrollments', 'check', courseId] as const,
  },
  progress: {
    my: (params?: object) => ['progress', 'my', params] as const,
    course: (courseId: string) => ['progress', 'course', courseId] as const,
    lesson: (lessonId: string) => ['progress', 'lesson', lessonId] as const,
  },
  notifications: {
    list: (params?: object) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  certificates: {
    my: (params?: object) => ['certificates', 'my', params] as const,
  },
  lessons: {
    byCourse: (courseId: string) => ['lessons', 'course', courseId] as const,
  },
} as const;

/**
 * Хуудасны route path-ууд.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: (slug: string) => `/courses/${slug}` as const,
  MY_COURSES: '/my-courses',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;
