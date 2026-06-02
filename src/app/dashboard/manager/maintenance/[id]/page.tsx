import { redirect } from "next/navigation";

export default async function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/manager/maintenance/${id}/edit`);
}
