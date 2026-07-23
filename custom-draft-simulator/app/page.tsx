import Link from 'next/link';

// This is the home page for the app.
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <h1 className="text-4xl font-bold">Custom Draft Simulator</h1>
        <p className="mt-4 text-lg text-slate-300">
          Build fantasy draft rooms, manage budgets, and try AI-powered features.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/lobbies/create" className="rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">
            Create Lobby
          </Link>
          <Link href="/lobbies" className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800">
            Browse Lobbies
          </Link>
          <Link href="/players" className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800">
            Browse Players
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            <h2 className="font-semibold">Private Drafts</h2>
            <p className="mt-2 text-sm text-slate-400">Create rooms with custom rules and invite friends.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            <h2 className="font-semibold">Real NFL Players</h2>
            <p className="mt-2 text-sm text-slate-400">Draft from a real player database with stats and values.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            <h2 className="font-semibold">AI Helpers</h2>
            <p className="mt-2 text-sm text-slate-400">Get recommendations and roster grading with AI.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
