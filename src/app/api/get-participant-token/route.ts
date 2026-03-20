import { getParticipantToken } from '@/lib/livekit';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const room = searchParams.get('room');
  const username = searchParams.get('username');
  const isHost = searchParams.get('isHost') === 'true';

  if (!room || !username) {
    return NextResponse.json({ error: 'Missing room or username' }, { status: 400 });
  }

  try {
    const token = await getParticipantToken(room, username, isHost);
    return NextResponse.json({ token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
