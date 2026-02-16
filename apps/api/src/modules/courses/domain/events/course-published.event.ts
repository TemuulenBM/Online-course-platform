/**
 * Сургалт нийтлэгдсэн домэйн event.
 * Сургалт DRAFT → PUBLISHED болсон үед ашиглагдана.
 */
export class CoursePublishedEvent {
  constructor(
    public readonly courseId: string,
    public readonly instructorId: string,
    public readonly publishedAt: Date,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
