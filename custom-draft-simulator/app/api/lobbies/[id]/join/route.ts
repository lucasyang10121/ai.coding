import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lobby from '@/models/Lobby';

// This API route lets a user join a lobby.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await request.json();

  const lobby = await Lobby.findById(params.id);
  if (!lobby) {
    return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
  }

  const userId = body.userId || 'guest-user';
  if (!lobby.participants.includes(userId)) {
    lobby.participants.push(userId);
    lobby.draftOrder.push(userId);
    await lobby.save();
  }

  return NextResponse.json(lobby);
}
