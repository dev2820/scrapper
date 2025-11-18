import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useMemo } from "react";
import { isSameYear } from "date-fns";

export function DateDivider(props: { date: Date }) {
  const { date } = props;

  const dateLabel = useMemo(() => {
    const today = new Date();

    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      day: "numeric",
      year: isSameYear(date, today) ? undefined : "numeric",
    }).format(date);
  }, [date]);

  return (
    <View className="flex-row items-center mt-4 mb-1">
      <View className="flex-1 h-px bg-slate-200" />
      <Text className="mx-3 text-[13px] text-slate-500 uppercase tracking-wider">
        {dateLabel}
      </Text>
      <View className="flex-1 h-px bg-slate-200" />
    </View>
  );
}
