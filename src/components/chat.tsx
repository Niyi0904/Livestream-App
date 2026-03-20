"use client";

import { RoomMetadata } from "@/lib/controller";
import {
  ReceivedChatMessage,
  useChat,
  useLocalParticipant,
  useRoomInfo,
} from "@livekit/components-react";
import { PaperPlaneIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMemo, useState } from "react";

function ChatMessage({ message }: { message: ReceivedChatMessage }) {
  const { localParticipant } = useLocalParticipant();
  const isMe = localParticipant?.identity === message.from?.identity;

  return (
    <Flex gap="2" align="start" className={`max-w-[85%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}>
      <Avatar
        size="1"
        fallback={message.from?.identity[0] ?? <PersonIcon />}
        radius="full"
        className="mt-1 shadow-sm"
      />
      <Flex direction="column" align={isMe ? "end" : "start"} gap="1">
        {!isMe && (
          <Text weight="bold" size="1" color="gray" className="px-1">
            {message.from?.identity ?? "Unknown"}
          </Text>
        )}
        <div 
          className={`px-3 py-2 rounded-2xl text-[13px] shadow-sm ${
            isMe 
              ? "bg-violet-9 text-white rounded-tr-none" 
              : "glass-dark text-white rounded-tl-none border border-white/10"
          }`}
        >
          {message.message}
        </div>
      </Flex>
    </Flex>
  );
}

export function Chat() {
  const [draft, setDraft] = useState("");
  const { chatMessages, send } = useChat();
  const { metadata } = useRoomInfo();

  const chatEnabled = useMemo(() => {
    try {
      if (!metadata) return true;
      const parsed = JSON.parse(metadata) as RoomMetadata;
      return parsed.enable_chat ?? true;
    } catch {
      return true;
    }
  }, [metadata]);

  const messages = useMemo(() => {
    if (!chatMessages) return [];
    const timestamps = chatMessages.map((msg) => msg.timestamp);
    const filtered = chatMessages.filter(
      (msg, i) => !timestamps.includes(msg.timestamp, i + 1)
    );

    return filtered;
  }, [chatMessages]);

  const onSend = async () => {
    if (draft.trim().length && send) {
      setDraft("");
      await send(draft);
    }
  };

  return (
    <Flex direction="column" className="h-full bg-transparent">
      <Box className="p-4 border-b border-white/5 backdrop-blur-sm">
        <Text size="2" weight="bold" className="uppercase tracking-widest text-violet-11">
          Live Chat
        </Text>
      </Box>
      
      <Flex
        direction="column"
        className="flex-1 h-full px-4 overflow-y-auto pt-4 pb-2"
        gap="3"
      >
        {messages.map((msg) => (
          <ChatMessage message={msg} key={msg.timestamp} />
        ))}
      </Flex>

      <Box className="p-4 pt-2">
        <Flex gap="2" className="glass-dark p-1 pr-1 pl-3 rounded-full border border-white/10 focus-within:border-violet-8 transition-colors">
          <input
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-gray-10 py-2"
            disabled={!chatEnabled}
            placeholder={
              chatEnabled ? "Say something..." : "Chat is disabled"
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <IconButton 
            variant="ghost" 
            radius="full"
            onClick={onSend} 
            disabled={!draft.trim().length}
            className="text-violet-11 hover:bg-violet-4"
          >
            <PaperPlaneIcon />
          </IconButton>
        </Flex>
      </Box>
    </Flex>
  );
}
