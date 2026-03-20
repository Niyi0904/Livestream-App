import { EgressClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { egressId } = await req.json();

  if (!egressId) {
    return NextResponse.json({ error: 'Missing egressId' }, { status: 400 });
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

  try {
    await egressClient.stopEgress(egressId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to stop restream:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
