/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { THEME } from "@/lib/theme";
import { ColorSchemeName } from "react-native";

export function useThemeColor(
  colorScheme: ColorSchemeName,
  colorName: keyof typeof THEME.light & keyof typeof THEME.dark,
) {
  return THEME[colorScheme ?? "light"][colorName];
}
