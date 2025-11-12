import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function ShareScreen() {
  const router = useRouter();

  useEffect(() => {
    // The actual data handling is done in _layout.tsx via expo-linking
    // This screen just exists to prevent "unmatched route" error
    // Immediately redirect to home
    router.replace("/");
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
