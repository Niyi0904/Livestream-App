"use client";

import { useChat, useDataChannel } from "@livekit/components-react";
import { Button, Flex, Tooltip } from "@radix-ui/themes";
import { DataPacket_Kind } from "livekit-client";
import { useState } from "react";

export function ReactionBar() {
  const [encoder] = useState(() => new TextEncoder());
  const { send } = useDataChannel("reactions");
  const { send: sendChat } = useChat();

  const onSend = (emoji: string) => {
    send(encoder.encode(emoji), { kind: DataPacket_Kind.LOSSY });
    if (sendChat) {
      sendChat(emoji);
    }
  };

  return (
    <Flex
      gap="4"
      justify="center"
      align="center"
      className="glass-dark border border-white/10 rounded-[24px] px-8 h-[76px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl glow-violet"
    >
      <Tooltip content="Fire" delayDuration={0}>
        <Button size="4" variant="ghost" onClick={() => onSend("🔥")} className="hover:bg-orange-500/20 rounded-xl text-2xl transition-all hover:scale-150 active:scale-90 duration-300">
          🔥
        </Button>
      </Tooltip>
      <Tooltip content="Applause">
        <Button size="4" variant="ghost" onClick={() => onSend("👏")} className="hover:bg-yellow-500/20 rounded-xl text-2xl transition-all hover:scale-150 active:scale-90 duration-300">
          👏
        </Button>
      </Tooltip>
      <Tooltip content="LOL">
        <Button size="4" variant="ghost" onClick={() => onSend("🤣")} className="hover:bg-green-500/20 rounded-xl text-2xl transition-all hover:scale-150 active:scale-90 duration-300">
          🤣
        </Button>
      </Tooltip>
      <Tooltip content="Love">
        <Button size="4" variant="ghost" onClick={() => onSend("❤️")} className="hover:bg-red-500/20 rounded-xl text-2xl transition-all hover:scale-150 active:scale-90 duration-300">
          ❤️
        </Button>
      </Tooltip>
      <Tooltip content="Confetti">
        <Button size="4" variant="ghost" onClick={() => onSend("🎉")} className="hover:bg-violet-500/20 rounded-xl text-2xl transition-all hover:scale-150 active:scale-90 duration-300">
          🎉
        </Button>
      </Tooltip>
    </Flex>
  );
}
