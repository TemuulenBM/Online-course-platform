/**
 * URL-д ашиглахад тохиромжтой slug үүсгэнэ.
 * Гарчигийг жижиг үсгээр хувиргаж, тусгай тэмдэгтүүдийг зураас ('-') болгоно.
 * @param title - Гарчиг
 * @returns Slug тэмдэгт мөр
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Давхардаагүй slug үүсгэнэ.
 * Давтагдсан бол slug-1, slug-2 гэх мэтээр дугаар нэмнэ.
 * @param baseSlug - Үндсэн slug
 * @param checkExists - Slug байгаа эсэхийг шалгах callback
 * @returns Давхардаагүй slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
