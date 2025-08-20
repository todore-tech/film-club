import { Resend } from 'resend';

/*
 * Simple wrapper around the Resend client. Use this function on the server to
 * send transactional emails. It accepts an optional iCalendar string which
 * will be attached to the message as a `.ics` file.
 */

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  ics?: string;
}

export async function sendEmail({ to, subject, html, ics }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  const resend = new Resend(apiKey);
  const attachments = [] as any[];
  if (ics) {
    const buffer = Buffer.from(ics, 'utf8');
    attachments.push({
      filename: 'invite.ics',
      content: buffer.toString('base64'),
      type: 'text/calendar; charset=utf-8; method=REQUEST',
      disposition: 'attachment',
    });
  }
  return resend.emails.send({
    from: `Film Club <noreply@${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'localhost').hostname}>`,
    to: [to],
    subject,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}