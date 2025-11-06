import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SendHorizonal } from "lucide-react-native";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Hyperlink } from "@/components/ui/hyperlink";

export default function HomeScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const lines = useMemo(() => Math.min(draft.split("\n").length, 6), [draft]);
  const canSend = draft.trim().length > 0;

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [...prev, trimmed]);
    setDraft("");
  }, [draft]);

  const handleClickLink = useCallback((url: string) => {
    Linking.openURL(url).catch((error) => {
      console.warn("Failed to open url", error);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={24}
        className="bg-blue-50"
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
                  <Hyperlink onPress={handleClickLink}>
                    <Text style={styles.messageText}>{message}</Text>
                  </Hyperlink>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        <NativeOnlyAnimatedView
          className="flex flex-row py-2 px-2"
          style={[{ height: lines * 24 + 32 }]}
        >
          <Textarea
            className={cn(
              "text-4 leading-normal flex-1 min-h-6 border-1 border-border shadow-lg rounded-3xl bg-white px-4",
            )}
            placeholder="Type a message"
            numberOfLines={1}
            value={draft}
            onChangeText={setDraft}
            submitBehavior="newline"
          />
          <Button
            // variant="ghost"
            size="icon"
            className="ml-2 self-end rounded-full"
            onPress={handleSend}
            accessibilityLabel="Send message"
            disabled={!canSend}
          >
            <Icon
              as={SendHorizonal}
              size={20}
              className="text-primary-foreground"
            />
          </Button>
        </NativeOnlyAnimatedView>
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
    backgroundColor: "#dddddd",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: "80%",
    marginTop: 12,
  },
  messageText: {
    color: "#111111",
    fontSize: 16,
  },
});
