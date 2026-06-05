import { getAnalyticsData, getAnalyticsFilters } from "@/src/app/actions/analytics";
import AnalyticsDashboard from "@/src/components/analytics/analytics-dashboard";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : undefined;
  const month = params.month ? parseInt(params.month) : undefined;

  const [data, filters] = await Promise.all([
    getAnalyticsData(year, month),
    getAnalyticsFilters(),
  ]);

  return <AnalyticsDashboard data={data} filters={filters} selectedYear={year} selectedMonth={month} />;
}
