"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { JoinStreamResponse } from "@/lib/controller";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { ArrowRightIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";

export default function WatchPage({
  roomName,
  roomToken,
  serverUrl,
}: {
  roomName: string;
  roomToken: string;
  serverUrl: string;
}) {

  return (
    <TokenContext.Provider value="viewer-session">
      <LiveKitRoom serverUrl={serverUrl} token={roomToken} connect={true}>
        <Flex direction={{ initial: "column", md: "row" }} className="w-full h-screen mesh-gradient overflow-hidden relative">
          {/* Top Bar Logo Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pointer-events-none opacity-80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-2xl">
            <Box className="w-2 h-4 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full glow-violet" />
            <Text size="5" className="tracking-tighter text-white font-black uppercase italic">
              SAINT <span className="text-violet-9 text-glow">LIVE</span>
            </Text>
          </div>

          
          {/* Main Content Area: Centered Stream Player */}
          <Flex direction="column" className="flex-1 relative order-1">
            <Box className="flex-1 h-full overflow-hidden flex items-center justify-center">
              <Box className="w-full max-w-[1920px] h-full shadow-2xl overflow-hidden relative border border-white/5 glow-violet">
                <StreamPlayer isHost={false} onlyShowIngress={true} />
              </Box>
            </Box>

            {/* Floating Overlays */}
            <Box className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-none z-10">
              <div className="pointer-events-auto">
                <ReactionBar />
              </div>
            </Box>
          </Flex>

          {/* Side Content: Glassmorphic Chat */}
          <Box 
            className="w-full md:w-[320px] lg:w-[380px] border-l border-white/5 hidden md:block order-2"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <Chat />
          </Box>
        </Flex>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
