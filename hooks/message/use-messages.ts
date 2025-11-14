import { useMessagesStore } from "@/stores/message-store";

/**
 * Hook for reading messages.
 * All components using this hook share the same reactive state.
 *
 * @example
 * const messages = useMessages();
 */
export function useMessages() {
  return useMessagesStore((state) => state.messages);
}
