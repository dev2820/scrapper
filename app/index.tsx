import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CircleArrowUp } from "lucide-react-native";

export default function HomeScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0;

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [...prev, trimmed]);
    setDraft("");
  }, [draft]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={24}
      >
        <View style={styles.messagesContainer}>
          <ScrollView
            contentContainerStyle={[
              styles.messagesContent,
              messages.length === 0 && styles.messagesEmpty,
            ]}
          >
            {messages.length === 0 ? (
              <Text style={styles.placeholderText}>
                Start chatting by typing a message below.
              </Text>
            ) : (
              messages.map((message, index) => (
                <View style={styles.messageBubble} key={`${index}-${message}`}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        <View style={styles.inputRow}>
          <Input
            className="flex-1"
            placeholder="Type a message"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onPress={handleSend}
            accessibilityLabel="Send message"
            disabled={!canSend}
          >
            <Icon as={CircleArrowUp} size={24} className="text-primary" />
          </Button>
        </View>
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: 20,
  },
  messagesEmpty: {
    justifyContent: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 16,
  },
  messageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: "80%",
    marginTop: 12,
  },
  messageText: {
    color: "#ffffff",
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
});
