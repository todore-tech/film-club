import ClubCard from '../../components/ClubCard';
import Link from 'next/link';

/**
 * English landing page for the film club.
 * Presents the three age groups in English and invites the user to join.
 */
export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold">Film Club — Vote, Watch, Discuss</h1>
      <p className="opacity-80">
        Choose your age group, sign up, and receive reminders for the upcoming Zoom meeting. We choose the
        film together, watch at home, and meet for an educational and enjoyable discussion.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <ClubCard
          title="Youth 15–17"
          description="Joint voting, adult moderator, parental consent"
          age="15-17"
        />
        <ClubCard
          title="20–40"
          description="Pleasant meeting after work, 60–75 minutes"
          age="20-40"
        />
        <ClubCard
          title="55+"
          description="Classics and current affairs, brief technical assistance"
          age="55+"
        />
      </div>
      <Link href="/dashboard" className="underline text-sm">
        Already registered? Go to dashboard »
      </Link>
    </div>
  );
}