import { v4 as uuidv4 } from 'uuid';

/*
 * Create a simple iCalendar event for a meeting. The returned string can be
 * attached to an email as a `.ics` file. Start and end should be ISO dates in
 * UTC (e.g. `2025-09-01T17:00:00Z`).
 */
interface EventArgs {
  start: string;
  end: string;
  summary: string;
  description?: string;
  url?: string;
}

export function createICSEvent(args: EventArgs): string {
  const { start, end, summary, description = '', url = '' } = args;
  const uid = uuidv4();
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dtstart = new Date(start).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dtend = new Date(end).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//filmclub//EN',
    'BEGIN:VEVENT',
    `UID:${uid}@filmclub`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}