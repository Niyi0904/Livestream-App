import { getParticipantToken } from "@/lib/livekit";
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

  const token = await getParticipantToken(roomName, viewerId, false);

  const serverUrl = process.env.LIVEKIT_URL!;

  return <WatchPageImpl roomName={roomName} roomToken={token} serverUrl={serverUrl} />;
}
