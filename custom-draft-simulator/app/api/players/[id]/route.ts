import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';

// This API route gets one player by ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const player = await Player.findById(params.id);

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  return NextResponse.json(player);
}
