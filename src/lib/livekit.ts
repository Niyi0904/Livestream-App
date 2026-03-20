import { AccessToken } from 'livekit-server-sdk';

/**
 * Generates a LiveKit Access Token for a participant to join a room.
 * This can be called from both API routes and Server Components.
 */
export async function getParticipantToken(
  room: string,
  username: string,
  isHost: boolean = false
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY or LIVEKIT_API_SECRET is not set');
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
  });

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: isHost,
    canSubscribe: true,
    canPublishData: isHost,
  });

  return await at.toJwt();
}
