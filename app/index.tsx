import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { isAOS, isIOS } from "@/utils/device";
import { getStatusBarHeight } from "react-native-status-bar-height";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={isIOS() ? "padding" : "height"}
        keyboardVerticalOffset={getStatusBarHeight(isAOS())}
      >
        <MessageView />
        <MessageInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
