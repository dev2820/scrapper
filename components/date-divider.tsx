import { View, StyleSheet } from "react-native";
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
    <View style={styles.dateDividerContainer}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{dateLabel}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  dateDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dateDividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
