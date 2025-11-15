import { useCallback } from "react";
import {
  useMessagesStore,
  createMessageFromText,
} from "@/stores/message-store";

/**
 * Hook for creating/adding new messages.
 *
 * @example
 * const addMessage = useAddMessage();
 * addMessage("Hello world");
 */
export function useAddMessage() {
  const addMessage = useMessagesStore((state) => state.addMessage);

  return useCallback(
    (text: string) => {
      const newMessage = createMessageFromText(text);
      addMessage(newMessage);
    },
    [addMessage],
  );
}
