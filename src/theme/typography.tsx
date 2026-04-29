import { useFonts } from "expo-font";
import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";

export const FONTS = {
  light: "Tajawal_200ExtraLight",
  regular: "Tajawal_400Regular",
  medium: "Tajawal_500Medium",
  bold: "Tajawal_700Bold",
  extraBold: "Tajawal_800ExtraBold",
  black: "Tajawal_900Black",
};

export function useAppFonts() {
  const [loaded] = useFonts({
    Tajawal_200ExtraLight: require("@expo-google-fonts/tajawal/200ExtraLight/Tajawal_200ExtraLight.ttf"),
    Tajawal_300Light: require("@expo-google-fonts/tajawal/300Light/Tajawal_300Light.ttf"),
    Tajawal_400Regular: require("@expo-google-fonts/tajawal/400Regular/Tajawal_400Regular.ttf"),
    Tajawal_500Medium: require("@expo-google-fonts/tajawal/500Medium/Tajawal_500Medium.ttf"),
    Tajawal_700Bold: require("@expo-google-fonts/tajawal/700Bold/Tajawal_700Bold.ttf"),
    Tajawal_800ExtraBold: require("@expo-google-fonts/tajawal/800ExtraBold/Tajawal_800ExtraBold.ttf"),
    Tajawal_900Black: require("@expo-google-fonts/tajawal/900Black/Tajawal_900Black.ttf"),
  });
  return loaded;
}

// Weight mapping from fontWeight string to Tajawal font name
const weightToFont: Record<string, string> = {
  "200": "Tajawal_200ExtraLight",
  "300": "Tajawal_300Light",
  "400": "Tajawal_400Regular",
  "500": "Tajawal_500Medium",
  "600": "Tajawal_500Medium",
  "700": "Tajawal_700Bold",
  "800": "Tajawal_800ExtraBold",
  "900": "Tajawal_900Black",
  normal: "Tajawal_400Regular",
  bold: "Tajawal_700Bold",
};

// Global Text that forces Tajawal font
export const Text: React.FC<TextProps> = (props) => {
  const fontWeight =
    (props.style as TextStyle)?.fontWeight?.toString() || "400";
  const fontFamily = weightToFont[fontWeight] || "Tajawal_400Regular";

  return <RNText {...props} style={[{ fontFamily }, props.style]} />;
};