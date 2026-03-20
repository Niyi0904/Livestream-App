import { useCopyToClipboard } from "@/lib/clipboard";
import { ParticipantMetadata, RoomMetadata } from "@/lib/controller";
import {
  AudioTrack,
  StartAudio,
  VideoTrack,
  useDataChannel,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { CopyIcon, EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { Avatar, Badge, Box, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import Confetti from "js-confetti";
import {
  ConnectionState,
  LocalVideoTrack,
  Track,
  createLocalTracks,
} from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { MediaDeviceSettings } from "./media-device-settings";
import { PresenceDialog } from "./presence-dialog";
import { useAuthToken } from "./token-context";

function ConfettiCanvas() {
  const [confetti, setConfetti] = useState<Confetti>();
  const [decoder] = useState(() => new TextDecoder());
  const canvasEl = useRef<HTMLCanvasElement>(null);
  useDataChannel("reactions", (data) => {
    const options: { emojis?: string[]; confettiNumber?: number } = {};

    if (decoder.decode(data.payload) !== "🎉") {
      options.emojis = [decoder.decode(data.payload)];
      options.confettiNumber = 12;
    }

    confetti?.addConfetti(options);
  });

  useEffect(() => {
    setConfetti(new Confetti({ canvas: canvasEl?.current ?? undefined }));
  }, []);

  return <canvas ref={canvasEl} className="absolute h-full w-full" />;
}

export function StreamPlayer({
  isHost = false,
  obsMode = false,
  onlyShowIngress = false,
}: {
  isHost: boolean;
  obsMode?: boolean;
  onlyShowIngress?: boolean;
}) {
  const [_, copy] = useCopyToClipboard();

  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack>();
  const [permissionError, setPermissionError] = useState(false);
  const localVideoEl = useRef<HTMLVideoElement>(null);

  const { metadata, name: roomName, state: roomState } = useRoomContext();
  const roomMetadata = (() => {
    try {
      return metadata ? (JSON.parse(metadata) as RoomMetadata) : undefined;
    } catch {
      return undefined;
    }
  })();

  const { localParticipant } = useLocalParticipant();
  const localMetadata = (() => {
    try {
      return localParticipant.metadata
        ? (JSON.parse(localParticipant.metadata) as ParticipantMetadata)
        : undefined;
    } catch {
      return undefined;
    }
  })();
  const canHost =
    isHost || (localMetadata?.invited_to_stage && localMetadata?.hand_raised);
  const participants = useParticipants();
  const showNotification = isHost
    ? participants.some((p) => {
      const metadata = (() => {
        try {
          return p.metadata ? (JSON.parse(p.metadata) as ParticipantMetadata) : undefined;
        } catch {
          return undefined;
        }
      })();
      return metadata?.hand_raised && !metadata?.invited_to_stage;
    })
    : localMetadata?.invited_to_stage && !localMetadata?.hand_raised;

  useEffect(() => {
    if (canHost && !obsMode) {
      const createTracks = async () => {
        try {
          const tracks = await createLocalTracks({ audio: true, video: true });
          const camTrack = tracks.find((t) => t.kind === Track.Kind.Video);
          if (camTrack && localVideoEl?.current) {
            camTrack.attach(localVideoEl.current);
          }
          setLocalVideoTrack(camTrack as LocalVideoTrack);
        } catch (e: any) {
          console.error("Failed to create local tracks (permission denied?)", e);
          if (e instanceof Error && e.name === "NotAllowedError") {
            setPermissionError(true);
          }
        }
      };
      void createTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canHost]); // obsMode is a static prop — safe to omit from deps

  const { activeDeviceId: activeCameraDeviceId } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  useEffect(() => {
    if (localVideoTrack) {
      void localVideoTrack.setDeviceId(activeCameraDeviceId);
    }
  }, [localVideoTrack, activeCameraDeviceId]);

  // Include Track.Source.Unknown for RTMP ingress tracks (OBS streams arrive as Unknown source)
  const allRemoteVideoTracks = useTracks(
    [Track.Source.Camera, Track.Source.Unknown, Track.Source.ScreenShare]
  ).filter((t) => t.participant.identity !== localParticipant?.identity);

  // Ingress/OBS tracks come in as Unknown source or from a participant with 'obs' in identity
  const obsIngressTracks = allRemoteVideoTracks.filter(
    (t) =>
      t.source === Track.Source.Unknown ||
      t.participant.identity.toLowerCase().includes("obs")
  );

  // When OBS is live, only show OBS. When not live, show camera participants.
  const obsIsLive = obsIngressTracks.length > 0;
  const isLive = obsIsLive || allRemoteVideoTracks.length > 0 || (isHost && Boolean(localVideoTrack));

  // Browser-based remote participants (Camera source only)
  const remoteVideoTracks = allRemoteVideoTracks.filter(
    (t) => t.source === Track.Source.Camera
  );

  const remoteAudioTracks = useTracks([Track.Source.Microphone]).filter(
    (t) => t.participant.identity !== localParticipant.identity
  );

  const authToken = useAuthToken();
  const onLeaveStage = async () => {
    if (!localParticipant?.identity) return;
    await fetch("/api/remove_from_stage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({
        identity: localParticipant.identity,
      }),
    });
  };

  return (
    <div className="relative h-full w-full bg-black">
      {/* Status Badges Overlay */}
      <div className="absolute top-6 left-6 md:left-6 right-6 md:right-auto z-20 flex flex-col gap-3 pointer-events-none items-end md:items-start">
        <Flex gap="2">
          {isLive ? (
            <Badge color="red" variant="solid" className="pulse-red uppercase px-3 py-1.5 shadow-lg rounded-full font-black tracking-widest text-[10px] border border-red-500/20">
              ● Live
            </Badge>
          ) : (
            <Badge color="gray" variant="surface" className="uppercase px-3 py-1.5 glass-dark text-white/70 rounded-full font-bold tracking-widest text-[10px]">
              Offline
            </Badge>
          )}
          <div className="glass-dark px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl border border-white/5">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <Text size="1" weight="bold" className="text-white/90 tabular-nums">
              {participants.length} Viewing
            </Text>
          </div>
        </Flex>

        {/* Branding Watermark */}
        <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <div className="w-8 h-px bg-gradient-to-r from-violet-500 to-transparent" />
          <Text size="1" weight="bold" className="uppercase tracking-[0.2em] text-white/50 text-[10px]">
            Restro Studio
          </Text>
        </div>
      </div>

      <Grid className="w-full h-full absolute" gap="2">
        {/* Offline Placeholder */}
        {!isLive && (
          <Flex direction="column" align="center" justify="center" className="absolute inset-0 z-10 p-12 pointer-events-none">
            <Box className="w-24 h-24 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-[32px] flex items-center justify-center mb-6 glow-violet animate-pulse border border-white/5">
              <EyeClosedIcon className="w-10 h-10 text-violet-400 opacity-50" />
            </Box>
            <div className="flex flex-col items-center">
              <Heading size="3" align="center" className="text-white font-black tracking-tighter uppercase italic opacity-20 mb-2">
                RESTRO <span className="text-violet-9">LIVE</span>
              </Heading>
              <Text size="2" color="gray" align="center" className="max-w-[240px] opacity-40 font-bold uppercase tracking-widest text-center">
                Standing by for signal...
              </Text>
            </div>

            {/* Decorative background glow behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />
          </Flex>
        )}

        {/* Permission Error Message */}
        {permissionError && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            className="absolute w-full h-full bg-gray-2 z-20 p-4 text-center"
            gap="3"
          >
            <Text size="3" weight="bold" color="red">
              Camera or Microphone access denied
            </Text>
            <Text size="2" color="gray">
              Please allow permissions in your browser settings and reload the
              page to start streaming.
            </Text>
            <Button variant="soft" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Flex>
        )}

        {/* OBS/Ingress stream — auto-detected, takes over when active */}
        {obsIsLive && obsIngressTracks.map((t) => (
          <div key={`${t.participant.identity}-${t.source}`} className="w-full h-full relative">
            <VideoTrack
              trackRef={t}
              className="absolute w-full h-full object-contain bg-transparent"
            />
          </div>
        ))}

        {/* Local Host camera preview — only when no OBS and not in obsMode */}
        {!obsIsLive && canHost && !obsMode && (
          <div className="relative">
            <Flex
              className="absolute w-full h-full"
              align="center"
              justify="center"
            >
              <Avatar
                size="9"
                fallback={localParticipant.identity[0] ?? "?"}
                radius="full"
              />
            </Flex>
            <video
              ref={localVideoEl}
              className="absolute w-full h-full object-contain -scale-x-100 bg-transparent"
            />
            <div className="absolute w-full h-full">
              <Badge
                variant="outline"
                color="gray"
                className="absolute bottom-2 right-2"
              >
                {localParticipant?.identity} (you)
              </Badge>
            </div>
          </div>
        )}

        {/* Remote browser participants — only when OBS is NOT live and not onlyShowIngress */}
        {!onlyShowIngress && !obsIsLive && remoteVideoTracks.map((t) => (
          <div key={t.participant.identity} className="relative">
            <Flex
              className="absolute w-full h-full"
              align="center"
              justify="center"
            >
              <Avatar
                size="9"
                fallback={t.participant.identity[0] ?? "?"}
                radius="full"
              />
            </Flex>
            <VideoTrack
              trackRef={t}
              className="absolute w-full h-full bg-transparent"
            />
            <div className="absolute w-full h-full">
              <Badge
                variant="outline"
                color="gray"
                className="absolute bottom-2 right-2"
              >
                {t.participant.identity}
              </Badge>
            </div>
          </div>
        ))}
      </Grid>
      {remoteAudioTracks.map((t) => (
        <AudioTrack trackRef={t} key={t.participant.identity} />
      ))}
      <ConfettiCanvas />
      <StartAudio
        label="Click to allow audio playback"
        className="absolute top-0 h-full w-full bg-gray-2-translucent text-white"
      />
      {/* Premium Floating Controls Overlay */}
      {!obsMode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <Flex gap="4" align="center" className="glass-dark p-2.5 px-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] border border-white/10 glow-violet animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PresenceDialog isHost={isHost}>
              <div className="relative cursor-pointer group">
                <div className="absolute -inset-2 bg-violet-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                {showNotification && (
                  <div className="absolute flex h-2.5 w-2.5 -top-1 -right-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></span>
                  </div>
                )}
                <Flex align="center" gap="2" className="text-white relative px-2 transition-transform group-hover:scale-110">
                  <EyeOpenIcon className="w-4 h-4 opacity-70" />
                  <Text size="2" weight="bold" className="tabular-nums">{participants.length}</Text>
                </Flex>
              </div>
            </PresenceDialog>

            <div className="w-px h-6 bg-white/10" />

            <Flex gap="3">
              <MediaDeviceSettings />
              {roomMetadata?.creator_identity !== localParticipant?.identity && (
                <Button size="2" variant="surface" color="violet" onClick={onLeaveStage} className="rounded-xl font-bold px-4">
                  Leave Stage
                </Button>
              )}
              <Button
                size="2"
                variant="soft"
                color="gray"
                disabled={!Boolean(roomName)}
                className="rounded-xl text-white hover:bg-white/20 transition-all active:scale-90"
                onClick={() =>
                  copy(`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/watch/${roomName}`)
                }
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
            </Flex>
          </Flex>
        </div>
      )}
    </div>
  );
}
