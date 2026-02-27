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
    profileById: (userId: string) => ['users', 'profile', userId] as const,
    stats: (userId: string) => ['users', 'stats', userId] as const,
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
    detail: (id: string) => ['enrollments', 'detail', id] as const,
    byCourse: (courseId: string, params?: object) =>
      ['enrollments', 'course', courseId, params] as const,
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
    detail: (id: string) => ['certificates', 'detail', id] as const,
    verify: (code: string) => ['certificates', 'verify', code] as const,
    byCourse: (courseId: string, params?: object) =>
      ['certificates', 'course', courseId, params] as const,
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
    detail: (postId: string) => ['discussions', 'detail', postId] as const,
  },
  quizzes: {
    byLesson: (lessonId: string) => ['quizzes', 'lesson', lessonId] as const,
    byId: (quizId: string) => ['quizzes', 'detail', quizId] as const,
    myAttempts: (quizId: string) => ['quizzes', 'attempts', 'my', quizId] as const,
    studentAttempts: (quizId: string, params?: object) =>
      ['quizzes', 'attempts', 'students', quizId, params] as const,
    attemptDetail: (quizId: string, attemptId: string) =>
      ['quizzes', 'attempts', 'detail', quizId, attemptId] as const,
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
  TEACHER_COURSE_NEW: '/teacher/courses/new',
  TEACHER_COURSE_EDIT: (courseId: string) => `/teacher/courses/${courseId}/edit` as const,
  TEACHER_CURRICULUM: (courseId: string) => `/teacher/courses/${courseId}/curriculum` as const,
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ENROLLMENTS: '/admin/enrollments',
  ADMIN_ENROLLMENT_DETAIL: (id: string) => `/admin/enrollments/${id}` as const,
  TEACHER_STUDENTS: (courseId: string) => `/teacher/courses/${courseId}/students` as const,
  PUBLIC_PROFILE: (userId: string) => `/profile/${userId}` as const,
  TEACHER_LESSON_CONTENT: (courseId: string, lessonId: string) =>
    `/teacher/courses/${courseId}/lessons/${lessonId}/content` as const,
  PROGRESS: '/progress',
  COURSE_PROGRESS: (slug: string) => `/courses/${slug}/progress` as const,
  QUIZ_TAKE: (quizId: string) => `/quiz/${quizId}/take` as const,
  QUIZ_RESULTS: (quizId: string, attemptId: string) =>
    `/quiz/${quizId}/results/${attemptId}` as const,
  TEACHER_QUIZ: (courseId: string, lessonId: string) =>
    `/teacher/courses/${courseId}/lessons/${lessonId}/quiz` as const,
  TEACHER_QUIZ_QUESTIONS: (courseId: string, lessonId: string) =>
    `/teacher/courses/${courseId}/lessons/${lessonId}/quiz/questions` as const,
  TEACHER_QUIZ_ATTEMPTS: (courseId: string, lessonId: string) =>
    `/teacher/courses/${courseId}/lessons/${lessonId}/quiz/attempts` as const,
  TEACHER_QUIZ_GRADE: (courseId: string, lessonId: string, attemptId: string) =>
    `/teacher/courses/${courseId}/lessons/${lessonId}/quiz/attempts/${attemptId}` as const,
  CERTIFICATES: '/certificates',
  CERTIFICATE_DETAIL: (id: string) => `/certificates/${id}` as const,
  CERTIFICATE_VERIFY: '/verify',
  TEACHER_COURSE_CERTIFICATES: (courseId: string) =>
    `/teacher/courses/${courseId}/certificates` as const,
  COURSE_DISCUSSIONS: (slug: string) => `/courses/${slug}/discussions` as const,
  COURSE_DISCUSSION_NEW: (slug: string) => `/courses/${slug}/discussions/new` as const,
  COURSE_DISCUSSION_POST: (slug: string, postId: string) =>
    `/courses/${slug}/discussions/${postId}` as const,
} as const;
