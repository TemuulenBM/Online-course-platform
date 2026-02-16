/**
 * Ангиллын домэйн entity.
 * Сургалтын ангилал (категори) бүтцийг төлөөлнө, мод хэлбэрийн бүтэцтэй.
 */
export class CategoryEntity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly parentId: string | null;
  readonly displayOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly children?: CategoryEntity[];
  readonly coursesCount?: number;

  constructor(props: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    children?: CategoryEntity[];
    coursesCount?: number;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.parentId = props.parentId;
    this.displayOrder = props.displayOrder;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.children = props.children;
    this.coursesCount = props.coursesCount;
  }

  /** Ангиллын мэдээллийг response хэлбэрээр буцаана */
  toResponse(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      parentId: this.parentId,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      children: this.children?.map((child) => child.toResponse()),
      coursesCount: this.coursesCount,
    };
  }
}
