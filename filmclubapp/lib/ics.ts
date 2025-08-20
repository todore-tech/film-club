type IcsArgs = { title: string; description?: string; startsAt: string; durationMinutes?: number; location?: string; url?: string; };

export function buildMeetingICS({ title, description, startsAt, durationMinutes = 60, location = "Zoom", url }: IcsArgs) {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid =
    `${(globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}@filmclub`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FilmClub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    description ? `DESCRIPTION:${icsEscape(description)}` : "",
    location ? `LOCATION:${icsEscape(location)}` : "",
    url ? `URL:${url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function createICSEvent(args: IcsArgs) {
  return buildMeetingICS(args);
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export type { IcsArgs };
