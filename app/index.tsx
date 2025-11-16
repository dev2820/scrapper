import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { isIOS } from "@/utils/device";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={isIOS() ? "padding" : "height"}
        keyboardVerticalOffset={24}
      >
        <MessageView />
        <MessageInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
