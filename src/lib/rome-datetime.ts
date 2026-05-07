const ROME_TIME_ZONE = "Europe/Rome";

type RomeDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getRomeDateParts(dateInput: Date | string): RomeDateParts | null {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ROME_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  const second = parts.find((part) => part.type === "second")?.value;

  if (!year || !month || !day || !hour || !minute || !second) return null;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
    millisecond: 0,
  };
}

function toUtcMillis(parts: RomeDateParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );
}

export function formatRomeDateInputValue(dateInput: Date | string) {
  const parts = getRomeDateParts(dateInput);
  if (!parts) return "";
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function formatRomeTimeInputValue(dateInput: Date | string) {
  const parts = getRomeDateParts(dateInput);
  if (!parts) return "";
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatRomeDateTimeDisplay(dateInput: Date | string) {
  const parts = getRomeDateParts(dateInput);
  if (!parts) return "";
  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year} alle ${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatRomeDateDisplay(dateInput: Date | string) {
  const parts = getRomeDateParts(dateInput);
  if (!parts) return "";
  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
}

export function parseRomeDateTime(dateStr: string, timeStr: string) {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const [hourStr, minuteStr] = timeStr.split(":");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return new Date(NaN);
  }

  const desiredUtcMillis = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let candidate = desiredUtcMillis;

  for (let i = 0; i < 3; i += 1) {
    const parts = getRomeDateParts(new Date(candidate));
    if (!parts) break;

    const formattedUtcMillis = toUtcMillis(parts);
    const diff = desiredUtcMillis - formattedUtcMillis;
    if (diff === 0) break;
    candidate += diff;
  }

  return new Date(candidate);
}

export function setRomeTimeOnDate(date: Date | string, timeStr: string) {
  const parts = getRomeDateParts(date);
  if (!parts) return new Date(NaN);
  const dateStr = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  return parseRomeDateTime(dateStr, timeStr);
}

export function preserveRomeTimeOnDate(targetDate: Date | string, sourceDate: Date | string) {
  const targetParts = getRomeDateParts(targetDate);
  const sourceParts = getRomeDateParts(sourceDate);
  if (!targetParts || !sourceParts) return new Date(NaN);

  const dateStr = `${targetParts.year}-${pad(targetParts.month)}-${pad(targetParts.day)}`;
  const timeStr = `${pad(sourceParts.hour)}:${pad(sourceParts.minute)}`;
  return parseRomeDateTime(dateStr, timeStr);
}
