import { Container, Flex, Kbd, Link, Separator, Text, Button, Heading } from "@radix-ui/themes";
import Image from "next/image";
import NextLink from "next/link"; // Use Next.js Link for fast navigation

export default function Home() {
  // We define a default room name for quick testing
  const defaultRoom = "main-stage";
  const devAuthToken = "admin-user";

  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-10 sm:p-24 bg-slate-1">
      <Container size="1">
        <Flex direction="column" align="center" gap="5">
          <Image
            src="/wordmark.svg"
            alt="LiveKit"
            width="240"
            height="120"
            className="invert dark:invert-0 mt-8 mb-2"
          />

          <Text as="p" align="center" color="gray">
            Choose your role to start the livestream experience.
          </Text>

          <Flex gap="4" mt="4">
            {/* BUTTON 1: STREAM FROM OBS (HOST) */}
            <NextLink href={`/host?roomName=${defaultRoom}&at=${devAuthToken}`} passHref>
              <Button size="3" color="indigo" variant="solid" style={{ cursor: 'pointer' }}>
                Stream from OBS (Host)
              </Button>
            </NextLink>

            {/* BUTTON 2: WATCH EXISTING STREAM (VIEWER) */}
            <NextLink href={`/watch/${defaultRoom}`} passHref>
              <Button size="3" color="gray" variant="soft" style={{ cursor: 'pointer' }}>
                Watch Existing Stream
              </Button>
            </NextLink>
          </Flex>

          <Separator orientation="horizontal" size="4" className="my-4" />

          <Text as="p" size="2" align="center">
            Want to build your own? Clone this app{" "}
            <Link href="https://github.com/livekit-examples/livestream" target="_blank">
              here
            </Link>.
          </Text>
        </Flex>
      </Container>
    </main>
  );
}
