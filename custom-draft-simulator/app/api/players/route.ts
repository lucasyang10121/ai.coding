import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';

// This API route lists players or searches by name.
export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const players = await Player.find({
    fullName: { $regex: query, $options: 'i' },
  }).limit(20);

  return NextResponse.json(players);
}

export async function POST() {
  await dbConnect();

  const samplePlayers = [
    {
      fullName: 'Josh Allen',
      position: 'QB',
      team: 'Bills',
      projectedValue: 95,
      stats: { touchdowns: 35, rushingYards: 400, receptions: 0, passingYards: 4200 },
      isAvailable: true,
    },
    {
      fullName: 'Christian McCaffrey',
      position: 'RB',
      team: '49ers',
      projectedValue: 92,
      stats: { touchdowns: 20, rushingYards: 1200, receptions: 85, passingYards: 0 },
      isAvailable: true,
    },
    {
      fullName: 'Tyreek Hill',
      position: 'WR',
      team: 'Dolphins',
      projectedValue: 90,
      stats: { touchdowns: 12, rushingYards: 0, receptions: 120, passingYards: 0 },
      isAvailable: true,
    },
  ];

  await Player.deleteMany({});
  await Player.insertMany(samplePlayers);

  return NextResponse.json({ message: 'Sample players created' }, { status: 201 });
}
