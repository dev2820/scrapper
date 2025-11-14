import { useCallback } from "react";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateMessage } from "@/hooks/message/use-create-message";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { isIOS } from "@/utils/device";

export default function HomeScreen() {
  const createMessage = useCreateMessage();

  const handleSend = useCallback(
    (message: string) => {
      createMessage(message);
    },
    [createMessage]
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={isIOS() ? "padding" : "height"}
        keyboardVerticalOffset={24}
        className="bg-blue-50"
      >
        <MessageView />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  wrapper: {
    flex: 1,
  },
});
