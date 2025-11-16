import { SendHorizonal } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "./ui/native-only-animated-view";
import { useCallback, useState } from "react";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { useAddMessage } from "@/hooks/message/use-add-message";
import { TextInputContentSizeChangeEvent, useColorScheme } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/use-theme-color";

export function MessageInput() {
  const colorScheme = useColorScheme();
  const borderColor = useThemeColor(colorScheme, "border");
  const addMessage = useAddMessage();
  const [draft, setDraft] = useState("");
  const height = useSharedValue(60);
  const canSend = draft.trim().length > 0;

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(height.value, { duration: 0 }),
    overflow: "hidden",
  }));
  const handleSend = useCallback(() => {
    addMessage(draft);
    setDraft("");
  }, [addMessage, draft]);

  return (
    <NativeOnlyAnimatedView
      className="flex flex-row py-2 px-2"
      style={[
        animatedStyle,
        { borderStyle: "solid", borderTopWidth: 1, borderColor: borderColor },
      ]}
    >
      <Textarea
        className={cn(
          "bg-input",
          "text-6 leading-normal flex-1 min-h-12 rounded-3xl px-6 pt-3",
        )}
        style={[
          { borderStyle: "solid", borderWidth: 1, borderColor: borderColor },
        ]}
        placeholder="Type a message"
        value={draft}
        onChangeText={setDraft}
        onContentSizeChange={(e: TextInputContentSizeChangeEvent) => {
          const { nativeEvent } = e;
          const { contentSize } = nativeEvent;

          height.set(calcHeight(contentSize.height));
        }}
        submitBehavior="newline"
      />
      <Button
        size="icon"
        className="ml-2 self-end rounded-full size-12 bg-accent active:bg-accent/80"
        onPress={handleSend}
        accessibilityLabel="Send message"
        disabled={!canSend}
      >
        <Icon as={SendHorizonal} size={20} className="text-accent-foreground" />
      </Button>
    </NativeOnlyAnimatedView>
  );
}

const calcHeight = (height: number) => {
  if (height > 48 + 24 * 4) {
    // 6줄
    return 48 + 16 + 24 * 5;
  }
  if (height > 48 + 24 * 3) {
    // 5줄
    return 48 + 16 + 24 * 4;
  }
  if (height > 48 + 24 * 2) {
    // 4줄
    return 48 + 16 + 24 * 3;
  }
  if (height > 48 + 24) {
    // 3줄
    return 48 + 16 + 24 * 2;
  }
  if (height > 48) {
    // 2줄
    return 48 + 16 + 24;
  }
  return 48 + 16; // 1줄
};
