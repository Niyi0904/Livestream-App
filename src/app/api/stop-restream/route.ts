import { EgressClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { egressId } = await req.json();

  if (!egressId) {
    return NextResponse.json({ error: 'Missing egressId' }, { status: 400 });
  }

  const apiHost = process.env.LIVEKIT_URL!.replace('wss://', 'https://');
  const egressClient = new EgressClient(apiHost, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

  try {
    await egressClient.stopEgress(egressId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
