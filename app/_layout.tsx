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
import { useSharedTargetIOS } from "@/hooks/use-shared-target-ios";
import type { SharedMessage } from "@/types/SharedMessage";
import { useAddMessage } from "@/hooks/message/use-add-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const addMessage = useAddMessage();

  const handleSharedContent = (share: SharedMessage) => {
    try {
      if (!share) return;
      const sharedText = share.data;

      if (!isString(sharedText)) return;
      if (isEmpty(sharedText)) return;

      addMessage(sharedText);
    } catch (error) {
      console.error("❌ Failed to handle shared content:", error);
    }
  };
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
