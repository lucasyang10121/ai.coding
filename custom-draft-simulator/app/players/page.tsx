import Link from 'next/link';

export const dynamic = 'force-dynamic';

// This page shows all players in the database.
async function getPlayers() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/players`, { cache: 'no-store' });
  return res.json();
}

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">NFL Players</h1>
        <p className="mt-2 text-slate-400">Browse players and compare their projected value.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {players.map((player: any) => (
            <div key={player._id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">{player.fullName}</h2>
              <p className="mt-2 text-sm text-slate-400">Position: {player.position}</p>
              <p className="mt-2 text-sm text-slate-400">Team: {player.team}</p>
              <p className="mt-2 text-sm text-slate-400">Projected Value: {player.projectedValue}</p>
              <Link href={`/players/${player._id}`} className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
