"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// This page shows details for one draft lobby.
export default function LobbyDetailPage() {
  const params = useParams();
  const [lobby, setLobby] = useState<any>(null);

  useEffect(() => {
    async function loadLobby() {
      const res = await fetch(`/api/lobbies/${params.id}`);
      const data = await res.json();
      setLobby(data);
    }

    loadLobby();
  }, [params.id]);

  if (!lobby) return <div className="p-8 text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">{lobby.name}</h1>
        <p className="mt-2 text-slate-400">Invite code: {lobby.inviteCode}</p>
        <p className="mt-2 text-slate-400">Status: {lobby.status}</p>
        <p className="mt-2 text-slate-400">Format: {lobby.settings?.format}</p>
        <p className="mt-2 text-slate-400">Practice Mode: {lobby.settings?.practiceMode ? 'Yes' : 'No'}</p>
        <p className="mt-2 text-slate-400">Bot Opponents: {lobby.settings?.botOpponents}</p>

        <div className="mt-8 flex gap-4">
          <Link href={`/lobbies/${lobby._id}/draft`} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold">Enter Draft</Link>
          <Link href="/lobbies" className="rounded-lg border border-slate-700 px-5 py-3">Back to Lobbies</Link>
        </div>
      </div>
    </main>
  );
}
