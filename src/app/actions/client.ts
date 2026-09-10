"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";

const PATH = "/dashboard/manager/clienti";

export type ClientType = "PRIVATE" | "COMPANY";

export type ClientFormData = {
  type: ClientType;
  name: string;
  vatNumber: string;
  taxCode: string;
  sdiCode: string;
  pec: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  province: string;
  country: string;
  notes: string;
  apartmentIds: string[];
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getClients() {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return [];
    return await prisma.client.findMany({
      where: { organizationId: orgId },
      orderBy: { name: "asc" },
      include: { apartments: { select: { id: true, name: true } } },
    });
  } catch (error) {
    console.error("getClients error:", error);
    return [];
  }
}

// Appartamenti dell'org con l'eventuale cliente già assegnato (per la selezione).
export async function getApartmentsForClientAssign() {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return [];
    return await prisma.apartment.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, clientId: true, client: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("getApartmentsForClientAssign error:", error);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clean(data: ClientFormData) {
  const t = (s: string) => (s?.trim() ? s.trim() : null);
  return {
    type: data.type === "COMPANY" ? "COMPANY" : "PRIVATE",
    name: data.name.trim(),
    vatNumber: t(data.vatNumber),
    taxCode: t(data.taxCode),
    sdiCode: t(data.sdiCode),
    pec: t(data.pec),
    email: t(data.email),
    phone: t(data.phone),
    address: t(data.address),
    city: t(data.city),
    zip: t(data.zip),
    province: t(data.province),
    country: t(data.country) ?? "Italia",
    notes: t(data.notes),
  };
}

// Assegna al cliente gli appartamenti scelti (org-scoped) e libera quelli rimossi.
async function syncApartments(clientId: string, orgId: string, apartmentIds: string[]) {
  await prisma.apartment.updateMany({
    where: { clientId, id: { notIn: apartmentIds.length ? apartmentIds : ["__none__"] } },
    data: { clientId: null },
  });
  if (apartmentIds.length) {
    await prisma.apartment.updateMany({
      where: { id: { in: apartmentIds }, organizationId: orgId },
      data: { clientId },
    });
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createClient(data: ClientFormData) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    if (!data.name.trim()) return { success: false, error: "Il nome è obbligatorio." };
    const created = await prisma.client.create({
      data: { organizationId: orgId, ...clean(data) },
    });
    await syncApartments(created.id, orgId, data.apartmentIds ?? []);
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("createClient error:", error);
    return { success: false, error: "Errore durante la creazione del cliente" };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateClient(id: string, data: ClientFormData) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    const existing = await prisma.client.findFirst({ where: { id, organizationId: orgId }, select: { id: true } });
    if (!existing) return { success: false, error: "Cliente non trovato." };
    if (!data.name.trim()) return { success: false, error: "Il nome è obbligatorio." };
    await prisma.client.update({ where: { id }, data: clean(data) });
    await syncApartments(id, orgId, data.apartmentIds ?? []);
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("updateClient error:", error);
    return { success: false, error: "Errore durante l'aggiornamento del cliente" };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteClient(id: string) {
  try {
    const orgId = await getCurrentOrg();
    if (!orgId) return { success: false, error: "Organizzazione non identificata." };
    // Le FK con onDelete SetNull liberano gli appartamenti collegati.
    await prisma.client.deleteMany({ where: { id, organizationId: orgId } });
    revalidatePath(PATH);
    return { success: true };
  } catch (error) {
    console.error("deleteClient error:", error);
    return { success: false, error: "Errore durante l'eliminazione del cliente" };
  }
}
