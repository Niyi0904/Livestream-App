"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { LiveKitRoom } from "@livekit/components-react";
import { Box, Flex, Button, Heading, TextField, Text as RadixText, Card, IconButton } from "@radix-ui/themes";
import { useState } from "react";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons"; // Icons for the button


export default function HostPage({
  authToken,
  roomToken,
  serverUrl,
  roomName,
}: {
  authToken: string;
  roomToken: string;
  serverUrl: string;
  roomName: string;
}) {

  const [ytKey, setYtKey] = useState("");
  const [ttKey, setTtKey] = useState("");
  const [egressId, setEgressId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const [ingressData, setIngressData] = useState<{ url: string; streamKey: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);


  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000); // Reset icon after 2 seconds
  };

  const generateIngress = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/create-ingress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }), // Pass the current room name
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ingress");
      }
      setIngressData(data); // Save the URL and Key
    } catch (error: any) {
      console.error("Failed to generate ingress:", error);
      alert(`Error generating ingress: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startRestream = async () => {
    if (!ytKey && !ttKey) {
      alert("Please enter at least one stream key!");
      return;
    }

    setIsStreaming(true);

    try {
      const response = await fetch("/api/start-restream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          youtubeKey: ytKey,
          tiktokKey: ttKey,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setEgressId(data.egressId);
        alert("Success! You are now live on social media.");
      } else {
        alert(`Failed to start stream: ${data.error}`);
        setIsStreaming(false);
      }
    } catch (error) {
      console.error(error);
      alert("Network error while starting stream.");
      setIsStreaming(false);
    }
  };

  const stopRestream = async () => {
    if (!egressId) return;

    try {
      const response = await fetch("/api/stop-restream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ egressId }),
      });

      const data = await response.json();
      if (response.ok) {
        setEgressId(null);
        setIsStreaming(false);
        alert("Stream stopped successfully.");
      } else {
        alert(`Failed to stop stream: ${data.error}`);
      }
    } catch (error) {
      console.error("Stop failed", error);
      alert("Network error while stopping stream.");
    }
  };


  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken} connect={true} audio={false} video={false}>
        <Flex direction={{ initial: "column", md: "row" }} className="w-full h-screen mesh-gradient overflow-hidden">
          {/* Left Sidebar: Settings */}
          <Box 
            className="w-full md:w-[320px] lg:w-[380px] p-6 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto order-2 md:order-1"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
          >
            <Box mb="6">
              <Flex align="center" gap="2" mb="1">
                <Box className="w-2 h-6 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full glow-violet" />
                <Heading size="6" className="tracking-tighter text-white font-black uppercase italic">
                  SAINT <span className="text-violet-9 text-glow">STUDIO</span>
                </Heading>
              </Flex>
              <RadixText size="1" color="gray" className="opacity-50 tracking-widest uppercase font-bold ml-4">
                Control Center v2.0
              </RadixText>
            </Box>

            <Flex direction="column" gap="6">
              {/* OBS Ingress Section */}
              <Card variant="surface" className="glass-dark border-white/10 p-4">
                <Flex direction="column" gap="3">
                  <RadixText size="2" weight="bold" className="text-gray-11 flex items-center gap-2">
                    OBS Encoding
                  </RadixText>
                  {!ingressData ? (
                    <Button 
                      onClick={generateIngress} 
                      disabled={isGenerating}
                      variant="classic"
                      color="violet"
                      size="3"
                      className="w-full shadow-lg"
                    >
                      {isGenerating ? "Generating Keys..." : "Get OBS Stream Key"}
                    </Button>
                  ) : (
                    <Flex direction="column" gap="4">
                      <Box>
                        <RadixText size="1" weight="bold" color="gray" mb="1" as="div">SERVER URL</RadixText>
                        <Flex gap="2">
                          <TextField.Root className="flex-1">
                            <input className="rt-TextFieldInput text-xs" value={ingressData.url} readOnly />
                          </TextField.Root>
                          <IconButton variant="ghost" onClick={() => handleCopy(ingressData.url, "url")}>
                            {copiedField === "url" ? <CheckIcon /> : <CopyIcon />}
                          </IconButton>
                        </Flex>
                      </Box>
                      <Box>
                        <RadixText size="1" weight="bold" color="gray" mb="1" as="div">STREAM KEY</RadixText>
                        <Flex gap="2">
                          <TextField.Root className="flex-1">
                            <input className="rt-TextFieldInput text-xs" value={ingressData.streamKey} readOnly />
                          </TextField.Root>
                          <IconButton variant="ghost" onClick={() => handleCopy(ingressData.streamKey, "key")}>
                            {copiedField === "key" ? <CheckIcon /> : <CopyIcon />}
                          </IconButton>
                        </Flex>
                      </Box>
                    </Flex>
                  )}
                </Flex>
              </Card>

              {/* Social Restreaming Section */}
              <Card variant="surface" className="glass-dark border-white/10 p-4">
                <Flex direction="column" gap="4">
                  <RadixText size="2" weight="bold" className="text-gray-11">
                    Multi-Stream
                  </RadixText>
                  
                  <Box>
                    <RadixText size="1" weight="bold" color="gray" mb="1" as="div">YOUTUBE KEY</RadixText>
                    <TextField.Root>
                      <input
                        className="rt-TextFieldInput"
                        placeholder="rtmp-key-here"
                        value={ytKey}
                        onChange={(e) => setYtKey(e.target.value)}
                      />
                    </TextField.Root>
                  </Box>

                  <Box>
                    <RadixText size="1" weight="bold" color="gray" mb="1" as="div">TIKTOK KEY</RadixText>
                    <TextField.Root>
                      <input
                        className="rt-TextFieldInput"
                        placeholder="rtmp-key-here"
                        value={ttKey}
                        onChange={(e) => setTtKey(e.target.value)}
                      />
                    </TextField.Root>
                  </Box>

                  <Button
                    color={isStreaming ? "gray" : "red"}
                    variant="solid"
                    size="3"
                    className="w-full shadow-lg"
                    onClick={isStreaming ? stopRestream : startRestream}
                  >
                    {isStreaming ? "Stop Broadcast" : "Go Live on Socials"}
                  </Button>
                </Flex>
              </Card>
            </Flex>
          </Box>

          {/* Center: Stream Player */}
          <Flex direction="column" className="flex-1 relative order-1 md:order-2">
            <Box className="flex-1 bg-black overflow-hidden">
              <StreamPlayer isHost obsMode />
            </Box>

          </Flex>

          {/* Right Sidebar: Chat */}
          <Box 
            className="w-full md:w-[320px] lg:w-[350px] border-l border-white/5 hidden md:block order-3"
            style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          >
            <Chat />
          </Box>
        </Flex>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
