"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// This page shows the final team summary after a draft.
export default function ResultsPage() {
  const params = useParams();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadResult() {
      const res = await fetch('/api/ai/grade-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rosterLength: 7 }),
      });
      const data = await res.json();
      setResult(data);
    }

    loadResult();
  }, [params.id]);

  if (!result) return <div className="p-8 text-white">Loading results...</div>;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">Draft Results</h1>
        <p className="mt-2 text-slate-400">AI review of the team roster.</p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-800 p-5">
          <p className="text-lg font-semibold">Score: {result.score}</p>
          <p className="mt-2 text-sm text-slate-400">Grade: {result.grade}</p>
          <p className="mt-4 text-sm text-slate-300">{result.summary}</p>
        </div>
      </div>
    </main>
  );
}
