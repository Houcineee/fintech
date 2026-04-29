import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";
import { useGameStore } from "../store/gameStore";
import { getMissionById } from "../data";
import { useChoiceSounds } from "../hooks/useChoiceSounds";

type Props = NativeStackScreenProps<RootStackParamList, "MissionIntro">;

export const MissionIntroScreen = ({ navigation }: Props) => {
  const game = useGameStore((s) => s.game);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { playClick } = useChoiceSounds();

  const mission = game ? getMissionById(game.missionId) : null;

  useEffect(() => {
    if (!game || !mission) {
      navigation.replace("Home");
      return;
    }
  }, [game, mission, navigation]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = () => {
    playClick();
    navigation.replace("Story");
  };

  if (!mission) return null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => { playClick(); navigation.replace("Home"); }} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Animated.View
        style={[
          s.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Mission Number */}
        <View style={s.numberBadge}>
          <Text style={s.numberText}>مهمة {mission.missionNumber}</Text>
        </View>

        {/* Dinar Greeting */}
        <View style={s.dinarContainer}>
          <View style={[s.dinarOrb, shadows.clayPrimary]}>
            <Ionicons name="happy-outline" size={40} color={colors.primary} />
          </View>
          <Text style={s.dinarGreeting}>مرحباً! أنا درهمي</Text>
        </View>

        {/* Mission Title */}
        <Text style={s.missionTitle}>{mission.title}</Text>
        <View style={s.divider} />

        {/* Situation / Role Story */}
        <View style={[s.section, shadows.clay]}>
          <Text style={s.sectionLabel}>الموقف</Text>
          <Text style={s.storyText}>{mission.roleStory}</Text>
        </View>

        {/* Goals */}
        <View style={[s.section, shadows.clay]}>
          <Text style={s.sectionLabel}>أهدافك</Text>
          {mission.goals.map((goal) => (
            <View key={goal.label} style={s.goalRow}>
              <Ionicons
                name={goal.type === "money" ? "wallet" : goal.type === "trust" ? "people" : goal.type === "barakah" ? "star" : "flag"}
                size={18}
                color={colors.warning}
              />
              <Text style={s.goalText}>{goal.label}</Text>
            </View>
          ))}
        </View>

        {/* Initial Stats Preview */}
        <View style={s.statsPreview}>
          <View style={[s.statPreviewItem, shadows.clay]}>
            <Ionicons name="wallet" size={16} color={colors.warning} />
            <Text style={s.statPreviewValue}>{mission.initialMoney} د.م</Text>
          </View>
          <View style={[s.statPreviewItem, shadows.clay]}>
            <Ionicons name="people" size={16} color={colors.success} />
            <Text style={s.statPreviewValue}>{mission.initialTrust} ثقة</Text>
          </View>
          <View style={[s.statPreviewItem, shadows.clay]}>
            <Ionicons name="star" size={16} color={colors.barakah} />
            <Text style={s.statPreviewValue}>{mission.initialBarakah} بركة</Text>
          </View>
        </View>
      </Animated.View>

      {/* Start Button */}
      <View style={s.buttonContainer}>
        <Pressable style={[s.startButton, shadows.clayPrimary]} onPress={handleStart}>
          <Text style={s.startButtonText}>ابدأ المهمة</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    paddingTop: spacing.lg,
  },
  numberBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryDim,
    marginBottom: spacing.lg,
  },
  numberText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  dinarContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  dinarOrb: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dinarGreeting: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  missionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  section: {
    width: "100%",
    marginBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
    textAlign: "right",
  },
  storyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 26,
    textAlign: "right",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  statsPreview: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statPreviewValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
});