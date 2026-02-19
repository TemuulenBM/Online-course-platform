/**
 * Notification template-ууд.
 * Бусад модулиудаас NotificationService.send()-д ашиглагдана.
 * {{key}} placeholder-ийг data-аар орлуулна.
 */
export const NOTIFICATION_TEMPLATES = {
  ENROLLMENT_CONFIRMED: {
    title: '{{courseTitle}} сургалтад амжилттай элслээ',
    message: 'Та "{{courseTitle}}" сургалтад амжилттай элслээ. Сургалтаа эхлүүлээрэй!',
  },
  COURSE_COMPLETED: {
    title: '{{courseTitle}} сургалтыг амжилттай дууслаа!',
    message: 'Та "{{courseTitle}}" сургалтыг бүрэн дууслаа. Баяр хүргэе!',
  },
  QUIZ_GRADED: {
    title: '{{quizTitle}} шалгалтын дүн гарлаа',
    message: 'Таны "{{quizTitle}}" шалгалтын дүн: {{score}}/{{maxScore}}',
  },
  CERTIFICATE_ISSUED: {
    title: 'Сертификат олгогдлоо!',
    message:
      '"{{courseTitle}}" сургалтын сертификат амжилттай олгогдлоо. Сертификатын дугаар: {{certificateNumber}}',
  },
  DISCUSSION_REPLY: {
    title: 'Таны нийтлэлд хариулт ирлээ',
    message: '"{{postTitle}}" нийтлэлд шинэ хариулт нэмэгдлээ.',
  },
  ANSWER_ACCEPTED: {
    title: 'Таны хариулт зөв хариулт болгогдлоо!',
    message: '"{{postTitle}}" нийтлэл дээрх таны хариулт зөв хариулт болгогдлоо.',
  },
} as const;

/** Template дахь {{key}} placeholder-ийг data-аар орлуулна */
export function renderTemplate(
  template: { title: string; message: string },
  data: Record<string, string>,
): { title: string; message: string } {
  let title = template.title;
  let message = template.message;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    title = title.replaceAll(placeholder, value);
    message = message.replaceAll(placeholder, value);
  }
  return { title, message };
}
