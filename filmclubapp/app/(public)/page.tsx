import ClubCard from '@/components/ClubCard';
import Link from 'next/link';

/**
 * Landing page. Presents the three age groups and a brief description of how
 * the club works. Users can select their age group to proceed to the
 * dashboard, or go directly to the dashboard if already registered.
 */
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold">מועדון סרטים — מצביעים, צופים, מדברים</h1>
      <p className="opacity-80">
        בחרו את קבוצת הגיל המתאימה לכם, הירשמו וקבלו תזכורות למפגש הקרוב בזום. אנחנו בוחרים את
        הסרט יחד, צופים בבית ונפגשים לשיחה מלמדת ומהנה.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <ClubCard title="נוער 15–17" description="הצבעה משותפת, מנחה בוגר/ת, אישור הורה" age="15-17" />
        <ClubCard title="20–40" description="מפגש נעים אחרי העבודה, 60–75 דק׳" age="20-40" />
        <ClubCard title="55+" description="קלאסיקות ואקטואליה, סיוע טכני קצר" age="55+" />
      </div>
      <Link href="/dashboard" className="underline text-sm">
        כבר נרשמתם? לדשבורד »
      </Link>
    </div>
  );
}