import { IngressClient, IngressInput, IngressVideoEncodingPreset } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    console.error("Missing LiveKit environment variables", { url: !!url, apiKey: !!apiKey, apiSecret: !!apiSecret });
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const apiHost = url.replace("wss://", "https://").replace("ws://", "http://");
  const ingressClient = new IngressClient(apiHost, apiKey, apiSecret);

  try {
    const body = await req.json();

    const ingress = await ingressClient.createIngress(IngressInput.RTMP_INPUT, {
      name: "OBS Stream",
      roomName: body.roomName,
      participantIdentity: "obs-streamer",
      participantName: "OBS Broadcaster",
      video: {
        preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
      },
    });

    return NextResponse.json({ url: ingress.url, streamKey: ingress.streamKey });
  } catch (e: any) {
    console.error("Failed to create ingress:", e);
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
  }
}
