import sanitize from 'sanitize-html';

/**
 * Зөвшөөрөгдсөн HTML tag-уудын тохиргоо.
 * Хэлэлцүүлгийн нийтлэл, хариулт зэрэг rich text контентод ашиглагдана.
 * XSS халдлагаас хамгаалахын тулд whitelist арга хэрэглэнэ.
 */
const ALLOWED_HTML_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    // Текст бүтэц
    'p',
    'br',
    'hr',
    // Гарчиг
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Текст форматлалт
    'strong',
    'em',
    'b',
    'i',
    'u',
    'sub',
    'sup',
    'span',
    // Жагсаалт
    'ul',
    'ol',
    'li',
    // Код
    'code',
    'pre',
    // Блок
    'blockquote',
    // Холбоос, зураг
    'a',
    'img',
    // Хүснэгт
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    span: ['class'],
    code: ['class'],
    pre: ['class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  /** on* event handler болон style attribute-г автомат хориглоно */
  disallowedTagsMode: 'discard',
  /** a tag дээр rel="noopener noreferrer" автомат нэмнэ — tab-napping халдлагаас хамгаална */
  transformTags: {
    a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

/**
 * Rich text HTML контентыг цэвэрлэнэ.
 * Зөвшөөрөгдсөн tag/attribute-уудыг хадгалж, бусдыг strip хийнэ.
 * Discussion post, reply зэрэг contentHtml талбарт ашиглана.
 */
export function sanitizeRichHtml(dirty: string): string {
  if (!dirty) return '';
  return sanitize(dirty, ALLOWED_HTML_OPTIONS);
}

/**
 * Бүх HTML tag-ыг устгаж цэвэр текст буцаана.
 * Lesson comment, markdown content зэрэг талбарт ашиглана.
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty) return '';
  return sanitize(dirty, { allowedTags: [], allowedAttributes: {} });
}
