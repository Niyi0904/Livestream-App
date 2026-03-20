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

  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = process.env.VERCEL_URL || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const resp = await fetch(
    `${baseUrl}/api/get-participant-token?room=${roomName}&username=host-user&isHost=true`,
    { cache: 'no-store' }
  );

  const { token } = await resp.json();

  const serverUrl = process.env.LIVEKIT_URL!;

  // 3. Pass the generated token to the client
  return <HostPageImpl authToken={at} roomToken={token} serverUrl={serverUrl} roomName={roomName} />;
}
