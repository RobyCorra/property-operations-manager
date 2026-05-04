"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export interface Activity {
  id: string;
  type: 'CLEANING' | 'MAINTENANCE';
  collaboratorName: string;
  collaboratorRole: string;
  apartmentName: string;
  apartmentId: string;
  status: string;
  priority?: string;
  date: Date;
  createdAt: Date;
  assignedToId: string | null;
  notes?: string | null;
  description?: string | null;
  title?: string;
}

type ActivityCleaning = {
  id: string;
  apartmentId: string;
  status: string;
  date: Date;
  createdAt: Date;
  assignedToId: string | null;
  notes: string | null;
  apartment: { name: string };
  assignedTo: { name: string } | null;
};

type ActivityTicket = {
  id: string;
  apartmentId: string;
  status: string;
  priority: string;
  scheduledStart: Date | null;
  createdAt: Date;
  assignedToId: string | null;
  title: string;
  description: string;
  apartment: { name: string };
  assignedTo: { name: string } | null;
};

export async function getTeamActivityHistory(filters: {
  collaboratorId?: string;
  apartmentId?: string;
  status?: string;
  type?: 'CLEANING' | 'MAINTENANCE';
  startDate?: string;
  endDate?: string;
  currentUserId: string;
  currentUserRole: string;
}) {
  const { collaboratorId, apartmentId, status, type, startDate, endDate, currentUserId, currentUserRole } = filters;

  const whereClause: any = {};

  // RBAC: If not manager, only see own tasks
  if (currentUserRole !== "MANAGER") {
    whereClause.assignedToId = currentUserId;
  } else if (collaboratorId) {
    whereClause.assignedToId = collaboratorId;
  }

  if (apartmentId) {
    whereClause.apartmentId = apartmentId;
  }

  if (status) {
    whereClause.status = status;
  }

  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const [cleanings, tickets] = await Promise.all([
    // Fetch Cleanings
    (!type || type === 'CLEANING') 
      ? prisma.cleaningTask.findMany({
          where: {
            ...whereClause,
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          },
          include: {
            apartment: true,
            assignedTo: true,
          },
          orderBy: { date: 'desc' },
        })
      : Promise.resolve([]),

    // Fetch Maintenance
    (!type || type === 'MAINTENANCE')
      ? prisma.maintenanceTicket.findMany({
          where: {
            ...whereClause,
            ...(Object.keys(dateFilter).length > 0 ? { scheduledStart: dateFilter } : {}),
          },
          include: {
            apartment: true,
            assignedTo: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ]);

  const mappedCleanings: Activity[] = cleanings.map((c: ActivityCleaning) => ({
    id: c.id,
    type: 'CLEANING',
    collaboratorName: c.assignedTo?.name || 'Non assegnato',
    collaboratorRole: 'CLEANER',
    apartmentName: c.apartment.name,
    apartmentId: c.apartmentId,
    status: c.status,
    date: c.date,
    createdAt: c.createdAt,
    assignedToId: c.assignedToId,
    notes: c.notes,
  }));

  const mappedTickets: Activity[] = tickets.map((t: ActivityTicket) => ({
    id: t.id,
    type: 'MAINTENANCE',
    collaboratorName: t.assignedTo?.name || 'Non assegnato',
    collaboratorRole: 'MAINTENANCE',
    apartmentName: t.apartment.name,
    apartmentId: t.apartmentId,
    status: t.status,
    priority: t.priority,
    date: t.scheduledStart || t.createdAt,
    createdAt: t.createdAt,
    assignedToId: t.assignedToId,
    title: t.title,
    description: t.description,
  }));

  return [...mappedCleanings, ...mappedTickets].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getActivityDetails(id: string, type: 'CLEANING' | 'MAINTENANCE') {
  if (type === 'CLEANING') {
    return await prisma.cleaningTask.findUnique({
      where: { id },
      include: {
        apartment: true,
        assignedTo: true,
        messages: {
          include: { attachment: true },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
      }
    });
  } else {
    return await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        apartment: true,
        assignedTo: true,
        messages: {
          include: { attachment: true },
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
      }
    });
  }
}
