import { useCallback } from "react";
import {
  useMessagesStore,
  createMessageFromText,
} from "@/stores/message-store";

/**
 * Hook for creating/adding new messages.
 *
 * @example
 * const createMessage = useCreateMessage();
 * createMessage("Hello world");
 */
export function useCreateMessage() {
  const addMessage = useMessagesStore((state) => state.addMessage);

  return useCallback(
    (text: string) => {
      const newMessage = createMessageFromText(text);
      addMessage(newMessage);
    },
    [addMessage],
  );
}
