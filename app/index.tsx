import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

export default function HomeScreen() {
  const safeInset = useSafeAreaInsets();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView className="flex-grow">
        <MessageView />
      </KeyboardAwareScrollView>
      <KeyboardStickyView
        offset={{ closed: 0, opened: safeInset.bottom }}
        className="bg-background"
      >
        <MessageInput />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}
