import Link from 'next/link';

export const dynamic = 'force-dynamic';

// This page lists draft lobbies.
async function getLobbies() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/lobbies`, { cache: 'no-store' });
  return res.json();
}

export default async function LobbiesPage() {
  const lobbies = await getLobbies();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Draft Lobbies</h1>
        <p className="mt-2 text-slate-400">Join an existing room or create a new one.</p>

        <div className="mt-8 flex gap-4">
          <Link href="/lobbies/create" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold">Create Lobby</Link>
          <Link href="/" className="rounded-lg border border-slate-700 px-5 py-3">Back Home</Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {lobbies.map((lobby: any) => (
            <div key={lobby._id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-semibold">{lobby.name}</h2>
              <p className="mt-2 text-sm text-slate-400">Invite code: {lobby.inviteCode}</p>
              <p className="mt-2 text-sm text-slate-400">Status: {lobby.status}</p>
              <p className="mt-2 text-sm text-slate-400">Format: {lobby.settings?.format}</p>
              <Link href={`/lobbies/${lobby._id}`} className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold">
                View Lobby
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
