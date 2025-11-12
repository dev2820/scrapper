import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Icon } from "@/components/ui/icon";
import { X } from "lucide-react-native";

export default function WebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url: string }>();
  const url = params.url;

  if (!url) {
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Icon as={X} size={24} className="text-foreground" />
        </Pressable>
      </View>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
});
