import React, { useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { missionData } from "../data";
import { useChoiceSounds } from "../hooks/useChoiceSounds";
import { useGameStore, getRankForXP, getNextRankXP } from "../store/gameStore";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList, MainTabParamList } from "../types/navigation";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Map">,
  NativeStackScreenProps<RootStackParamList>
>;

type MissionStatus = "locked" | "current" | "completed";

const MISSION_ICONS = ["bicycle", "storefront", "shield-checkmark", "lock-closed", "heart", "rocket"] as const;

const MissionNode = ({
  number,
  title,
  roleTitle,
  difficulty,
  status,
  isLast,
  onPress,
}: {
  number: number;
  title: string;
  roleTitle: string;
  difficulty: string;
  status: MissionStatus;
  isLast: boolean;
  onPress: () => void;
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy": return colors.success;
      case "medium": return colors.warning;
      case "hard": return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case "easy": return "سهل";
      case "medium": return "متوسط";
      case "hard": return "متقدم";
      default: return difficulty;
    }
  };

  const getNodeContent = () => {
    if (status === "completed") {
      return <Ionicons name="checkmark" size={24} color={colors.surface} />;
    }
    if (status === "locked") {
      return <Ionicons name="lock-closed" size={20} color={colors.lockedText} />;
    }
    return <Ionicons name={MISSION_ICONS[number - 1] || "star"} size={22} color={colors.surface} />;
  };

  const isLocked = status === "locked";
  const isCurrent = status === "current";

  return (
    <Pressable onPress={onPress} disabled={isLocked} style={s.missionRow}>
      {/* Path line + Node */}
      <View style={s.pathColumn}>
        {/* Connection line above (except first) */}
        <View style={[
          s.pathLine,
          number > 1 && (status === "completed" || status === "current") && s.pathLineCompleted,
          number > 1 && status === "locked" && s.pathLineLocked,
        ]} />
        
        {/* The node */}
        <Animated.View style={[
          s.node,
          status === "completed" && [s.nodeCompleted, shadows.claySuccess],
          isCurrent && [s.nodeCurrent, shadows.clayPrimary],
          isLocked && s.nodeLocked,
          isCurrent && s.nodePulse,
        ]}>
          {getNodeContent()}
        </Animated.View>

        {/* Connection line below (except last) */}
        {!isLast && (
          <View style={[
            s.pathLine,
            status === "completed" && s.pathLineCompleted,
            (status === "current" || status === "locked") && s.pathLineLocked,
          ]} />
        )}
      </View>

      {/* Mission details card */}
      <View style={[
        s.missionCard,
        isCurrent && [s.missionCardCurrent, shadows.clay],
        status === "completed" && s.missionCardCompleted,
        isLocked && s.missionCardLocked,
      ]}>
        <View style={s.missionHeader}>
          <Text style={[s.missionNumber, isLocked && s.textMuted]}>
            مهمة {number}
          </Text>
          <View style={[s.difficultyBadge, { backgroundColor: getDifficultyColor() + "20" }]}>
            <Text style={[s.difficultyText, { color: isLocked ? colors.lockedText : getDifficultyColor() }]}>
              {getDifficultyLabel()}
            </Text>
          </View>
        </View>

        <Text style={[s.missionTitle, isLocked && s.textMuted]}>
          {title}
        </Text>
        
        <Text style={[s.missionRole, isLocked && s.textMuted]}>
          {roleTitle}
        </Text>

        {isCurrent && (
          <View style={s.currentBadge}>
            <View style={s.currentDot} />
            <Text style={s.currentText}>متاحة الآن!</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export const HomeScreen = ({ navigation }: Props) => {
  const startMission = useGameStore((s) => s.startMission);
  const completedMissionIds = useGameStore((s) => s.completedMissionIds);
  const customMissions = useGameStore((s) => s.customMissions);
  const isMissionUnlockedFn = useGameStore((s) => s.isMissionUnlocked);
  const totalXP = useGameStore((s) => s.totalXP);
  const { playClick } = useChoiceSounds();

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

  const customMissionsData = useMemo(() => {
    return customMissions.map((mission) => ({
      id: mission.id,
      title: mission.title,
      roleTitle: mission.roleTitle,
      difficulty: mission.difficulty,
      isCompleted: completedMissionIds.includes(mission.id),
    }));
  }, [customMissions, completedMissionIds]);

  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ||
    customMissionsData.find((m) => m.id === selectedMissionId) ||
    missions.find((m) => m.status === "current") ||
    missions[0];

  const canStart = selectedMission
    ? isMissionUnlockedFn(selectedMission.id)
    : false;

  const handleStart = () => {
    if (selectedMission && canStart) {
      playClick();
      startMission(selectedMission.id);
      navigation.navigate("MissionIntro");
    }
  };

  const rank = getRankForXP(totalXP);
  const nextRankXP = getNextRankXP(totalXP);
  const progressPercent = nextRankXP
    ? Math.min(100, ((totalXP - rank.minXP) / (nextRankXP - rank.minXP)) * 100)
    : 100;

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoContainer}>
            <View style={s.logoIcon}>
              <Ionicons name="wallet" size={20} color={colors.surface} />
            </View>
            <Text style={s.logo}>درهمي</Text>
          </View>
          
          <View style={s.rankBadge}>
            <Ionicons name={rank.icon as any} size={16} color={colors.primary} />
            <Text style={s.rankName}>{rank.name}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={s.xpContainer}>
          <View style={s.xpHeader}>
            <Text style={s.xpLabel}>{totalXP} XP</Text>
            {nextRankXP && <Text style={s.xpNext}>{nextRankXP} للترقية</Text>}
          </View>
          <View style={s.xpTrack}>
            <View style={[s.xpFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>

      {/* Roadmap */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Mission Banner */}
        <Pressable 
          onPress={() => {
            playClick();
            navigation.navigate("GenerateMission");
          }}
          style={({ pressed }) => [
            s.customBanner,
            pressed && s.customBannerPressed
          ]}
        >
          <View style={s.customIcon}>
            <Ionicons name="sparkles" size={24} color={colors.surface} />
          </View>
          <View style={s.customTextContainer}>
            <Text style={s.customTitle}>اصنع مهمتك الخاصة!</Text>
            <Text style={s.customSubtitle}>استخدم الذكاء الاصطناعي لإنشاء مغامرة جديدة</Text>
          </View>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>

        <Text style={s.sectionTitle}>رحلتك التعليمية</Text>

        <View style={s.roadmap}>
          {missions.map((mission, index) => (
            <MissionNode
              key={mission.id}
              number={mission.number}
              title={mission.title}
              roleTitle={mission.roleTitle}
              difficulty={mission.difficulty}
              status={mission.status}
              isLast={index === missions.length - 1}
              onPress={() => { playClick(); setSelectedMissionId(mission.id); }}
            />
          ))}
        </View>

        {customMissionsData.length > 0 && (
          <View style={s.customSection}>
            <Text style={s.sectionTitle}>مهماتك الخاصة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.customScroll}>
              {customMissionsData.map((mission) => (
                <Pressable
                  key={mission.id}
                  onPress={() => { playClick(); setSelectedMissionId(mission.id); }}
                  style={[
                    s.customCard,
                    selectedMissionId === mission.id && s.customCardSelected,
                    mission.isCompleted && s.customCardCompleted,
                  ]}
                >
                  <View style={s.customCardHeader}>
                    {mission.isCompleted ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    ) : (
                      <Ionicons name="flask" size={20} color={colors.primary} />
                    )}
                    <Text style={s.customCardDiff}>
                      {mission.difficulty === "easy" ? "سهل" : mission.difficulty === "medium" ? "متوسط" : "متقدم"}
                    </Text>
                  </View>
                  <Text style={s.customCardTitle} numberOfLines={1}>{mission.title}</Text>
                  <Text style={s.customCardRole} numberOfLines={1}>{mission.roleTitle}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.bottomPadding} />
      </ScrollView>

      {/* Start Button */}
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
              <Ionicons name="arrow-forward" size={20} color={colors.surface} />
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
    backgroundColor: colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    ...shadows.clay,
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.clayPrimary,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
  },
  rankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primaryDim,
  },
  rankName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  xpContainer: {
    gap: spacing.xs,
  },
  xpHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  xpNext: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  xpTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  customBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.clay,
  },
  customBannerPressed: {
    ...shadows.clayPressed,
    transform: [{ scale: 0.98 }],
  },
  customIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.clayPrimary,
  },
  customTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  customTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
  customSubtitle: {
    fontSize: 12,
    color: colors.primaryDim,
    fontWeight: "700",
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "right",
  },
  roadmap: {
    gap: 0,
  },
  customSection: {
    marginTop: spacing.xl,
  },
  customScroll: {
    paddingBottom: spacing.md,
    gap: spacing.md,
    paddingLeft: spacing.lg,
  },
  customCard: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.clay,
  },
  customCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  customCardCompleted: {
    borderColor: colors.success + "40",
  },
  customCardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  customCardDiff: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textSecondary,
    backgroundColor: colors.border + "40",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  customCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    textAlign: "right",
  },
  customCardRole: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  pathColumn: {
    width: 56,
    alignItems: "center",
  },
  pathLine: {
    width: 3,
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.border,
  },
  pathLineCompleted: {
    backgroundColor: colors.success,
  },
  pathLineLocked: {
    backgroundColor: colors.border,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  node: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  nodeCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  nodeLocked: {
    backgroundColor: colors.locked,
    borderColor: colors.borderHighlight,
  },
  nodePulse: {
    // Pulsing animation handled by Animated
  },
  missionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.clay,
  },
  missionCardCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  missionCardCompleted: {
    borderColor: colors.success + "40",
    backgroundColor: colors.successLight,
    opacity: 0.9,
  },
  missionCardLocked: {
    borderColor: colors.border,
    backgroundColor: colors.locked,
    ...shadows.clayPressed,
  },
  missionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  missionNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "800",
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  missionRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  textMuted: {
    color: colors.lockedText,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  currentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
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
    borderTopWidth: 2,
    borderTopColor: colors.border,
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
    ...shadows.clayPrimary,
  },
  startButtonDisabled: {
    backgroundColor: colors.locked,
    borderColor: colors.border,
    shadowColor: "transparent",
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    ...shadows.clayPressed,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
});