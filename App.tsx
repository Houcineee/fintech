import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MissionIntroScreen } from "./src/screens/MissionIntroScreen";
import { StoryScreen } from "./src/screens/StoryScreen";
import { EndScreen } from "./src/screens/EndScreen";
import { colors } from "./src/theme/colors";
import { useAppFonts } from "./src/theme/typography";
import { Text } from "./src/theme/typography";
import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Light theme for navigation
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.text,
    primary: colors.primary,
    notification: colors.primary,
  },
};

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>حدث خطأ أثناء تشغيل الواجهة</Text>
          <Text style={styles.errorText}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MissionIntro" component={MissionIntroScreen} />
        <Stack.Screen name="Story" component={StoryScreen} />
        <Stack.Screen name="End" component={EndScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    textAlign: "right",
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  errorText: {
    textAlign: "right",
    color: colors.danger,
    lineHeight: 22,
  },
});