import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { Message } from "@/types/Message";
import { storage as mmkvStorage } from "@/lib/mmkv";
import { uuid } from "@/utils/uuid";
import { isBefore } from "date-fns";

interface MessagesState {
  messages: Message[];
}

interface MessagesActions {
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  setMessages: (messages: Message[]) => void;
}

type MessagesStore = MessagesState & MessagesActions;

/**
 * MMKV storage adapter for Zustand persist middleware
 */
const zustandMMKVStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name) => {
    mmkvStorage.remove(name);
  },
};

/**
 * Zustand store for messages with MMKV persistence.
 * All components using this store share the same reactive state.
 * Automatically syncs to MMKV on every state change.
 *
 * When migrating to TanStack Query:
 * - Replace this store with useQuery/useMutation hooks
 * - Keep the same API surface for consumers
 */
export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (message) => {
        set({
          messages: [...get().messages, message].sort((a, b) =>
            isBefore(a.date, b.date) ? 1 : -1,
          ),
        });
      },

      updateMessage: (id, updates) => {
        set({
          messages: get()
            .messages.map((msg) =>
              msg.id === id ? { ...msg, ...updates } : msg,
            )
            .sort((a, b) => (isBefore(a.date, b.date) ? 1 : -1)),
        });
      },

      deleteMessage: (id) => {
        set({
          messages: get().messages.filter((msg) => msg.id !== id),
        });
      },

      setMessages: (messages) => {
        set({ messages });
      },
    }),
    {
      name: "messages-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<MessagesState>;
        return {
          ...currentState,
          messages: (persisted.messages ?? []).map((msg) => ({
            ...msg,
            date: new Date(msg.date),
          })),
        };
      },
    },
  ),
);

/**
 * Helper function to create a Message object from text.
 *
 * @example
 * const message = createMessageObject("Hello world");
 */
export const createMessageFromText = (text: string): Message => {
  return {
    text: text.trim(),
    date: new Date(),
    id: uuid(),
  };
};
