import { useCallback, useEffect } from "react";
import { useShareIntent } from "expo-share-intent";
import { useAddMessage } from "@/hooks/message/use-add-message";
import { isString, isEmpty } from "es-toolkit/compat";

export function HandleShareIntent() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const addMessage = useAddMessage();

  const handleSharedData = useCallback(async () => {
    if (!shareIntent) return;
    const sharedText = shareIntent.text;

    try {
      if (isString(sharedText) && !isEmpty(sharedText.trim())) {
        addMessage(sharedText);
      }
    } catch (error) {
      console.error("Failed to handle shared content:", error);
    } finally {
      resetShareIntent();
    }
  }, [addMessage, resetShareIntent, shareIntent]);

  useEffect(() => {
    if (hasShareIntent) {
      handleSharedData();
    }
  }, [handleSharedData, hasShareIntent, resetShareIntent, shareIntent]);

  return null;
}
