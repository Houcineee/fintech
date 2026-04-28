import React from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { SimulationScreen } from "./src/screens/SimulationScreen";
import { colors } from "./src/theme/colors";
import { RootStackParamList } from "./src/types/navigation";
import { useAppFonts } from "./src/theme/typography";

// Override default Text to always use Cairo font
import { Text } from "./src/theme/typography";
(RNText as any).defaultProps = (RNText as any).defaultProps || {};
(RNText as any).defaultProps.style = { fontFamily: "Cairo_400Regular" };

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
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
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Simulation" component={SimulationScreen} />
        <Stack.Screen name="Results" component={ResultScreen} />
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
