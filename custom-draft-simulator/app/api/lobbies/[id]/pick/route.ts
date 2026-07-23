import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lobby from '@/models/Lobby';
import DraftEvent from '@/models/DraftEvent';

// This API route records a draft pick or bid.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await request.json();

  const lobby = await Lobby.findById(params.id);
  if (!lobby) {
    return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
  }

  const event = await DraftEvent.create({
    lobbyId: params.id,
    userId: body.userId || 'guest',
    type: body.type || 'pick',
    playerId: body.playerId || '',
    amount: body.amount || 0,
    message: body.message || 'Pick recorded',
  });

  return NextResponse.json({ event, lobby });
}
