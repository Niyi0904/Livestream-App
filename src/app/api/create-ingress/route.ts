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
    const roomName = body.roomName;

    // 1. Check for existing ingress specifically for this room
    const existingForRoom = await ingressClient.listIngress({ roomName });
    if (existingForRoom.length > 0) {
      const ingress = existingForRoom[0];
      return NextResponse.json({ url: ingress.url, streamKey: ingress.streamKey });
    }

    // 2. If at limit, or to stay efficient, reuse any UNASSIGNED ingress
    const allIngresses = await ingressClient.listIngress({});
    const unassigned = allIngresses.find((i) => !i.roomName || i.roomName === "");

    if (unassigned) {
      // NOTE: We could update it here if needed, but return its existing info is safer/faster
      return NextResponse.json({ url: unassigned.url, streamKey: unassigned.streamKey });
    }

    // 3. Last resort: create a new one
    const ingress = await ingressClient.createIngress(IngressInput.RTMP_INPUT, {
      name: "OBS Stream",
      roomName: roomName,
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
