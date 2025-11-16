import { SafeAreaView } from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="h-full"
        behavior="translate-with-padding"
      >
        <MessageView />
        <MessageInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
