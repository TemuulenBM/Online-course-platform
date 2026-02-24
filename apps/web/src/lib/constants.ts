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
    my: ['courses', 'my'] as const,
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
    byId: (lessonId: string) => ['lessons', 'lesson', lessonId] as const,
  },
  content: {
    byLesson: (lessonId: string) => ['content', 'lesson', lessonId] as const,
  },
  comments: {
    byLesson: (lessonId: string) => ['comments', 'lesson', lessonId] as const,
  },
  discussions: {
    byCourse: (courseId: string) => ['discussions', 'course', courseId] as const,
  },
  admin: {
    users: (params?: object) => ['admin', 'users', params] as const,
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
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: (slug: string) => `/courses/${slug}` as const,
  MY_COURSES: '/my-courses',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
  LESSON_VIEWER: (slug: string, lessonId: string) =>
    `/courses/${slug}/lessons/${lessonId}` as const,
  TEACHER_COURSES: '/teacher/courses',
  TEACHER_CURRICULUM: (courseId: string) => `/teacher/courses/${courseId}/curriculum` as const,
  ADMIN_USERS: '/admin/users',
} as const;
