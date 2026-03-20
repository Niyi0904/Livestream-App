import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const room = searchParams.get('room');
  const username = searchParams.get('username');
  const isHost = searchParams.get('isHost');

  if (!room || !username) {
    return NextResponse.json({ error: 'Missing room or username' }, { status: 400 });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: username,
    },
  );

  const isActuallyHost = isHost === 'true';

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: isActuallyHost,
    canSubscribe: true,
    canPublishData: isActuallyHost,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token });
}
