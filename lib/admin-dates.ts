const ADMIN_TIME_ZONE = "America/New_York";

function zonedParts(instant: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function zonedTimeAsUtc(instant: Date) {
  const parts = zonedParts(instant);
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

/** Midnight at the start of a YYYY-MM-DD calendar day in Eastern time. */
export function startOfAdminDay(date: string) {
  const guess = new Date(`${date}T00:00:00.000Z`);
  const offset = zonedTimeAsUtc(guess) - guess.getTime();
  const corrected = zonedTimeAsUtc(new Date(guess.getTime() - offset)) - (guess.getTime() - offset);
  return new Date(guess.getTime() - corrected).toISOString();
}

/** Last millisecond of a YYYY-MM-DD calendar day in Eastern time. */
export function endOfAdminDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return new Date(new Date(startOfAdminDay(nextDate)).getTime() - 1).toISOString();
}

export function startOfAdminMonth() {
  const parts = zonedParts(new Date());
  const month = String(parts.month).padStart(2, "0");
  return startOfAdminDay(`${parts.year}-${month}-01`);
}
