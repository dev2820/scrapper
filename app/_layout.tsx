import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { isEmpty, isString } from "es-toolkit/compat";

import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getStoredMessages, setStoredMessages } from "@/lib/mmkv";
import { uuid } from "@/utils/uuid";
import { useSharedTargetIOS } from "@/hooks/use-shared-target-ios";
import type { Scrap } from "@/types/Scrap";
import type { SharedMessage } from "@/types/SharedMessage";

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useSharedTargetIOS(handleSharedContent);

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
