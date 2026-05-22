import { notFound } from "next/navigation";
import { getMaintenanceByToken } from "@/src/app/actions/maintenance-token";
import PublicMaintenanceView from "@/src/components/public-maintenance-view";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

export default async function PublicMaintenancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ticket = await getMaintenanceByToken(token);

  if (!ticket) return notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.apartment.address)}`;

  return (
    <PublicMaintenanceView
      ticketId={ticket.id}
      apartmentName={ticket.apartment.name}
      apartmentAddress={ticket.apartment.address}
      mapsUrl={mapsUrl}
      title={ticket.title}
      description={ticket.description}
      priority={ticket.priority}
      scheduledStart={ticket.scheduledStart ? formatRomeDateTimeDisplay(ticket.scheduledStart) : null}
      assignedToName={ticket.assignedTo?.name ?? null}
      attachments={ticket.attachments}
      currentStatus={ticket.status}
      tasks={Array.isArray(ticket.maintenanceTasks) ? (ticket.maintenanceTasks as any[]) : []}
      notes={Array.isArray(ticket.maintenanceNotes) ? (ticket.maintenanceNotes as any[]) : []}
    />
  );
}
