import { NativeModules, NativeEventEmitter, Platform } from "react-native";

interface ShareData {
  data: string;
  mimeType: string;
}

interface ShareTargetModuleType {
  getInitialShare(): Promise<ShareData | null>;
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
}

const LINKING_ERROR =
  `The package 'ShareTargetModule' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- Run 'pod install'\n", default: "" }) +
  "- Rebuild the app after installing the native module\n";

const ShareTargetModuleNative: ShareTargetModuleType =
  NativeModules.ShareTargetModule
    ? NativeModules.ShareTargetModule
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        },
      );

export const ShareTargetModule = ShareTargetModuleNative;

export const ShareTargetEventEmitter = new NativeEventEmitter(
  NativeModules.ShareTargetModule,
);

export type { ShareData };
