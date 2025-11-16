import { Platform } from "react-native";

export const isIOS = () => {
  return Platform.OS === "ios";
};

export const isAOS = () => {
  return Platform.OS === "android";
};
