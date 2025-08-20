
type IcsArgs = {
  title: string;
  description?: string;
  startsAt: string;           // ISO string, e.g. "2025-09-01T17:00:00Z"
  durationMinutes?: number;   // default 60
  location?: string;          // e.g. "Zoom"
  url?: string;               // meeting page
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

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const uid = `${crypto.randomUUID()}@filmclub`;

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

  // ICS requires CRLF line endings
  return lines.join("\r\n");
}

function icsEscape(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
