import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { useEffect } from "react";
import * as Linking from "expo-linking";

import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getStoredMessages, setStoredMessages } from "@/lib/mmkv";
import type { Scrap } from "@/types/Scrap";

const createIdentifier = () => {
  const randomUUID = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Handle deep links from ShareExtension
  useEffect(() => {
    // Handle URL when app is opened from a link
    const handleURL = ({ url }: { url: string }) => {
      console.log("🔗 Received URL:", url);
      const parsed = Linking.parse(url);
      console.log("🔗 Parsed URL:", parsed);

      if (parsed.hostname === "share" && parsed.queryParams?.text) {
        const sharedText = decodeURIComponent(
          parsed.queryParams.text as string,
        );
        console.log("✅ Got shared text from URL:", sharedText);

        handleSharedContent({ data: sharedText, mimeType: "text/plain" });
      }
    };

    // Get initial URL (when app is opened from closed state)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("🔗 Initial URL:", url);
        handleURL({ url });
      }
    });

    // Listen for URL events (when app is already open)
    const subscription = Linking.addEventListener("url", handleURL);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSharedContent = (share: any) => {
    try {
      if (!share) {
        console.log("ERROR: Share is null or undefined");
        return;
      }

      // Extract text or URL from the shared content
      const sharedText = share.data;

      console.log("Extracted text:", sharedText);
      console.log("Text type:", typeof sharedText);

      if (!sharedText || typeof sharedText !== "string") {
        console.log("ERROR: Invalid shared text");
        return;
      }

      // Create a new scrap from the shared content
      const newScrap: Scrap = {
        message: sharedText.trim(),
        date: new Date(),
        id: createIdentifier(),
      };

      console.log("Creating new scrap:", newScrap);

      // Get existing messages and add the new one
      const existingMessages = getStoredMessages();
      const updatedMessages = [...existingMessages, newScrap];
      setStoredMessages(updatedMessages);

      console.log("✅ Scrap saved successfully!");
    } catch (error) {
      console.error("❌ Failed to handle shared content:", error);
    }
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="share" options={{ headerShown: false }} />
        <Stack.Screen
          name="webview"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_right",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
      <PortalHost />
    </ThemeProvider>
  );
}
