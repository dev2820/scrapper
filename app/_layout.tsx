import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ShareIntentProvider } from "expo-share-intent";

import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { HandleShareIntent } from "@/components/handle-share-intent";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(new QueryClient());

  return (
    <ShareIntentProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
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
            <HandleShareIntent />
            <PortalHost />
          </KeyboardProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ShareIntentProvider>
  );
}
