import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";

export function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.dateDividerContainer}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{label}</Text>
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
