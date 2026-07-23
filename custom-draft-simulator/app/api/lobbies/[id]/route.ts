import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lobby from '@/models/Lobby';

// This API route gets one lobby by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const lobby = await Lobby.findById(params.id);

  if (!lobby) {
    return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
  }

  return NextResponse.json(lobby);
}

// This API route updates lobby settings.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await request.json();

  const lobby = await Lobby.findByIdAndUpdate(
    params.id,
    {
      settings: body.settings,
      status: body.status || 'waiting',
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!lobby) {
    return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
  }

  return NextResponse.json(lobby);
}
