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

type LinkPreviewCardProps = LinkPreviewData & {
  onPress?: (url: string) => void;
};

export function LinkPreviewCard({
  url,
  title,
  description,
  siteName,
  image,
  onPress,
}: LinkPreviewCardProps) {
  const hasImage = Boolean(image);
  const displaySiteName = siteName ?? getHostname(url);
  const displayUrl = getDisplayUrl(url);

  return (
    <Pressable
      style={[
        styles.previewCard,
        hasImage ? styles.previewCardWithImage : undefined,
      ]}
      className="bg-card text-card-foreground"
      onPress={() => onPress?.(url)}
      accessibilityRole="link"
    >
      {hasImage ? (
        <Image
          source={{ uri: image as string }}
          style={styles.previewImage}
          contentFit="cover"
        />
      ) : null}
      <View className="text-card-foreground flex-1">
        {displaySiteName ? (
          <Text
            style={styles.previewSite}
            className="text-card-foreground/80"
            numberOfLines={1}
          >
            {displaySiteName}
          </Text>
        ) : null}
        <Text
          style={styles.previewTitle}
          className="text-card-foreground"
          numberOfLines={2}
        >
          {title ?? displayUrl}
        </Text>
        {description ? (
          <Text
            style={styles.previewDescription}
            className="text-card-foreground/80"
            numberOfLines={3}
          >
            {description}
          </Text>
        ) : null}
        <Text style={styles.previewUrl} numberOfLines={1}>
          {displayUrl}
        </Text>
      </View>
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
  previewSite: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  previewDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  previewUrl: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 6,
  },
});
