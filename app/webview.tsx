import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Pressable } from "react-native";
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-end px-3 py-1 border-b border-slate-200">
        <Pressable className="p-2" onPress={() => router.back()}>
          <Icon as={X} size={24} className="text-foreground" />
        </Pressable>
      </View>
      <WebView
        source={{ uri: url }}
        className="flex-1"
        startInLoadingState
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
}
