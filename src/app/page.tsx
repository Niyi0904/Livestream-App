import { Container, Flex, Kbd, Link, Separator, Text, Button, Heading, Card, Badge } from "@radix-ui/themes";
import Image from "next/image";
import NextLink from "next/link"; // Use Next.js Link for fast navigation

export default function Home() {
  // We define a default room name for quick testing
  const defaultRoom = "main-stage";
  const devAuthToken = "admin-user";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden mesh-gradient selection:bg-violet-9 selection:text-white">
      {/* Dynamic Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      <Container size="1" className="relative z-10 w-full mt-6 px-6">
        <Card size="4" className="glass border-white/10 shadow-2xl p-10 rounded-[40px] overflow-hidden text-center relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />

          <Flex direction="column" align="center" gap="6">
            <Flex direction="column" align="center" gap="2">
              <Heading size="6" align="center" className="tracking-tighter text-white font-black leading-none mt-2">
                RESTRO STREAMING & RESTREAMING APP
              </Heading>
              <Text as="p" align="center" color="gray" size="4" className="max-w-[380px] leading-relaxed opacity-80">
                Bringing our service to you, wherever you are. Stream live and stay connected to the Word.
              </Text>
            </Flex>

            <Flex direction="column" gap="4" mt="6" className="w-full">
              {/* MAIN CTA: HOST */}
              <NextLink href={`/host?roomName=${defaultRoom}&at=${devAuthToken}`} passHref className="w-full">
                <Button size="4" color="violet" variant="solid" className="w-full h-14 rounded-2xl shadow-xl shadow-violet-9/30 hover:shadow-violet-9/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold text-lg">
                  Launch Control Center
                </Button>
              </NextLink>

              <Flex gap="3" className="w-full">
                {/* SECONDARY CTA: WATCH */}
                <NextLink href={`/watch/${defaultRoom}`} passHref className="flex-1">
                  <Button size="3" color="gray" variant="soft" className="w-full h-12 rounded-xl glass-dark hover:bg-white/10 transition-colors cursor-pointer font-bold">
                    Watch Live
                  </Button>
                </NextLink>

                {/* EXPLORE / MORE */}
                <Button size="3" color="gray" variant="ghost" className="flex-1 h-12 rounded-xl border border-white/5 hover:border-white/20 transition-all font-bold opacity-60 hover:opacity-100">
                  Explore Rooms
                </Button>
              </Flex>
            </Flex>

            <Separator orientation="horizontal" size="4" className="w-full opacity-5 mt-4" />

            <div className="grid grid-cols-2 gap-8 w-full">
              <Flex direction="column" align="start" gap="1">
                <Text size="1" weight="bold" color="violet" className="tracking-widest uppercase">Connectivity</Text>
                <Text size="2" color="gray">Ultra Low Latency</Text>
              </Flex>
              <Flex direction="column" align="end" gap="1">
                <Text size="1" weight="bold" color="indigo" className="tracking-widest uppercase">Multi-Stream</Text>
                <Text size="2" color="gray">YouTube • TikTok</Text>
              </Flex>
            </div>
          </Flex>
        </Card>
      </Container>

      <footer className="absolute bottom-8 text-white/20 text-xs font-mono tracking-widest uppercase flex items-center gap-4">
        <span>© 2026 RESTRO</span>
        <span className="w-1 h-1 bg-white/20 rounded-full" />
        <span>PRO STREAM ENGINE V2.0</span>
      </footer>
    </main>
  );
}
