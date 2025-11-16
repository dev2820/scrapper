import { SafeAreaView } from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { KeyboardStickyView } from "react-native-keyboard-controller";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <MessageView />
      <KeyboardStickyView offset={{ closed: 0, opened: 8 }}>
        <MessageInput />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}
