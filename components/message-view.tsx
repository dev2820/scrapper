import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { isSameYear, isSameDay } from "date-fns";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { useMessages } from "@/hooks/message/use-messages";
import LinkifyIt from "linkify-it";
import { DateDivider } from "@/components/date-divider";
import { MessageMenu } from "@/components/message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";
import { Message } from "@/types/Message";
import {
  type LinkPreviewData,
  type LinkPreviewState,
} from "@/components/link-preview-card";
import { OpenGraphLoader } from "./open-graph-loader";

const linkify = new LinkifyIt();

export function MessageView() {
  const router = useRouter();
  const messages = useMessages();
  const [linkPreviews, setLinkPreviews] = useState<
    Record<string, LinkPreviewState>
  >({});
  const linkPreviewsRef = useRef(linkPreviews);
  const scrollViewRef = useRef<ScrollView>(null);
  const previousMessagesLengthRef = useRef(messages.length);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const deleteMessage = useDeleteMessage();

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

  const handleLongPressMessage = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setMenuOpen(true);
  }, []);

  const handleDeleteMessage = (id: Message["id"]) => {
    deleteMessage(id);
  };

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

  return (
    <View style={styles.messagesContainer}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.messagesContent]}
      >
        {messages.length === 0 ? (
          <EmptyFallback />
        ) : (
          messages.map((message, i) => {
            const prevMessage = messages[i - 1];

            const showDivider =
              prevMessage && !isSameDay(message.date, prevMessage.date);

            return (
              <View key={message.id}>
                {showDivider && (
                  <DateDivider label={formatDateLabel(message.date)} />
                )}
                <View style={styles.messageGroup}>
                  <Pressable
                    onLongPress={() => handleLongPressMessage(message.id)}
                    style={styles.messageBubble}
                  >
                    <Hyperlink onPress={handleClickLink}>
                      <Text style={styles.messageText}>{message.text}</Text>
                    </Hyperlink>
                  </Pressable>
                  {getFirstLinkFromMessage(message.text) && (
                    <OpenGraphLoader
                      url={getFirstLinkFromMessage(message.text)!}
                      fallback={null}
                    >
                      {(og) => <Text>{og.title}</Text>}
                    </OpenGraphLoader>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <MessageMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Pressable
          onPress={() => {
            if (selectedMessageId) {
              handleDeleteMessage(selectedMessageId);
            }
            setMenuOpen(false);
          }}
        >
          <Text>Delete</Text>
        </Pressable>
      </MessageMenu>
    </View>
  );
}

const formatDateLabel = (value: Date) => {
  const today = new Date();

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: isSameYear(value, today) ? undefined : "numeric",
  }).format(value);
};
const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
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
});
