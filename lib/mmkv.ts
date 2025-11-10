import { createMMKV } from "react-native-mmkv";
import type { Scrap } from "@/types/Scrap";

const storage = createMMKV({ id: "scrapper-storage" });

const MESSAGES_KEY = "messages";

type StoredScrap = Omit<Scrap, "date"> & { date: string };

const isStoredScrap = (value: unknown): value is StoredScrap => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.message === "string" &&
    typeof candidate.id === "string" &&
    typeof candidate.date === "string" &&
    (candidate.parent === undefined || typeof candidate.parent === "string")
  );
};

export const getStoredMessages = (): Scrap[] => {
  const raw = storage.getString(MESSAGES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isStoredScrap)
      .map((scrap) => ({
        ...scrap,
        date: new Date(scrap.date),
      }));
  } catch (error) {
    console.warn("Failed to parse stored messages", error);
    return [];
  }
};

export const setStoredMessages = (messages: Scrap[]) => {
  try {
    const payload: StoredScrap[] = messages.map((scrap) => ({
      ...scrap,
      date: scrap.date.toISOString(),
    }));

    storage.set(MESSAGES_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to store messages", error);
  }
};
