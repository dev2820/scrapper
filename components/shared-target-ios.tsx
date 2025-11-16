import { useEffect } from "react";
import * as Linking from "expo-linking";
import { SharedMessage } from "@/types/SharedMessage";

export function SharedTargetIOS(props: {
  onShared: (message: SharedMessage) => void;
}) {
  const { onShared } = props;
  useEffect(() => {
    const handleURL = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);

      if (parsed.hostname === "share" && parsed.queryParams?.text) {
        const sharedText = decodeURIComponent(
          parsed.queryParams.text as string,
        );
        onShared({ data: sharedText, mimeType: "text/plain" });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleURL({ url });
      }
    });

    const subscription = Linking.addEventListener("url", handleURL);

    return () => {
      subscription.remove();
    };
  }, [onShared]);

  return null;
}
