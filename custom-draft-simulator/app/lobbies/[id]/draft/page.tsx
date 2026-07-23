"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// This page is the main live draft board.
export default function DraftPage() {
  const params = useParams();
  const [lobby, setLobby] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [budget, setBudget] = useState(100);
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const lobbyRes = await fetch(`/api/lobbies/${params.id}`);
      const lobbyData = await lobbyRes.json();
      setLobby(lobbyData);

      const playersRes = await fetch('/api/players');
      const playersData = await playersRes.json();
      setPlayers(playersData);
    }

    loadData();
  }, [params.id]);

  async function handlePick() {
    await fetch(`/api/lobbies/${params.id}/pick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'student-user',
        playerId: selectedPlayer,
        type: 'pick',
        message: 'Player selected',
      }),
    });

    setBudget((prev) => prev - 10);
  }

  async function getRecommendation() {
    const res = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, position: 'WR' }),
    });

    const data = await res.json();
    setRecommendation(data);
  }

  if (!lobby) return <div className="p-8 text-white">Loading draft room...</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">{lobby.name}</h1>
        <p className="mt-2 text-slate-400">Live draft board</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            <h2 className="font-semibold">Draft Controls</h2>
            <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 p-3">
              <option value="">Choose a player</option>
              {players.map((player: any) => (
                <option key={player._id} value={player._id}>{player.fullName}</option>
              ))}
            </select>

            <button onClick={handlePick} className="mt-4 rounded-lg bg-green-600 px-5 py-3 font-semibold">
              Make Pick
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-800 p-5">
            <h2 className="font-semibold">Budget</h2>
            <p className="mt-2 text-2xl font-bold">${budget}</p>
            <button onClick={getRecommendation} className="mt-4 rounded-lg bg-purple-600 px-5 py-3 font-semibold">
              Ask AI for Suggestion
            </button>
            {recommendation && (
              <div className="mt-4 rounded-lg border border-purple-700 bg-slate-900 p-4">
                <p className="font-semibold">{recommendation.recommendedPlayer}</p>
                <p className="text-sm text-slate-400">Suggested max bid: ${recommendation.suggestedMaxBid}</p>
                <p className="text-sm text-slate-400">{recommendation.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
