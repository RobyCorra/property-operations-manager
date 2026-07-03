import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import CheckinTaskView from "@/src/components/checkin-task-view";
import { ChevronLeft } from "lucide-react";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import { getCheckinTaskMessages, markCheckinMessagesReadByWorker } from "@/src/app/actions/checkin";

export default async function CheckinTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "CHECKIN" || !userId) redirect("/login");

  const { taskId } = await params;

  const [task, userRecord, messages] = await Promise.all([
    prisma.checkinTask.findFirst({
      where: { id: taskId, assignedToId: userId },
      include: {
        apartment: { select: { name: true, address: true } },
        booking: { select: { guestName: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    getCheckinTaskMessages(taskId),
  ]);

  if (!task) notFound();

  await markCheckinMessagesReadByWorker(taskId);

  const progress = Array.isArray(task.checklistProgress) ? (task.checklistProgress as any[]) : [];
  const items = progress.map((i) => ({
    id: i.id,
    label: i.label,
    required: !!i.required,
    photoRequired: !!i.photoRequired,
    completed: !!i.completed,
    photoUrl: i.photoUrl ?? null,
  }));

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.apartment.address)}`;

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <div className="sticky top-0 z-50 bg-indigo-900/90 backdrop-blur-sm px-4 py-3" style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}>
        <Link
          href="/dashboard/checkin"
          className="flex items-center gap-1.5 text-white/90 text-xs font-black uppercase tracking-widest"
        >
          <ChevronLeft size={14} />
          Dashboard
        </Link>
      </div>

      <CheckinTaskView
        taskId={task.id}
        apartmentName={task.apartment.name}
        apartmentAddress={task.apartment.address}
        mapsUrl={mapsUrl}
        dateLabel={formatRomeDateTimeDisplay(task.date)}
        guestName={task.booking?.guestName ?? null}
        initialItems={items}
        readOnly={task.status === "COMPLETED"}
        initialMessages={messages}
        currentUserName={userRecord?.name ?? "Assistente"}
      />
    </div>
  );
}
