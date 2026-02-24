// Auth hooks
export { useLogin, useRegister, useLogout, useForgotPassword, useResetPassword } from './use-auth';

// Course hooks
export { useCourseList, useCourseBySlug, useCourseById, useMyCourses } from './use-courses';

// Category hooks
export { useCategoryTree } from './use-categories';

// Enrollment hooks
export { useMyEnrollments, useCheckEnrollment, useEnroll } from './use-enrollments';

// Progress hooks
export {
  useMyProgress,
  useCourseProgress,
  useLessonProgress,
  useCompleteLesson,
  useUpdateVideoPosition,
} from './use-progress';

// Profile hooks
export { useMyProfile, useUpdateProfile } from './use-profile';

// Notification hooks
export {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from './use-notifications';

// Certificate hooks
export { useMyCertificates } from './use-certificates';

// Lesson hooks
export {
  useCourseLessons,
  useLessonById,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useTogglePublishLesson,
  useReorderLessons,
} from './use-lessons';

// Content hooks
export {
  useLessonContent,
  useSetTextContent,
  useSetVideoContent,
  useUpdateContent,
  useDeleteContent,
  useUploadFile,
} from './use-content';

// Discussion hooks
export {
  useDiscussionPosts,
  useCreateDiscussionPost,
  useAddReply,
  useVoteDiscussionPost,
} from './use-discussions';

// Comment hooks
export {
  useLessonComments,
  useCreateComment,
  useReplyComment,
  useUpvoteComment,
} from './use-comments';

// Admin hooks
export { useAdminUsers, useUpdateUserRole, useDeleteUser } from './use-admin';
