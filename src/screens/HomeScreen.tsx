import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { missionData, getMissionById } from "../data";
import { useGameStore, getRankForXP, getNextRankXP } from "../store/gameStore";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type MissionStatus = "locked" | "current" | "completed";

const MissionCard = ({
  missionId,
  number,
  title,
  roleTitle,
  difficulty,
  status,
  isSelected,
  onPress,
}: {
  missionId: string;
  number: number;
  title: string;
  roleTitle: string;
  difficulty: string;
  status: MissionStatus;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return colors.success;
      case "medium":
        return colors.warning;
      case "hard":
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case "easy":
        return "سهل";
      case "medium":
        return "متوسط";
      case "hard":
        return "متقدم";
      default:
        return difficulty;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <Ionicons name="checkmark" size={20} color={colors.success} />;
      case "current":
        return (
          <View style={s.pulseDot}>
            <View style={s.pulseInner} />
          </View>
        );
      case "locked":
        return <Ionicons name="lock-closed" size={18} color={colors.lockedText} />;
    }
  };

  const isLocked = status === "locked";

  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      style={({ pressed }) => [
        s.missionCard,
        isSelected && !isLocked && s.missionCardSelected,
        isLocked && s.missionCardLocked,
        pressed && !isLocked && s.missionCardPressed,
      ]}
    >
      <View style={s.orbContainer}>{getStatusIcon()}</View>

      <View style={s.missionInfo}>
        <View style={s.missionHeader}>
          <Text style={[s.missionNumber, isLocked && s.textLocked]}>
            مهمة {number}
          </Text>
          <View
            style={[
              s.difficultyBadge,
              { backgroundColor: getDifficultyColor() + "25" },
            ]}
          >
            <Text
              style={[
                s.difficultyText,
                { color: isLocked ? colors.lockedText : getDifficultyColor() },
              ]}
            >
              {getDifficultyLabel()}
            </Text>
          </View>
        </View>

        <Text style={[s.missionTitle, isLocked && s.textLocked]}>
          {title}
        </Text>

        <Text style={[s.missionRole, isLocked && s.textLocked]}>
          {roleTitle}
        </Text>

        <View style={s.progressContainer}>
          <View style={s.progressTrack}>
            <View
              style={[
                s.progressFill,
                {
                  width: status === "completed" ? "100%" : "0%",
                  backgroundColor:
                    status === "completed" ? colors.success : colors.primary,
                },
              ]}
            />
          </View>
          <Text style={s.progressText}>
            {status === "completed"
              ? "مكتملة"
              : status === "current"
                ? "متاحة"
                : "مقفلة"}
          </Text>
        </View>
      </View>

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
  const startMission = useGameStore((s) => s.startMission);
  const completedMissionIds = useGameStore((s) => s.completedMissionIds);
  const isMissionUnlockedFn = useGameStore((s) => s.isMissionUnlocked);
  const totalXP = useGameStore((s) => s.totalXP);

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const missions = useMemo(() => {
    return missionData.map((mission) => {
      const isCompleted = completedMissionIds.includes(mission.id);
      const isUnlocked = isMissionUnlockedFn(mission.id);
      return {
        id: mission.id,
        number: mission.missionNumber,
        title: mission.title,
        roleTitle: mission.roleTitle,
        difficulty: mission.difficulty,
        status: isCompleted
          ? ("completed" as MissionStatus)
          : isUnlocked
            ? ("current" as MissionStatus)
            : ("locked" as MissionStatus),
      };
    });
  }, [completedMissionIds, isMissionUnlockedFn]);

  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ||
    missions.find((m) => m.status === "current") ||
    missions[0];

  const canStart = selectedMission
    ? isMissionUnlockedFn(selectedMission.id)
    : false;

  const handleStart = () => {
    if (selectedMission && canStart) {
      startMission(selectedMission.id);
      navigation.navigate("MissionIntro");
    }
  };

  const rank = getRankForXP(totalXP);
  const nextRankXP = getNextRankXP(totalXP);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoContainer}>
            <Text style={s.logo}>درهمي</Text>
            <View style={s.logoDot} />
          </View>
          <View style={s.rankBadge}>
            <Ionicons name={rank.icon as any} size={18} color={colors.primary} />
            <Text style={s.rankName}>{rank.name}</Text>
          </View>
        </View>
        <View style={s.subtitleRow}>
          <Text style={s.subtitle}>أكاديمية التعليم المالي</Text>
          <Text style={s.xpText}>{totalXP} XP</Text>
        </View>
        {nextRankXP !== null && (
          <View style={s.xpBar}>
            <View style={s.xpTrack}>
              <View
                style={[
                  s.xpFill,
                  {
                    width: `${Math.min(
                      ((totalXP - rank.minXP) / (nextRankXP - rank.minXP)) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={s.xpNext}>{nextRankXP} XP للرتبة التالية</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.progressRingContainer}>
          <View style={s.progressRing}>
            <Text style={s.progressNumber}>
              {completedMissionIds.length}
            </Text>
            <Text style={s.progressLabel}>من {missionData.length}</Text>
          </View>
          <Text style={s.progressRingLabel}>تقدمك</Text>
        </View>

        <View style={s.missionsContainer}>
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              missionId={mission.id}
              number={mission.number}
              title={mission.title}
              roleTitle={mission.roleTitle}
              difficulty={mission.difficulty}
              status={mission.status}
              isSelected={selectedMission?.id === mission.id}
              onPress={() => setSelectedMissionId(mission.id)}
            />
          ))}
        </View>

        <View style={s.bottomPadding} />
      </ScrollView>

      {selectedMission && (
        <View style={s.buttonContainer}>
          <Pressable
            onPress={handleStart}
            disabled={!canStart}
            style={({ pressed }) => [
              s.startButton,
              !canStart && s.startButtonDisabled,
              pressed && canStart && s.startButtonPressed,
            ]}
          >
            <Text style={s.startButtonText}>
              {canStart ? "ابدأ المهمة" : "أكمل المهمة السابقة"}
            </Text>
            {canStart && (
              <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
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