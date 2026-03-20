import { EgressClient, StreamProtocol } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomName, youtubeKey, tiktokKey } = await req.json();

  if (!roomName) {
    return NextResponse.json({ error: 'Missing roomName' }, { status: 400 });
  }

  const apiHost = process.env.LIVEKIT_URL!.replace('wss://', 'https://');
  const egressClient = new EgressClient(apiHost, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

  // Build the list of RTMP destination URLs
  const streamUrls: string[] = [];
  if (youtubeKey) streamUrls.push(`rtmp://a.rtmp.youtube.com/live2/${youtubeKey}`);
  if (tiktokKey) streamUrls.push(`rtmps://publish.tiktok.com/live/${tiktokKey}`);

  if (streamUrls.length === 0) {
    return NextResponse.json({ error: 'Provide at least one stream key' }, { status: 400 });
  }

  try {
    const info = await egressClient.startRoomCompositeEgress(
      roomName,
      {
        stream: {
          protocol: StreamProtocol.RTMP,
          urls: streamUrls,
        },
      },
      { layout: 'speaker' }
    );

    return NextResponse.json({ egressId: info.egressId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
