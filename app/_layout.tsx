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

type SharedMessage = {
  data: string;
  mimeType: "text/plain";
};

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

        handleSharedContent({
          data: sharedText,
          mimeType: "text/plain",
        } satisfies SharedMessage);
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

  const handleSharedContent = (share: SharedMessage) => {
    try {
      if (!share) return;
      const sharedText = share.data;

      if (!isString(sharedText)) return;
      if (isEmpty(sharedText)) return;

      const newScrap: Scrap = {
        message: sharedText.trim(),
        date: new Date(),
        id: uuid(),
      };

      // FIXME: storedmessage를 다루기 위한 CRUD 인터페이스가 필요함
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
