import { Fragment, type RefObject } from "react";
import { FlatList, View } from "react-native";
import { isSameDay } from "date-fns";
import { Text } from "@/components/ui/text";
import { useMessages } from "@/hooks/message/use-messages";
import { DateDivider } from "@/components/date-divider";
import { MessageBubble } from "@/components/message-bubble";
export function MessageView(props: { listRef: RefObject<FlatList | null> }) {
  const { listRef } = props;
  const messages = useMessages();

  if (messages.length === 0) {
    return <EmptyFallback />;
  }
  return (
    <FlatList
      ref={listRef}
      contentContainerClassName="flex-grow justify-end py-5 px-4"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      inverted={true}
      data={messages}
      renderItem={({ index }) => {
        const message = messages[index];
        const prevMessage = messages[index + 1];

        const showDivider = prevMessage
          ? !isSameDay(message.date, prevMessage.date)
          : true;

        return (
          <Fragment key={message.id}>
            <MessageBubble message={message} />
            {showDivider && <DateDivider date={message.date} />}
          </Fragment>
        );
      }}
      keyExtractor={(item) => item.id}
    />
  );
}

function EmptyFallback() {
  return (
    <View className="flex-1">
      <Text className="text-center text-slate-400 text-base mt-10">
        Start chatting by typing a message below.
      </Text>
    </View>
  );
}
