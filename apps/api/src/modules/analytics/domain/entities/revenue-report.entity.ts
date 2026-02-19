/**
 * Орлогын тайлангийн value object.
 * Хугацааны бүлэглэлтэй (өдөр/сар/жил) орлогын мэдээлэл.
 */
export class RevenueReportItem {
  readonly period: string;
  readonly totalRevenue: number;
  readonly orderCount: number;

  constructor(props: { period: string; totalRevenue: number; orderCount: number }) {
    this.period = props.period;
    this.totalRevenue = Number(props.totalRevenue) || 0;
    this.orderCount = Number(props.orderCount) || 0;
  }

  toResponse() {
    return {
      period: this.period,
      totalRevenue: this.totalRevenue,
      orderCount: this.orderCount,
    };
  }
}

/** Орлогын тайлангийн нэгтгэсэн хариу */
export class RevenueReport {
  readonly data: RevenueReportItem[];
  readonly totalRevenue: number;
  readonly totalOrders: number;

  constructor(items: RevenueReportItem[]) {
    this.data = items;
    this.totalRevenue = items.reduce((sum, item) => sum + item.totalRevenue, 0);
    this.totalOrders = items.reduce((sum, item) => sum + item.orderCount, 0);
  }

  toResponse() {
    return {
      data: this.data.map((item) => item.toResponse()),
      totalRevenue: this.totalRevenue,
      totalOrders: this.totalOrders,
    };
  }
}
