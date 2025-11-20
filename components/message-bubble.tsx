import { View, Pressable, Vibration } from "react-native";
import { Text } from "@/components/ui/text";
import { Hyperlink } from "@/components/ui/hyperlink";
import { OpenGraphLoader } from "./open-graph-loader";
import { LinkPreviewCard } from "./link-preview-card";
import type { Message } from "@/types/Message";
import LinkifyIt from "linkify-it";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState, useEffect } from "react";
import { MessageMenu } from "./message-menu";
import { useDeleteMessage } from "@/hooks/message/use-delete-message";
import { cn } from "@/lib/utils";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { ReplyIcon } from "lucide-react-native";
import { Icon } from "./ui/icon";

const linkify = new LinkifyIt();

const SWIPE_THRESHOLD = 30; // Threshold to trigger reply action
const RESISTANCE = 0.02; // Resistance strength (higher = more resistance)

type MessageBubbleProps = {
  message: Message;
  onReply?: (message: Message) => void;
  onReferenceClick?: (messageId: Message["id"]) => void;
  isHighlighted?: boolean;
};

export function MessageBubble({
  message,
  onReply,
  onReferenceClick,
  isHighlighted,
}: MessageBubbleProps) {
  const router = useRouter();
  const deleteMessage = useDeleteMessage();
  const [menuOpen, setMenuOpen] = useState(false);

  const translateX = useSharedValue(0);
  const bounceX = useSharedValue(0);
  const opacity = useDerivedValue(() =>
    Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1),
  );

  // Trigger bounce animation when isHighlighted changes
  useEffect(() => {
    if (isHighlighted) {
      bounceX.value = withSequence(
        withTiming(8, { duration: 80, easing: Easing.out(Easing.ease) }),
        withTiming(-8, { duration: 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(-6, { duration: 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 80, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 80, easing: Easing.in(Easing.ease) }),
      );
    }
  }, [isHighlighted, bounceX]);

  const link = useMemo(() => {
    const matches = linkify.match(message.text);
    if (!matches || matches.length === 0) {
      return null;
    }
    return matches[0].url;
  }, [message.text]);

  const handleClickLink = useCallback(
    (url: string) => {
      const secureUrl = url.startsWith("http://")
        ? url.replace("http://", "https://")
        : url;

      router.push({
        pathname: "/webview",
        params: { url: secureUrl },
      });
    },
    [router],
  );

  const handleLongPressMessage = useCallback(() => {
    Vibration.vibrate(50);
    setMenuOpen(true);
  }, []);

  // Callback for swipe reply action
  const triggerSwipeReply = useCallback(() => {
    Vibration.vibrate(25);
    if (onReply) {
      onReply(message);
    }
  }, [message, onReply]);

  // Pan gesture handler with spring-like resistance
  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5]) // Activate on small horizontal movement
    .failOffsetY([-20, 20]) // Cancel if vertical scroll is detected
    .onBegin((event) => {
      translateX.value = event.translationX;
    })
    .onUpdate((event) => {
      const raw = translateX.value + event.translationX;

      if (raw <= 0) {
        const resisted = raw / (1 + Math.abs(raw) * RESISTANCE);
        translateX.value = resisted;
      } else {
        translateX.value = 0;
      }
    })
    .onEnd((event) => {
      const shouldTriggerReply = Math.abs(translateX.value) >= SWIPE_THRESHOLD;

      if (shouldTriggerReply) {
        scheduleOnRN(triggerSwipeReply);
      }

      translateX.value = withTiming(0, {
        duration: 200,
      });
    });

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + bounceX.value }],
  }));
  const animatedReplyStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });

  return (
    <View key={message.id}>
      <GestureDetector gesture={panGesture}>
        <Animated.View className="relative flex-col items-end self-end mt-3 max-w-[80%]">
          <Animated.View
            style={animatedReplyStyle}
            className="absolute flex justify-center items-center top-1/2 -translate-y-1/2 right-0 mr-2 rounded-full bg-slate-200 p-2"
          >
            <Icon as={ReplyIcon} size={16} />
          </Animated.View>
          <Animated.View style={animatedBubbleStyle}>
            <Pressable
              onLongPress={handleLongPressMessage}
              className={cn(
                "bg-primary rounded-2xl rounded-br-none py-2.5 px-3.5 max-w-[80%]",
              )}
            >
              <Hyperlink onPress={handleClickLink}>
                <Text className="text-primary-foreground text-base">
                  {message.text}
                </Text>
              </Hyperlink>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      {link && (
        <View className="max-w-[80%] self-end items-end flex-col mt-3">
          <OpenGraphLoader url={link} fallback={null}>
            {(og) => <LinkPreviewCard {...og} onPress={handleClickLink} />}
          </OpenGraphLoader>
        </View>
      )}
      <MessageMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <Pressable
          onPress={() => {
            deleteMessage(message.id);
            setMenuOpen(false);
          }}
        >
          <Text>Delete</Text>
        </Pressable>
      </MessageMenu>
    </View>
  );
}
