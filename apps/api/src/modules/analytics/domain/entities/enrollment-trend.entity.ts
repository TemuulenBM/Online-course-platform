/**
 * Элсэлтийн трэндийн value object.
 * Хугацааны бүлэглэлтэй (өдөр/сар/жил) элсэлтийн мэдээлэл.
 */
export class EnrollmentTrendItem {
  readonly period: string;
  readonly enrollmentCount: number;
  readonly completedCount: number;
  readonly cancelledCount: number;

  constructor(props: {
    period: string;
    enrollmentCount: number;
    completedCount: number;
    cancelledCount: number;
  }) {
    this.period = props.period;
    this.enrollmentCount = Number(props.enrollmentCount) || 0;
    this.completedCount = Number(props.completedCount) || 0;
    this.cancelledCount = Number(props.cancelledCount) || 0;
  }

  toResponse() {
    return {
      period: this.period,
      enrollmentCount: this.enrollmentCount,
      completedCount: this.completedCount,
      cancelledCount: this.cancelledCount,
    };
  }
}

/** Элсэлтийн трэндийн нэгтгэсэн хариу */
export class EnrollmentTrend {
  readonly data: EnrollmentTrendItem[];
  readonly totalEnrollments: number;
  readonly totalCompleted: number;

  constructor(items: EnrollmentTrendItem[]) {
    this.data = items;
    this.totalEnrollments = items.reduce((sum, item) => sum + item.enrollmentCount, 0);
    this.totalCompleted = items.reduce((sum, item) => sum + item.completedCount, 0);
  }

  toResponse() {
    return {
      data: this.data.map((item) => item.toResponse()),
      totalEnrollments: this.totalEnrollments,
      totalCompleted: this.totalCompleted,
    };
  }
}
