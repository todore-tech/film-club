import VoteClient from '@/components/VoteClient';

/**
 * Page for participating in the current poll. Accepts an optional club_id
 * query parameter to scope the poll to a specific age group. Fetches the
 * poll via the API and displays a voting component. If no poll is active
 * a message is shown.
 */
export default async function VotePage({ searchParams }: { searchParams?: { club_id?: string } }) {
  const clubId = searchParams?.club_id;
  const params = new URLSearchParams();
  if (clubId) params.set('club_id', clubId);
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/polls/list${params.toString() ? '?' + params.toString() : ''}`, { cache: 'no-store' });
  const { id, question, options, poll } = await res.json().catch(() => ({}));
  const pollData = poll || (id ? { id, question, options } : null);
  if (!pollData) {
    return <p>אין כרגע סקר פעיל.</p>;
  }
  return (
    <div className="flex flex-col gap-4 max-w-md">
      {pollData.question && <h2 className="text-xl font-bold">{pollData.question}</h2>}
      <VoteClient poll={{ id: pollData.id, question: pollData.question, options: pollData.options }} />
    </div>
  );
}