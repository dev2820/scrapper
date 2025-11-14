import { useCallback } from "react";
import { useMessagesStore } from "@/stores/message-store";

/**
 * Hook for deleting messages.
 *
 * @example
 * const deleteMessage = useDeleteMessage();
 * deleteMessage(messageId);
 */
export function useDeleteMessage() {
  const deleteMessage = useMessagesStore((state) => state.deleteMessage);

  return useCallback(
    (id: string) => {
      deleteMessage(id);
    },
    [deleteMessage]
  );
}
