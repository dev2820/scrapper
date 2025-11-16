import { useEffect, useRef, Fragment } from "react";
import { ScrollView } from "react-native";
import { isSameDay } from "date-fns";
import { Text } from "@/components/ui/text";
import { useMessages } from "@/hooks/message/use-messages";
import { DateDivider } from "@/components/date-divider";
import { MessageBubble } from "@/components/message-bubble";

export function MessageView() {
  const messages = useMessages();
  const prevMessageCountRef = useRef<number>(messages.length);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 메세지 추가&삭제 시 하단이동
    const prevCount = prevMessageCountRef.current;
    if (prevCount !== messages.length) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    // 처음 로딩 시 맨 아래로
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    });
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerClassName="flex-1 justify-end py-5 px-4"
    >
      {messages.length === 0 ? (
        <EmptyFallback />
      ) : (
        messages.map((message, i) => {
          const prevMessage = messages[i - 1];

          const showDivider = prevMessage
            ? !isSameDay(message.date, prevMessage.date)
            : true;

          return (
            <Fragment key={i}>
              {showDivider && <DateDivider date={message.date} />}
              <MessageBubble message={message} />
            </Fragment>
          );
        })
      )}
    </ScrollView>
  );
}

function EmptyFallback() {
  return (
    <Text className="text-center text-slate-400 text-base">
      Start chatting by typing a message below.
    </Text>
  );
}
