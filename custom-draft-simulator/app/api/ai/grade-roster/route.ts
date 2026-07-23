import { NextResponse } from 'next/server';

// This API route gives a simple AI grade for a team roster.
export async function POST(request: Request) {
  const body = await request.json();
  const rosterLength = Number(body.rosterLength || 0);

  let grade = 'Average';
  if (rosterLength >= 6) grade = 'Strong';
  if (rosterLength >= 8) grade = 'Excellent';

  return NextResponse.json({
    score: Math.min(100, 60 + rosterLength * 5),
    grade,
    summary: 'The roster has a balanced mix of strong talent and good depth.',
  });
}
