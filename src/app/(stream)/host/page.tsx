import { getParticipantToken } from "@/lib/livekit";
import { redirect } from "next/navigation";
import HostPageImpl from "./page.client";

interface PageProps {
  searchParams: Promise<{
    at: string | undefined;
    roomName: string | undefined;
  }>;
}

export default async function HostPage({ searchParams }: PageProps) {
  const { at, roomName } = await searchParams;

  // If no room name or auth token, go back
  if (!at || !roomName) {
    redirect("/");
  }
  const token = await getParticipantToken(roomName, "host-user", true);
  const serverUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!serverUrl) {
    console.error('LIVEKIT_URL is not set');
    throw new Error('LIVEKIT_URL is not set');
  }

  // 3. Pass the generated token to the client
  return <HostPageImpl authToken={at} roomToken={token} serverUrl={serverUrl} roomName={roomName} />;
}
