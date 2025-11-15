import { Modal, Pressable, StyleSheet } from "react-native";

type MessageMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
};

export function MessageMenu({
  open,
  onOpenChange,
  children,
}: MessageMenuProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable style={styles.overlay} onPress={() => onOpenChange(false)}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    minWidth: 200,
    maxWidth: "80%",
  },
});
