type IcsArgs = {
  title: string;
  description?: string;
  startsAt: string;           // ISO
  durationMinutes?: number;   // default 60
  location?: string;
  url?: string;
};

export function buildMeetingICS({
  title,
  description,
  startsAt,
  durationMinutes = 60,
  location = "Zoom",
  url,
}: IcsArgs) {
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

// Backward-compatible wrapper: accepts either {start,end,summary,...} or new {startsAt,...}
export function createICSEvent(input: any) {
  const a = normalizeArgs(input);
  return buildMeetingICS(a);
}

function normalizeArgs(input: any): IcsArgs {
  // New shape
  if (input && "startsAt" in input) {
    const start = new Date(input.startsAt);
    const end = input.end ? new Date(input.end) : null;
    const duration =
      input.durationMinutes ??
      (end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)) : 60);

    return {
      title: input.title ?? input.summary ?? "Meeting",
      description: input.description,
      startsAt: start.toISOString(),
      durationMinutes: duration,
      location: input.location ?? "Zoom",
      url: input.url,
    };
  }

  // Old shape
  if (input && "start" in input) {
    const start = new Date(input.start);
    const end = input.end ? new Date(input.end) : new Date(start.getTime() + 60 * 60000);
    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));

    return {
      title: input.summary ?? input.title ?? "Meeting",
      description: input.description,
      startsAt: start.toISOString(),
      durationMinutes: duration,
      location: input.location ?? "Zoom",
      url: input.url,
    };
  }

  throw new Error("Invalid ICS args");
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export type { IcsArgs };
