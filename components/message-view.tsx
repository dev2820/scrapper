import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { isSameYear, isSameDay } from "date-fns";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { useMessages } from "@/hooks/message/use-messages";
import LinkifyIt from "linkify-it";
import { DateDivider } from "@/components/date-divider";
import { MessageMenu } from "@/components/message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";
import { Message } from "@/types/Message";
import { OpenGraphLoader } from "./open-graph-loader";

const linkify = new LinkifyIt();

export function MessageView() {
  const router = useRouter();
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

  const handleClickLink = useCallback(
    (url: string) => {
      router.push({
        pathname: "/webview",
        params: { url },
      });
    },
    [router],
  );

  const handleLongPressMessage = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setMenuOpen(true);
  }, []);

  const handleDeleteMessage = (id: Message["id"]) => {
    deleteMessage(id);
  };

  const getFirstLinkFromMessage = useCallback((text: string) => {
    if (text === undefined) return null;

    const matches = linkify.match(text);
    if (!matches || matches.length === 0) {
      return null;
    }
    return matches[0].url;
  }, []);

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

            const showDivider =
              prevMessage && !isSameDay(message.date, prevMessage.date);

            return (
              <View key={message.id}>
                {showDivider && (
                  <DateDivider label={formatDateLabel(message.date)} />
                )}
                <View style={styles.messageGroup}>
                  <Pressable
                    onLongPress={() => handleLongPressMessage(message.id)}
                    style={styles.messageBubble}
                  >
                    <Hyperlink onPress={handleClickLink}>
                      <Text style={styles.messageText}>{message.text}</Text>
                    </Hyperlink>
                  </Pressable>
                  {getFirstLinkFromMessage(message.text) && (
                    <OpenGraphLoader
                      url={getFirstLinkFromMessage(message.text)!}
                      fallback={null}
                    >
                      {(og) => <Text>{og.title}</Text>}
                    </OpenGraphLoader>
                  )}
                </View>
              </View>
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

const formatDateLabel = (value: Date) => {
  const today = new Date();

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: isSameYear(value, today) ? undefined : "numeric",
  }).format(value);
};

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
  messageBubble: {
    backgroundColor: "#dddddd",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: "80%",
  },
  messageText: {
    color: "#111111",
    fontSize: 16,
  },
  messageGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginTop: 12,
    maxWidth: "80%",
  },
});
