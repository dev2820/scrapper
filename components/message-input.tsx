import { SendHorizonal } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "./ui/native-only-animated-view";
import { useCallback, useMemo, useState } from "react";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { useCreateMessage } from "@/hooks/message/use-create-message";

export function MessageInput() {
  const createMessage = useCreateMessage();
  const [draft, setDraft] = useState("");

  const canSend = draft.trim().length > 0;
  const lines = useMemo(() => Math.min(draft.split("\n").length, 6), [draft]);

  const handleSend = useCallback(() => {
    createMessage(draft);
    setDraft("");
  }, [createMessage, draft]);

  return (
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
  );
}
