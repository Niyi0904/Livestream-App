"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { LiveKitRoom } from "@livekit/components-react";
import { Box, Flex, Button, Heading, TextField, Text as RadixText, Card } from "@radix-ui/themes";
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
        <Flex className="w-full h-screen">
          <Box className="bg-slate-2 min-w-[300px] p-4 border-r border-slate-5">
            <Heading size="4" mb="4">Stream Settings</Heading>

            {!ingressData ? (
              <Button onClick={generateIngress} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Get OBS Stream Key"}
              </Button>
            ) : (
              /* 4. Display the results for the user to copy */
              <Card variant="surface">
                <Flex direction="column" gap="2">
                  <RadixText size="2" weight="bold">OBS Server URL:</RadixText>
                  <TextField.Root>
                    <input className="rt-TextFieldInput" value={ingressData.url} readOnly />
                  </TextField.Root>
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => handleCopy(ingressData.url, "url")}
                  >
                    {copiedField === "url" ? <CheckIcon /> : <CopyIcon />}
                  </Button>

                  <RadixText size="2" weight="bold">OBS Stream Key:</RadixText>
                  <TextField.Root>
                    <input className="rt-TextFieldInput" value={ingressData.streamKey} readOnly />
                  </TextField.Root>
                  <Button
                    variant="ghost"
                    size="1"
                    onClick={() => handleCopy(ingressData.streamKey, "key")}
                  >
                    {copiedField === "key" ? <CheckIcon /> : <CopyIcon />}
                  </Button>
                  <RadixText size="1" color="gray">Paste these into OBS {'>'} Settings {'>'} Stream {'>'} Custom</RadixText>
                </Flex>
              </Card>
            )}

            <Flex direction="column" gap="4">
              <Box>
                <RadixText size="2" weight="bold" mb="1" as="div">YouTube Stream Key</RadixText>
                <TextField.Root>
                  <input
                    className="rt-TextFieldInput"
                    placeholder="paste-key-here"
                    value={ytKey}
                    onChange={(e) => setYtKey(e.target.value)}
                  />
                </TextField.Root>
              </Box>

              <Box>
                <RadixText size="2" weight="bold" mb="1" as="div">TikTok Stream Key</RadixText>
                <TextField.Root>
                  <input
                    className="rt-TextFieldInput"
                    placeholder="paste-key-here"
                    value={ttKey}
                    onChange={(e) => setTtKey(e.target.value)}
                  />
                </TextField.Root>
              </Box>

              <Button
                color={isStreaming ? "gray" : "red"}
                variant="solid"
                size="3"
                onClick={isStreaming ? stopRestream : startRestream}
              >
                {isStreaming ? "Stop Social Stream" : "Go Live on Socials"}
              </Button>
            </Flex>
          </Box>

          <Flex direction="column" className="flex-1">
              <Box className="flex-1 bg-gray-1">
                <StreamPlayer isHost obsMode />
              </Box>
            <ReactionBar />
          </Flex>

          <Box className="bg-accent-2 min-w-[280px] border-l border-accent-5 hidden sm:block">
            <Chat />
          </Box>
        </Flex>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
