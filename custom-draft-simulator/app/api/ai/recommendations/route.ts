import { NextResponse } from 'next/server';

// This API route returns a simple AI recommendation based on budget and position.
export async function POST(request: Request) {
  const body = await request.json();

  const budget = Number(body.budget || 0);
  const position = body.position || 'WR';

  const suggestedPlayer = position === 'QB'
    ? 'Josh Allen'
    : position === 'RB'
      ? 'Christian McCaffrey'
      : 'Tyreek Hill';

  const suggestedMaxBid = Math.max(10, Math.min(budget, 90));

  return NextResponse.json({
    recommendedPlayer: suggestedPlayer,
    suggestedMaxBid,
    reason: `Best fit for ${position} with a budget of ${budget}.`,
  });
}
