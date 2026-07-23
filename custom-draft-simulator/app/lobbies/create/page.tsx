"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

// This page allows a user to create a new draft lobby.
export default function CreateLobbyPage() {
  const [name, setName] = useState('');
  const [format, setFormat] = useState('salary-cap');
  const [practiceMode, setPracticeMode] = useState(false);
  const [botOpponents, setBotOpponents] = useState(0);
  const router = useRouter();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const response = await fetch('/api/lobbies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        format,
        practiceMode,
        botOpponents,
        capAmount: 100,
      }),
    });

    const data = await response.json();
    router.push(`/lobbies/${data._id}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">Create Draft Lobby</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm">Lobby Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3" />
          </div>

          <div>
            <label className="mb-2 block text-sm">Draft Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3">
              <option value="salary-cap">Salary Cap</option>
              <option value="no-cap">No Cap</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={practiceMode} onChange={() => setPracticeMode(!practiceMode)} />
            Practice Draft Mode
          </label>

          <div>
            <label className="mb-2 block text-sm">Bot Opponents</label>
            <input type="number" min="0" max="5" value={botOpponents} onChange={(e) => setBotOpponents(Number(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3" />
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold">Create Lobby</button>
        </form>
      </div>
    </main>
  );
}
