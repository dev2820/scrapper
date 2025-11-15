import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { isSameDay } from "date-fns";
import { Text } from "@/components/ui/text";
import { useMessages } from "@/hooks/message/use-messages";
import { DateDivider } from "@/components/date-divider";
import { MessageMenu } from "@/components/message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";
import { Message } from "@/types/Message";
import { MessageBubble } from "@/components/message-bubble";

export function MessageView() {
  const messages = useMessages();

  const scrollViewRef = useRef<ScrollView>(null);
  const previousMessagesLengthRef = useRef(messages.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const deleteMessage = useDeleteMessage();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > previousMessagesLengthRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  const handleLongPressMessage = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setMenuOpen(true);
  }, []);

  const handleDeleteMessage = (id: Message["id"]) => {
    deleteMessage(id);
  };

  return (
    <View style={styles.messagesContainer}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.messagesContent]}
      >
        {messages.length === 0 ? (
          <EmptyFallback />
        ) : (
          messages.map((message, i) => {
            const prevMessage = messages[i - 1];

            const showDivider = prevMessage
              ? !isSameDay(message.date, prevMessage.date)
              : true;

            return (
              <>
                {showDivider && <DateDivider date={message.date} />}
                <MessageBubble
                  message={message}
                  onLongPress={handleLongPressMessage}
                />
              </>
            );
          })
        )}
      </ScrollView>

      <MessageMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Pressable
          onPress={() => {
            if (selectedMessageId) {
              handleDeleteMessage(selectedMessageId);
            }
            setMenuOpen(false);
          }}
        >
          <Text>Delete</Text>
        </Pressable>
      </MessageMenu>
    </View>
  );
}

function EmptyFallback() {
  return (
    <Text style={styles.placeholderText}>
      Start chatting by typing a message below.
    </Text>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  messagesEmpty: {
    justifyContent: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 16,
  },
});
