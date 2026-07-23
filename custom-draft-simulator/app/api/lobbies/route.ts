import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lobby from '@/models/Lobby';

// This API route creates a new draft lobby.
export async function GET() {
  await dbConnect();
  const lobbies = await Lobby.find({}).sort({ createdAt: -1 });
  return NextResponse.json(lobbies);
}

export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();

  const lobby = await Lobby.create({
    name: body.name || 'New Draft Lobby',
    hostId: body.hostId || 'guest',
    inviteCode,
    settings: {
      format: body.format || 'salary-cap',
      practiceMode: Boolean(body.practiceMode),
      botOpponents: body.botOpponents || 0,
      capAmount: body.capAmount || 100,
    },
    participants: [body.hostId || 'guest'],
    draftOrder: [body.hostId || 'guest'],
  });

  return NextResponse.json(lobby, { status: 201 });
}
