import React, { useEffect, useMemo } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";
import { useGameStore } from "../store/gameStore";
import { getMissionById as getStaticMissionById } from "../data";
import { formatMoney } from "../logic/format";
import { useChoiceSounds } from "../hooks/useChoiceSounds";

type Props = NativeStackScreenProps<RootStackParamList, "End">;

const StarRating = ({ count }: { count: number }) => (
  <View style={s.starsRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= count ? "star" : "star-outline"}
        size={28}
        color={i <= count ? colors.warning : colors.borderHighlight}
      />
    ))}
  </View>
);

export const EndScreen = ({ navigation }: Props) => {
  const result = useGameStore((s) => s.result);
  const game = useGameStore((s) => s.game);
  const customMissions = useGameStore((s) => s.customMissions);
  const clearSession = useGameStore((s) => s.clearSession);
  const totalXP = useGameStore((s) => s.totalXP);
  const { playClick } = useChoiceSounds();

  const mission = useMemo(() => {
    if (!game) return null;
    return getStaticMissionById(game.missionId) || customMissions.find(m => m.id === game.missionId);
  }, [game, customMissions]);

  useEffect(() => {
    if (!result || !game) {
      navigation.replace("Home");
    }
  }, [result, game, navigation]);

  if (!result || !game || !mission) return null;

  const stars = Math.max(1, Math.min(5, Math.round((game.trust + game.barakah) / 40)));

  const handleNextMission = () => {
    playClick();
    clearSession();
    navigation.replace("Home");
  };

  const handleRetry = () => {
    playClick();
    clearSession();
    navigation.replace("Home");
  };

  const handleHome = () => {
    playClick();
    clearSession();
    navigation.replace("Home");
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[s.banner, result.ending.isGood ? s.bannerSuccess : s.bannerWarning, shadows.clayLarge]}>
          <Ionicons
            name={result.ending.isGood ? "trophy" : "refresh"}
            size={40}
            color={result.ending.isGood ? colors.success : colors.warning}
          />
          <Text style={s.bannerTitle}>{result.ending.title}</Text>
          <Text style={s.bannerDescription}>{result.ending.description}</Text>
          <StarRating count={stars} />
        </View>

        <View style={[s.card, shadows.clay]}>
          <Text style={s.cardTitle}>النتائج</Text>
          <View style={s.statsGrid}>
            <View style={[s.statBox, shadows.clay]}>
              <Ionicons name="wallet" size={20} color={colors.warning} />
              <Text style={s.statLabel}>المال</Text>
              <Text style={[s.statValue, { color: game.money >= 0 ? colors.success : colors.danger }]}>
                {formatMoney(game.money)}
              </Text>
            </View>
            <View style={[s.statBox, shadows.clay]}>
              <Ionicons name="people" size={20} color={colors.success} />
              <Text style={s.statLabel}>الثقة</Text>
              <Text style={s.statValue}>{game.trust}</Text>
            </View>
            <View style={[s.statBox, shadows.clay]}>
              <Ionicons name="star" size={20} color={colors.barakah} />
              <Text style={s.statLabel}>البركة</Text>
              <Text style={s.statValue}>{game.barakah}</Text>
            </View>
          </View>
        </View>

        {result.goalsAchieved.length > 0 && (
          <View style={[s.card, shadows.clay]}>
            <Text style={s.cardTitle}>أهداف محققة</Text>
            {result.goalsAchieved.map((goal) => (
              <View key={goal.label} style={s.achievementRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={s.achievementText}>{goal.label}</Text>
              </View>
            ))}
          </View>
        )}

        {result.milestonesHit.length > 0 && mission && (
          <View style={[s.card, shadows.clay]}>
            <Text style={s.cardTitle}>إنجازات</Text>
            {result.milestonesHit.map((id) => {
              const milestone = mission.milestones.find((m) => m.id === id);
              return milestone ? (
                <View key={id} style={s.achievementRow}>
                  <Ionicons name="ribbon" size={20} color={colors.warning} />
                  <Text style={s.achievementText}>{milestone.label}</Text>
                  <Text style={s.xpBadge}>+{milestone.xp} XP</Text>
                </View>
              ) : null;
            })}
          </View>
        )}

        <View style={[s.card, shadows.clay]}>
          <Text style={s.cardTitle}>رحلة قراراتك</Text>
          {game.choiceLog.slice(-5).map((record, i) => (
            <View key={i} style={s.timelineRow}>
              <View style={s.timelineDot} />
              <View style={s.timelineContent}>
                {record.day != null && (
                  <Text style={s.timelineDay}>اليوم {record.day}</Text>
                )}
                <Text style={s.timelineChoice}>{record.choiceText}</Text>
                {record.dinarReaction && (
                  <Text style={s.timelineReaction} numberOfLines={1}>{record.dinarReaction}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[s.xpCard, shadows.clay]}>
          <Ionicons name="star" size={24} color={colors.warning} />
          <Text style={s.xpLabel}>مكافأة XP</Text>
          <Text style={s.xpValue}>+{result.xpEarned + game.xp}</Text>
        </View>

        <View style={s.spacer} />
      </ScrollView>

      <View style={s.buttonContainer}>
        {result.ending.isGood && game.missionId ? (
          <Pressable
            style={[s.button, s.buttonPrimary, shadows.clayPrimary]}
            onPress={handleNextMission}
          >
            <Text style={s.buttonTextPrimary}>المهمة التالية</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.surface} />
          </Pressable>
        ) : (
          <Pressable
            style={[s.button, s.buttonSecondary, shadows.clay]}
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color={colors.primary} />
            <Text style={s.buttonTextSecondary}>أعد المحاولة</Text>
          </Pressable>
        )}
        <Pressable style={s.homeButton} onPress={handleHome}>
          <Text style={s.homeButtonText}>العودة للخريطة</Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  banner: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 3,
  },
  bannerSuccess: {
    backgroundColor: colors.successLight,
    borderColor: colors.successDim,
  },
  bannerWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningDim,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  bannerDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  starsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  statBox: {
    alignItems: "center",
    gap: 4,
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  xpBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warning,
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDay: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  timelineChoice: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  timelineReaction: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  xpCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.warningDim,
  },
  xpLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  xpValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.warning,
  },
  spacer: {
    height: spacing.xl,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 3,
    borderTopColor: colors.border,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 3,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryDim,
  },
  buttonTextPrimary: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.surface,
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
  },
  homeButton: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});