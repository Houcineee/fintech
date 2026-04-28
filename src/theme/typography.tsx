import { useFonts } from "@expo-google-fonts/cairo";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";

export const FONTS = {
  light: "Cairo_200ExtraLight",
  regular: "Cairo_400Regular",
  medium: "Cairo_500Medium",
  semiBold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
  extraBold: "Cairo_800ExtraBold",
  black: "Cairo_900Black",
};

export function useAppFonts() {
  const [loaded] = useFonts({
    Cairo_200ExtraLight: require("@expo-google-fonts/cairo/200ExtraLight/Cairo_200ExtraLight.ttf"),
    Cairo_300Light: require("@expo-google-fonts/cairo/300Light/Cairo_300Light.ttf"),
    Cairo_400Regular: require("@expo-google-fonts/cairo/400Regular/Cairo_400Regular.ttf"),
    Cairo_500Medium: require("@expo-google-fonts/cairo/500Medium/Cairo_500Medium.ttf"),
    Cairo_600SemiBold: require("@expo-google-fonts/cairo/600SemiBold/Cairo_600SemiBold.ttf"),
    Cairo_700Bold: require("@expo-google-fonts/cairo/700Bold/Cairo_700Bold.ttf"),
    Cairo_800ExtraBold: require("@expo-google-fonts/cairo/800ExtraBold/Cairo_800ExtraBold.ttf"),
    Cairo_900Black: require("@expo-google-fonts/cairo/900Black/Cairo_900Black.ttf"),
  });
  return loaded;
}

// Weight mapping from fontWeight string to Cairo font name
const weightToFont: Record<string, string> = {
  "200": "Cairo_200ExtraLight",
  "300": "Cairo_300Light",
  "400": "Cairo_400Regular",
  "500": "Cairo_500Medium",
  "600": "Cairo_600SemiBold",
  "700": "Cairo_700Bold",
  "800": "Cairo_800ExtraBold",
  "900": "Cairo_900Black",
  normal: "Cairo_400Regular",
  bold: "Cairo_700Bold",
};

// Global Text that forces Cairo font
export const Text: React.FC<TextProps> = (props) => {
  const fontWeight =
    (props.style as TextStyle)?.fontWeight?.toString() || "400";
  const fontFamily = weightToFont[fontWeight] || "Cairo_400Regular";

  return <RNText {...props} style={[{ fontFamily }, props.style]} />;
};
