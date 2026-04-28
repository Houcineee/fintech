import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { scenarioData } from "../data";
import { useSimulationStore, getRankForXP, getNextRankXP, RANKS } from "../store/simulationStore";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../types/navigation";
import { Text } from "../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

// Mission Card Component
const MissionCard = ({
  mission,
  scenario,
  isSelected,
  onPress,
}: {
  mission: {
    id: string;
    number: number;
    title: string;
    status: "locked" | "current" | "completed";
  };
  scenario: (typeof scenarioData)[0];
  isSelected: boolean;
  onPress: () => void;
}) => {
  const getStatusIcon = () => {
    switch (mission.status) {
      case "completed":
        return <Ionicons name="checkmark" size={20} color={colors.success} />;
      case "current":
        return (
          <View style={styles.pulseDot}>
            <View style={styles.pulseInner} />
          </View>
        );
      case "locked":
        return <Ionicons name="lock-closed" size={18} color={colors.lockedText} />;
    }
  };

  const getDifficultyColor = () => {
    switch (scenario.difficulty) {
      case "سهل":
        return colors.success;
      case "متوسط":
        return colors.warning;
      case "متقدم":
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const isLocked = mission.status === "locked";

  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      style={({ pressed }) => [
        styles.missionCard,
        isSelected && !isLocked && styles.missionCardSelected,
        isLocked && styles.missionCardLocked,
        pressed && !isLocked && styles.missionCardPressed,
      ]}
    >
      {/* Status Orb */}
      <View style={styles.orbContainer}>{getStatusIcon()}</View>

      {/* Mission Info */}
      <View style={styles.missionInfo}>
        <View style={styles.missionHeader}>
          <Text style={[styles.missionNumber, isLocked && styles.textLocked]}>
            مهمة {mission.number}
          </Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() + "25" },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: isLocked ? colors.lockedText : getDifficultyColor() },
              ]}
            >
              {scenario.difficulty}
            </Text>
          </View>
        </View>

        <Text style={[styles.missionTitle, isLocked && styles.textLocked]}>
          {mission.title.replace("المهمة ", "")}
        </Text>

        <Text style={[styles.missionRole, isLocked && styles.textLocked]}>
          {scenario.roleTitle}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: mission.status === "completed" ? "100%" : "0%",
                  backgroundColor:
                    mission.status === "completed"
                      ? colors.success
                      : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {mission.status === "completed"
              ? "مكتملة"
              : mission.status === "current"
              ? "متاحة"
              : "مقفلة"}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      {!isLocked && (
        <Ionicons
          name="chevron-back"
          size={24}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
      )}
    </Pressable>
  );
};

export const HomeScreen = ({ navigation }: Props) => {
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const completedMissionIds = useSimulationStore(
    (state) => state.completedMissionIds
  );
  const isMissionUnlocked = useSimulationStore(
    (state) => state.isMissionUnlocked
  );
  const totalXP = useSimulationStore((state) => state.totalXP);

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null
  );

  // Create mission nodes
  const missions = useMemo(() => {
    return scenarioData.map((scenario) => {
      const isCompleted = completedMissionIds.includes(scenario.id);
      const isUnlocked = isMissionUnlocked(scenario.id);

      return {
        id: scenario.id,
        number: scenario.missionNumber,
        title: scenario.title,
        status: isCompleted
          ? ("completed" as const)
          : isUnlocked
          ? ("current" as const)
          : ("locked" as const),
        scenario,
      };
    });
  }, [completedMissionIds]);

  // Find first current mission if none selected
  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ||
    missions.find((m) => m.status === "current") ||
    missions[0];

  const canStart = selectedMission
    ? isMissionUnlocked(selectedMission.id)
    : false;

  const handleStart = () => {
    if (selectedMission && canStart) {
      startSimulation(selectedMission.id);
      navigation.navigate("Simulation");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>درهمي</Text>
            <View style={styles.logoDot} />
          </View>
          {/* Rank Badge */}
          <View style={styles.rankBadge}>
            <Ionicons name={getRankForXP(totalXP).icon} size={18} color={colors.primary} />
            <Text style={styles.rankName}>{getRankForXP(totalXP).name}</Text>
          </View>
        </View>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>أكاديمية التعليم المالي</Text>
          <Text style={styles.xpText}>{totalXP} XP</Text>
        </View>
        {/* XP Progress Bar */}
        {getNextRankXP(totalXP) !== null && (
          <View style={styles.xpBar}>
            <View style={styles.xpTrack}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${Math.min(
                      ((totalXP - getRankForXP(totalXP).minXP) /
                        ((getNextRankXP(totalXP) ?? 1000) - getRankForXP(totalXP).minXP)) *
                        100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpNext}>
              {getNextRankXP(totalXP)} XP للرتبة التالية
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Ring */}
        <View style={styles.progressRingContainer}>
          <View style={styles.progressRing}>
            <Text style={styles.progressNumber}>
              {completedMissionIds.length}
            </Text>
            <Text style={styles.progressLabel}>من {scenarioData.length}</Text>
          </View>
          <Text style={styles.progressRingLabel}>تقدمك</Text>
        </View>

        {/* Mission Cards */}
        <View style={styles.missionsContainer}>
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              scenario={mission.scenario}
              isSelected={selectedMission?.id === mission.id}
              onPress={() => setSelectedMissionId(mission.id)}
            />
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Start Button */}
      {selectedMission && (
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleStart}
            disabled={!canStart}
            style={({ pressed }) => [
              styles.startButton,
              !canStart && styles.startButtonDisabled,
              pressed && canStart && styles.startButtonPressed,
            ]}
          >
            <Text style={styles.startButtonText}>
              {canStart ? "ابدأ المهمة" : "أكمل المهمة السابقة"}
            </Text>
            {canStart && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.textInverse}
              />
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    ...shadows.glowCyan,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  rankName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  subtitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.warning,
  },
  xpBar: {
    marginTop: spacing.sm,
  },
  xpTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  xpNext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  container: {
    padding: spacing.lg,
  },
  progressRingContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.borderHighlight,
    justifyContent: "center",
    alignItems: "center",
    borderTopColor: colors.primary,
    transform: [{ rotate: "45deg" }],
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    transform: [{ rotate: "-45deg" }],
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    transform: [{ rotate: "-45deg" }],
  },
  progressRingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  missionsContainer: {
    gap: spacing.md,
  },
  missionCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.sm,
  },
  missionCardLocked: {
    opacity: 0.5,
    backgroundColor: colors.background,
  },
  missionCardPressed: {
    opacity: 0.8,
  },
  orbContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryDim,
    justifyContent: "center",
    alignItems: "center",
  },
  pulseInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    ...shadows.glowCyan,
  },
  missionInfo: {
    flex: 1,
  },
  missionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  missionNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  difficultyBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "700",
  },
  missionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  missionRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  textLocked: {
    color: colors.lockedText,
  },
  progressContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: "left",
  },
  bottomPadding: {
    height: 100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    ...shadows.glowCyan,
  },
  startButtonDisabled: {
    backgroundColor: colors.surfaceHighlight,
    shadowColor: "transparent",
  },
  startButtonPressed: {
    opacity: 0.9,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textInverse,
  },
});
