export type AdminStats = {
  pendingCount: number;
  approvedCount: number;
  thisMonthCount: number;
  approvalRate: number;
  byState: Record<string, number>;
  byCategory: Record<string, number>;
};
