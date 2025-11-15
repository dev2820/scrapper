import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Image } from "expo-image";

export type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
};

export type LinkPreviewState =
  | { status: "loading"; url: string }
  | { status: "ready"; url: string; data: LinkPreviewData }
  | { status: "error"; url: string };

type LinkPreviewCardProps = {
  preview: LinkPreviewState;
  targetUrl: string;
  onOpen: (url: string) => void;
};

export function LinkPreviewCard({
  preview,
  targetUrl,
  onOpen,
}: LinkPreviewCardProps) {
  if (preview.status === "ready") {
    const { data } = preview;
    const hasImage = Boolean(data.image);
    const siteName = data.siteName ?? getHostname(data.url);
    const displayUrl = getDisplayUrl(data.url);

    return (
      <Pressable
        style={[
          styles.previewCard,
          hasImage ? styles.previewCardWithImage : undefined,
        ]}
        onPress={() => onOpen(data.url)}
        accessibilityRole="link"
      >
        {hasImage ? (
          <Image
            source={{ uri: data.image as string }}
            style={styles.previewImage}
            contentFit="cover"
          />
        ) : null}
        <View style={styles.previewTextContent}>
          {siteName ? (
            <Text style={styles.previewSite} numberOfLines={1}>
              {siteName}
            </Text>
          ) : null}
          <Text style={styles.previewTitle} numberOfLines={2}>
            {data.title ?? displayUrl}
          </Text>
          {data.description ? (
            <Text style={styles.previewDescription} numberOfLines={3}>
              {data.description}
            </Text>
          ) : null}
          <Text style={styles.previewUrl} numberOfLines={1}>
            {displayUrl}
          </Text>
        </View>
      </Pressable>
    );
  }

  const message =
    preview.status === "loading" ? "Fetching preview…" : "Preview unavailable";

  return (
    <Pressable
      style={[styles.previewCard, styles.previewPlaceholder]}
      onPress={() => onOpen(targetUrl)}
      accessibilityRole="link"
    >
      <Text style={styles.previewStatusText}>{message}</Text>
    </Pressable>
  );
}

const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
};

const getDisplayUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    const path =
      parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return rawUrl;
  }
};

const styles = StyleSheet.create({
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  previewCardWithImage: {
    paddingRight: 12,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
  },
  previewTextContent: {
    flex: 1,
  },
  previewSite: {
    color: "#475569",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  previewDescription: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  previewUrl: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 6,
  },
  previewPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  previewStatusText: {
    fontSize: 13,
    color: "#475569",
  },
});
