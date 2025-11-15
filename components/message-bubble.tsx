import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { OpenGraphLoader } from "./open-graph-loader";
import { LinkPreviewCard } from "./link-preview-card";
import type { Message } from "@/types/Message";
import LinkifyIt from "linkify-it";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { MessageMenu } from "./message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";

const linkify = new LinkifyIt();

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const router = useRouter();
  const deleteMessage = useDeleteMessage();
  const [menuOpen, setMenuOpen] = useState(false);

  const link = getFirstLinkFromMessage(message.text);

  const handleClickLink = useCallback(
    (url: string) => {
      router.push({
        pathname: "/webview",
        params: { url },
      });
    },
    [router],
  );
  const handleLongPressMessage = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleDeleteMessage = (id: Message["id"]) => {
    deleteMessage(id);
  };

  return (
    <View key={message.id}>
      <View style={styles.messageGroup}>
        <Pressable
          onLongPress={handleLongPressMessage}
          style={styles.messageBubble}
        >
          <Hyperlink onPress={handleClickLink}>
            <Text style={styles.messageText}>{message.text}</Text>
          </Hyperlink>
        </Pressable>
        {link && (
          <OpenGraphLoader url={link} fallback={null}>
            {(og) => <LinkPreviewCard {...og} />}
          </OpenGraphLoader>
        )}
      </View>

      <MessageMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Pressable
          onPress={() => {
            handleDeleteMessage(message.id);
            setMenuOpen(false);
          }}
        >
          <Text>Delete</Text>
        </Pressable>
      </MessageMenu>
    </View>
  );
}

const getFirstLinkFromMessage = (text: string) => {
  if (text === undefined) return null;

  const matches = linkify.match(text);
  if (!matches || matches.length === 0) {
    return null;
  }
  return matches[0].url;
};

const styles = StyleSheet.create({
  messageGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginTop: 12,
    maxWidth: "80%",
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
});
