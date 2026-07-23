"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// This page shows details for one NFL player.
export default function PlayerDetailPage() {
  const params = useParams();
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    async function loadPlayer() {
      const res = await fetch(`/api/players/${params.id}`);
      const data = await res.json();
      setPlayer(data);
    }

    loadPlayer();
  }, [params.id]);

  if (!player) return <div className="p-8 text-white">Loading player...</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">{player.fullName}</h1>
        <p className="mt-2 text-slate-400">Position: {player.position}</p>
        <p className="mt-2 text-slate-400">Team: {player.team}</p>
        <p className="mt-2 text-slate-400">Projected Value: {player.projectedValue}</p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-800 p-5">
          <h2 className="font-semibold">Stats</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Touchdowns: {player.stats?.touchdowns}</li>
            <li>Rushing Yards: {player.stats?.rushingYards}</li>
            <li>Receptions: {player.stats?.receptions}</li>
            <li>Passing Yards: {player.stats?.passingYards}</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
