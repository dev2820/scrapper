import { SafeAreaView } from "react-native-safe-area-context";
import { MessageInput } from "@/components/message-input";
import { MessageView } from "@/components/message-view";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useRef } from "react";
import { FlatList } from "react-native";
// import { isIOS } from "@/utils/device";

export default function HomeScreen() {
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        // keyboardVerticalOffset={isIOS() ? 60 : 0}
      >
        <MessageView listRef={flatListRef} />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
