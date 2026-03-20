import { EgressClient, StreamProtocol } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { roomName, youtubeKey, tiktokKey } = await req.json();

  if (!roomName) {
    return NextResponse.json({ error: 'Missing roomName' }, { status: 400 });
  }

  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    console.error("Missing LiveKit environment variables", { url: !!url, apiKey: !!apiKey, apiSecret: !!apiSecret });
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const apiHost = url.replace("wss://", "https://").replace("ws://", "http://");
  const egressClient = new EgressClient(apiHost, apiKey, apiSecret);

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
    console.error("Failed to start restream:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
