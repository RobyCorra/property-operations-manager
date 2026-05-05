import { prisma } from "@/src/lib/prisma";

type ExistingApartmentCode = {
  apartmentCode?: string | null;
};

export function generateApartmentCode(name: string) {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueApartmentCode(name: string, excludeApartmentId?: string) {
  const baseCode = generateApartmentCode(name) || "APPARTAMENTO";
  const existingApartments = await prisma.apartment.findMany({
    where: {
      apartmentCode: { startsWith: baseCode },
      ...(excludeApartmentId ? { id: { not: excludeApartmentId } } : {}),
    },
    select: { apartmentCode: true },
  });
  const existingCodes = new Set(
    existingApartments
      .map((apartment: ExistingApartmentCode) => apartment.apartmentCode)
      .filter((code): code is string => Boolean(code))
  );

  if (!existingCodes.has(baseCode)) {
    return baseCode;
  }

  let suffix = 2;
  while (existingCodes.has(`${baseCode}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseCode}-${suffix}`;
}
