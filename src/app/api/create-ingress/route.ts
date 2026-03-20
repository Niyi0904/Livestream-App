import { IngressClient, IngressInput, IngressVideoEncodingPreset } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiHost = process.env.LIVEKIT_URL!.replace("wss://", "https://");
  const ingressClient = new IngressClient(apiHost, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
