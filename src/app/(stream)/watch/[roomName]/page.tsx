import { redirect } from "next/navigation";
import WatchPageImpl from "./page.client";

interface PageProps {
  params: Promise<{
    roomName: string;
  }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { roomName } = await params;

  if (!roomName) {
    redirect("/");
  }

  const viewerId = `viewer-${Math.floor(Math.random() * 10000)}`;


  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = process.env.VERCEL_URL || 'localhost:3000';

  const resp = await fetch(`${protocol}://${host}/api/get-participant-token?room=${roomName}&username=${viewerId}&isHost=false`);

  const { token } = await resp.json();

  const serverUrl = process.env.LIVEKIT_URL!;

  return <WatchPageImpl roomName={roomName} roomToken={token} serverUrl={serverUrl} />;
}
