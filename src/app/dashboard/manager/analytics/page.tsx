import { getAnalyticsData, getAnalyticsFilters, getProductsAnalytics } from "@/src/app/actions/analytics";
import AnalyticsDashboard from "@/src/components/analytics/analytics-dashboard";
import ProductsAnalyticsSection from "@/src/components/analytics/products-analytics-section";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : undefined;
  const month = params.month ? parseInt(params.month) : undefined;

  const [data, filters, productsData] = await Promise.all([
    getAnalyticsData(year, month),
    getAnalyticsFilters(),
    getProductsAnalytics(year, month),
  ]);

  return (
    <>
      <AnalyticsDashboard data={data} filters={filters} selectedYear={year} selectedMonth={month} />
      <ProductsAnalyticsSection data={productsData} />
    </>
  );
}
