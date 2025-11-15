import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { isSameYear } from "date-fns";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { Image } from "expo-image";
import { useMessages } from "@/hooks/message/use-messages";
import LinkifyIt from "linkify-it";
import { DateDivider } from "./DateDivider";

const linkify = new LinkifyIt();

type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
};

type LinkPreviewState =
  | { status: "loading"; url: string }
  | { status: "ready"; url: string; data: LinkPreviewData }
  | { status: "error"; url: string };

export function MessageView() {
  const router = useRouter();
  const messages = useMessages();
  const [linkPreviews, setLinkPreviews] = useState<
    Record<string, LinkPreviewState>
  >({});
  const linkPreviewsRef = useRef(linkPreviews);
  const scrollViewRef = useRef<ScrollView>(null);
  const previousMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    linkPreviewsRef.current = linkPreviews;
  }, [linkPreviews]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > previousMessagesLengthRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  const handleClickLink = useCallback(
    (url: string) => {
      router.push({
        pathname: "/webview",
        params: { url },
      });
    },
    [router],
  );

  const getFirstLinkFromMessage = useCallback((text: string) => {
    if (text === undefined) return null;

    const matches = linkify.match(text);
    if (!matches || matches.length === 0) {
      return null;
    }
    return matches[0].url;
  }, []);

  useEffect(() => {
    const pendingFetches: { id: string; url: string }[] = [];

    messages.forEach((message) => {
      const firstUrl = getFirstLinkFromMessage(message.text);
      if (!firstUrl) {
        return;
      }

      const existing = linkPreviewsRef.current[message.id];
      if (
        existing &&
        existing.url === firstUrl &&
        (existing.status === "loading" || existing.status === "ready")
      ) {
        return;
      }

      pendingFetches.push({ id: message.id, url: firstUrl });
    });

    if (pendingFetches.length === 0) {
      return;
    }

    setLinkPreviews((prev) => {
      const next = { ...prev };
      pendingFetches.forEach(({ id, url }) => {
        next[id] = { status: "loading", url };
      });
      return next;
    });

    let cancelled = false;

    pendingFetches.forEach(({ id, url }) => {
      fetchOpenGraphMetadata(url)
        .then((data) => {
          if (cancelled) {
            return;
          }

          setLinkPreviews((prev) => {
            const current = prev[id];
            if (!current || current.url !== url) {
              return prev;
            }

            return {
              ...prev,
              [id]: { status: "ready", url, data },
            };
          });
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          setLinkPreviews((prev) => {
            const current = prev[id];
            if (!current || current.url !== url) {
              return prev;
            }

            return {
              ...prev,
              [id]: { status: "error", url },
            };
          });
        });
    });

    return () => {
      cancelled = true;
    };
  }, [messages, getFirstLinkFromMessage]);

  let previousDateKey: string | null = null;

  return (
    <View style={styles.messagesContainer}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.messagesContent]}
      >
        {messages.length === 0 ? (
          <EmptyFallback />
        ) : (
          messages.map((message) => {
            const messageDate = toDate(message.date);
            const dateKey = getDateKey(messageDate);
            const showDivider = dateKey !== previousDateKey;
            if (showDivider) {
              previousDateKey = dateKey;
            }

            return (
              <View key={message.id}>
                {showDivider ? (
                  <DateDivider label={formatDateLabel(messageDate)} />
                ) : null}
                <View style={styles.messageGroup}>
                  <View style={styles.messageBubble}>
                    <Hyperlink onPress={handleClickLink}>
                      <Text style={styles.messageText}>{message.text}</Text>
                    </Hyperlink>
                  </View>
                  {(() => {
                    const firstUrl = getFirstLinkFromMessage(message.text);
                    if (!firstUrl) {
                      return null;
                    }

                    const preview = linkPreviews[message.id];
                    if (!preview) {
                      return null;
                    }

                    return (
                      <LinkPreviewCard
                        preview={preview}
                        targetUrl={firstUrl}
                        onOpen={handleClickLink}
                      />
                    );
                  })()}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

type LinkPreviewCardProps = {
  preview: LinkPreviewState;
  targetUrl: string;
  onOpen: (url: string) => void;
};

function LinkPreviewCard({ preview, targetUrl, onOpen }: LinkPreviewCardProps) {
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

const toDate = (value: Date | string) =>
  value instanceof Date ? value : new Date(value);

const getDateKey = (value: Date) => value.toISOString().slice(0, 10);

const formatDateLabel = (value: Date) => {
  const today = new Date();

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: isSameYear(value, today) ? undefined : "numeric",
  }).format(value);
};

const fetchOpenGraphMetadata = async (
  url: string,
): Promise<LinkPreviewData> => {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch preview for ${url}`);
  }

  const html = await response.text();
  const title =
    getMetaContent(html, "og:title") ??
    getMetaContent(html, "twitter:title") ??
    getTitleTag(html);
  const description =
    getMetaContent(html, "og:description") ??
    getMetaContent(html, "twitter:description") ??
    getMetaContent(html, "description");
  const siteName =
    getMetaContent(html, "og:site_name") ?? getHostname(url) ?? undefined;
  const imageUrl =
    resolveToAbsoluteUrl(
      getMetaContent(html, "og:image") ??
        getMetaContent(html, "og:image:secure_url") ??
        getMetaContent(html, "twitter:image"),
      url,
    ) ?? undefined;

  return {
    url,
    title: title ? decodeEntities(title) : undefined,
    description: description ? decodeEntities(description) : undefined,
    siteName: siteName ? decodeEntities(siteName) : undefined,
    image: imageUrl,
  };
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMetaContent = (html: string, key: string) => {
  const metaRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]*>`,
    "i",
  );
  const match = html.match(metaRegex);
  if (!match) {
    return undefined;
  }

  const contentMatch = match[0].match(/content=["']([^"']+)["']/i);
  return contentMatch ? contentMatch[1].trim() : undefined;
};

const getTitleTag = (html: string) => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : undefined;
};

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");

const resolveToAbsoluteUrl = (value: string | undefined, baseUrl: string) => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("data:")) {
    return value;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
};

function EmptyFallback() {
  return (
    <Text style={styles.placeholderText}>
      Start chatting by typing a message below.
    </Text>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  messagesEmpty: {
    justifyContent: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 16,
  },
  messageBubble: {
    backgroundColor: "#dddddd",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: "80%",
  },
  messageText: {
    color: "#111111",
    fontSize: 16,
  },
  messageGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginTop: 12,
    maxWidth: "80%",
  },
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
