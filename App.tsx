import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MissionIntroScreen } from "./src/screens/MissionIntroScreen";
import { StoryScreen } from "./src/screens/StoryScreen";
import { EndScreen } from "./src/screens/EndScreen";
import { GenerateMissionScreen } from "./src/screens/GenerateMissionScreen";
import { AcademyScreen } from "./src/screens/AcademyScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { colors } from "./src/theme/colors";
import { useAppFonts } from "./src/theme/typography";
import { Text } from "./src/theme/typography";
import { RootStackParamList, MainTabParamList } from "./src/types/navigation";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Academy") {
            iconName = focused ? "school" : "school-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 3,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "Tajawal-Bold",
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={HomeScreen} 
        options={{ tabBarLabel: "الخريطة" }}
      />
      <Tab.Screen 
        name="Academy" 
        component={AcademyScreen} 
        options={{ tabBarLabel: "الأكاديمية" }}
      />
    </Tab.Navigator>
  );
}

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
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="GenerateMission" component={GenerateMissionScreen} />
        <Stack.Screen name="MissionIntro" component={MissionIntroScreen} />
        <Stack.Screen name="Story" component={StoryScreen} />
        <Stack.Screen name="End" component={EndScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
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