import { redirect } from "next/navigation";

export default async function CleaningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/manager/cleanings/${id}/edit`);
}
