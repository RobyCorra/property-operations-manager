import { getAnalyticsData, getAnalyticsFilters } from "@/src/app/actions/analytics";
import AnalyticsDashboard from "@/src/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  const [data, filters] = await Promise.all([
    getAnalyticsData(),
    getAnalyticsFilters(),
  ]);

  return <AnalyticsDashboard data={data} filters={filters} />;
}
