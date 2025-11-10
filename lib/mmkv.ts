import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "scrapper-storage" });

const MESSAGES_KEY = "messages";

export const getStoredMessages = (): string[] => {
  const raw = storage.getString(MESSAGES_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse stored messages", error);
    return [];
  }
};

export const setStoredMessages = (messages: string[]) => {
  try {
    storage.set(MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn("Failed to store messages", error);
  }
};
