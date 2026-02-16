/**
 * Сургалт үүсгэсэн домэйн event.
 * Шинэ сургалт амжилттай үүсгэгдсэн үед ашиглагдана.
 */
export class CourseCreatedEvent {
  constructor(
    public readonly courseId: string,
    public readonly instructorId: string,
    public readonly title: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
