/*
 * Functions to generate HTML email bodies for announcements, reminders and follow‑ups.
 * These return simple RTL templates with placeholders filled in. If you need
 * fancier emails feel free to update these functions, or load the HTML from
 * files under the `emails/` directory.
 */

interface AnnounceArgs {
  filmTitle: string;
  dateLocal: string;
  timeLocal: string;
  meetingUrl: string;
}

export function renderAnnounceEmail(args: AnnounceArgs): string {
  const { filmTitle, dateLocal, timeLocal, meetingUrl } = args;
  return `<!doctype html><html lang="he" dir="rtl"><body style="font-family:Arial,sans-serif;">
    <h2>🎬 נקבע הסרט למפגש הבא!</h2>
    <p>הסרט: ${filmTitle} — יום ${dateLocal} בשעה ${timeLocal} (שעון ישראל)</p>
    <p><a href="${meetingUrl}" style="background:#000;color:#fff;padding:10px 14px;border-radius:12px;text-decoration:none;">לפרטי המפגש ו־RSVP</a></p>
    <p>לשאלות נוספות ניתן להשיב למייל זה.</p>
  </body></html>`;
}

interface ReminderArgs {
  filmTitle: string;
  dateLocal: string;
  timeLocal: string;
  meetingUrl: string;
}

export function renderReminderEmail(args: ReminderArgs): string {
  const { filmTitle, dateLocal, timeLocal, meetingUrl } = args;
  return `<!doctype html><html lang="he" dir="rtl"><body style="font-family:Arial,sans-serif;">
    <h2>📅 תזכורת למפגש הקרוב</h2>
    <p>זכרו לצפות ב־${filmTitle}! נפגש בזום ביום ${dateLocal} בשעה ${timeLocal} (שעון ישראל).</p>
    <p><a href="${meetingUrl}" style="background:#000;color:#fff;padding:10px 14px;border-radius:12px;text-decoration:none;">כניסה לדף המפגש</a></p>
    <p>נשמח לראותכם,</p>
    <p>צוות מועדון הסרטים</p>
  </body></html>`;
}

interface FollowUpArgs {
  filmTitle: string;
  meetingUrl: string;
}

export function renderFollowupEmail(args: FollowUpArgs): string {
  const { filmTitle, meetingUrl } = args;
  return `<!doctype html><html lang="he" dir="rtl"><body style="font-family:Arial,sans-serif;">
    <h2>🙏 תודה שהשתתפתם במפגש!</h2>
    <p>מקווים שנהניתם לדבר על ${filmTitle}. נשמח לשמוע משוב קצר ולדעת איזה סרט תרצו בפעם הבאה.</p>
    <p><a href="${meetingUrl}" style="background:#000;color:#fff;padding:10px 14px;border-radius:12px;text-decoration:none;">לסקר הבא</a></p>
    <p>ניפגש במפגש הבא 🎬</p>
  </body></html>`;
}