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
import { isEmpty, isString } from "es-toolkit/compat";

import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getStoredMessages, setStoredMessages } from "@/lib/mmkv";
import type { Scrap } from "@/types/Scrap";
import { uuid } from "@/utils/uuid";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // share target feature for iOS
    const handleURL = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);

      if (parsed.hostname === "share" && parsed.queryParams?.text) {
        const sharedText = decodeURIComponent(
          parsed.queryParams.text as string,
        );

        handleSharedContent({ data: sharedText, mimeType: "text/plain" });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleURL({ url });
      }
    });

    const subscription = Linking.addEventListener("url", handleURL);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSharedContent = (share: { data: unknown }) => {
    try {
      if (!share) return;
      const sharedText = share.data;

      if (!isString(sharedText)) return;
      if (isEmpty(sharedText)) return;

      // Create a new scrap from the shared content
      const newScrap: Scrap = {
        message: sharedText.trim(),
        date: new Date(),
        id: uuid(),
      };

      // Get existing messages and add the new one
      const existingMessages = getStoredMessages();
      const updatedMessages = [...existingMessages, newScrap];
      setStoredMessages(updatedMessages);
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
