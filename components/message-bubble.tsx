import { View, Pressable, Vibration } from "react-native";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { OpenGraphLoader } from "./open-graph-loader";
import { LinkPreviewCard } from "./link-preview-card";
import type { Message } from "@/types/Message";
import LinkifyIt from "linkify-it";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { MessageMenu } from "./message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";
import { cn } from "@/lib/utils";

const linkify = new LinkifyIt();

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const router = useRouter();
  const deleteMessage = useDeleteMessage();
  const [menuOpen, setMenuOpen] = useState(false);

  const link = useMemo(() => {
    const matches = linkify.match(message.text);
    if (!matches || matches.length === 0) {
      return null;
    }
    return matches[0].url;
  }, [message.text]);

  const handleClickLink = useCallback(
    (url: string) => {
      const secureUrl = url.startsWith("http://")
        ? url.replace("http://", "https://")
        : url;

      router.push({
        pathname: "/webview",
        params: { url: secureUrl },
      });
    },
    [router],
  );
  const handleLongPressMessage = useCallback(() => {
    Vibration.vibrate(50);
    setMenuOpen(true);
  }, []);

  return (
    <View key={message.id}>
      <View className="flex-col items-end self-end mt-3 max-w-[80%]">
        <Pressable
          onLongPress={handleLongPressMessage}
          className={cn(
            "bg-primary rounded-2xl rounded-br-none py-2.5 px-3.5 max-w-[80%]",
            "active:opacity-80",
          )}
        >
          <Hyperlink onPress={handleClickLink}>
            <Text className="text-primary-foreground text-base">
              {message.text}
            </Text>
          </Hyperlink>
        </Pressable>
        {link && (
          <OpenGraphLoader url={link} fallback={null}>
            {(og) => <LinkPreviewCard {...og} onPress={handleClickLink} />}
          </OpenGraphLoader>
        )}
      </View>

      <MessageMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Pressable
          onPress={() => {
            deleteMessage(message.id);
            setMenuOpen(false);
          }}
        >
          <Text>Delete</Text>
        </Pressable>
      </MessageMenu>
    </View>
  );
}
