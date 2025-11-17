import { Modal, Pressable } from "react-native";

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
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          className="bg-card text-card-foreground rounded-2xl p-5 min-w-[240px] max-w-[80%]"
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
