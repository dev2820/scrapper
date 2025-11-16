import { useEffect, useRef, Fragment } from "react";
import { ScrollView } from "react-native";
import { isSameDay } from "date-fns";
import { Text } from "@/components/ui/text";
import { useMessages } from "@/hooks/message/use-messages";
import { DateDivider } from "@/components/date-divider";
import { MessageBubble } from "@/components/message-bubble";

export function MessageView() {
  const messages = useMessages();

  const scrollViewRef = useRef<ScrollView>(null);
  const previousMessagesLengthRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > previousMessagesLengthRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerClassName="flex-grow justify-end py-5 px-4"
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
