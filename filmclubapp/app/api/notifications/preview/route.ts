import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';
import { createICSEvent } from '@/lib/ics';
import { renderAnnounceEmail, renderReminderEmail, renderFollowupEmail } from '@/lib/emailTemplates';

/**
 * Allows previewing of notification emails by sending them to a given
 * address. This endpoint is intended for development and testing only. A
 * JSON body with `to`, `type` and optional `meeting` should be provided.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { to, type, meeting } = body;
  if (!to || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  let subject = '';
  let html = '';
  let ics: string | undefined;
  if (type === 'announce') {
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting details required for announce' }, { status: 400 });
    }
    const { film_title, start, end, url } = meeting;
    const localStart = new Date(start);
    const dateLocal = localStart.toLocaleDateString('he-IL', { dateStyle: 'medium' });
    const timeLocal = localStart.toLocaleTimeString('he-IL', { timeStyle: 'short' });
    html = renderAnnounceEmail({ filmTitle: film_title, dateLocal, timeLocal, meetingUrl: url });
    subject = `📣 הסרט הבא: ${film_title}`;
    ics = createICSEvent({ start, end, summary: film_title, description: '', url });
  } else if (type.startsWith('reminder')) {
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting details required for reminder' }, { status: 400 });
    }
    const { film_title, start, end, url } = meeting;
    const localStart = new Date(start);
    const dateLocal = localStart.toLocaleDateString('he-IL', { dateStyle: 'medium' });
    const timeLocal = localStart.toLocaleTimeString('he-IL', { timeStyle: 'short' });
    html = renderReminderEmail({ filmTitle: film_title, dateLocal, timeLocal, meetingUrl: url });
    subject = `⏰ תזכורת למפגש: ${film_title}`;
    ics = createICSEvent({ start, end, summary: film_title, description: '', url });
  } else if (type === 'followup') {
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting details required for followup' }, { status: 400 });
    }
    const { film_title, url } = meeting;
    html = renderFollowupEmail({ filmTitle: film_title, meetingUrl: url });
    subject = `🙏 תודה על ההשתתפות – ${film_title}`;
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  try {
    await sendEmail({ to, subject, html, ics });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}