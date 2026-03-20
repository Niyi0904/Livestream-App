"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { JoinStreamResponse } from "@/lib/controller";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { ArrowRightIcon, ChatBubbleIcon, Cross1Icon, PersonIcon } from "@radix-ui/react-icons";
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
  const [isLandscape, setIsLandscape] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <TokenContext.Provider value="viewer-session">
      <LiveKitRoom serverUrl={serverUrl} token={roomToken} connect={true}>
        <Flex direction={{ initial: "column", md: "row" }} className="w-full h-screen mesh-gradient overflow-hidden relative">


          {/* Main Content Area: Centered Stream Player */}
          <Flex 
            direction="column" 
            className={cn(
              "flex-1 relative order-1 transition-all duration-300",
              isLandscape && "fixed inset-0 z-[60] bg-black md:relative md:inset-auto md:z-auto"
            )}
          >
            {/* Mobile Chat Toggle Button */}
            <Box className="absolute top-6 left-6 z-40 md:hidden">
              <Button
                size="3"
                variant="soft"
                color="violet"
                className="rounded-full w-12 h-12 glass border-white/10 shadow-xl"
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? <Cross1Icon /> : <ChatBubbleIcon />}
              </Button>
            </Box>

            {/* Landscape Toggle Button (Mobile Only) */}
            <Box className="absolute bottom-6 right-6 z-40 md:hidden">
              <Button
                size="3"
                variant="solid"
                color="violet"
                className="rounded-full px-4 glass border-white/10 shadow-xl font-bold uppercase tracking-wider text-[10px]"
                onClick={() => setIsLandscape(!isLandscape)}
              >
                {isLandscape ? "Exit Landscape" : "Landscape Mode"}
              </Button>
            </Box>

            <Box className={cn(
              "flex-1 bg-black overflow-hidden relative transition-all duration-300",
              isLandscape ? "h-screen w-screen" : "h-full"
            )}>
              <StreamPlayer isHost={false} onlyShowIngress={true} />
            </Box>

            {/* Floating Overlays */}
            <Box className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pointer-events-none z-10">
              <div className="pointer-events-auto">
                <ReactionBar />
              </div>
            </Box>
          </Flex>

          {/* Side Content: Glassmorphic Chat (Desktop Right, Mobile Left Drawer) */}
          <Box
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-full max-w-[320px] transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:order-2 border-r md:border-l md:border-r-0 border-white/5",
              isChatOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          >
            {/* Mobile Close Button inside Drawer */}
            <Box className="p-4 flex justify-between items-center border-b border-white/5 md:hidden">
              <Text weight="bold" size="2" className="tracking-widest uppercase opacity-50">Live Chat</Text>
              <Button variant="ghost" color="gray" onClick={() => setIsChatOpen(false)}>
                <Cross1Icon />
              </Button>
            </Box>
            <Chat />
          </Box>

          {/* Mobile Overlay Background when Chat is open */}
          {isChatOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsChatOpen(false)}
            />
          )}
        </Flex>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
