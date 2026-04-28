import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ChoiceButton } from "../components/ChoiceButton";
import { StarRating } from "../components/Gamification";
import { getScenarioById } from "../logic/simulation";
import { formatCurrency } from "../logic/format";
import { useSimulationStore } from "../store/simulationStore";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Results">;

// Glass card
const GlassCard = ({
  children,
  accentColor,
}: {
  children: React.ReactNode;
  accentColor?: string;
}) => (
  <View
    style={[
      styles.glassCard,
      accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
    ]}
  >
    {children}
  </View>
);

// Result header with gradient banner
const ResultHeader = ({
  succeeded,
  starRating,
}: {
  succeeded: boolean;
  starRating: number;
}) => {
  const bannerColor = succeeded
    ? [colors.success, colors.primary]
    : [colors.warning, colors.danger];

  return (
    <View style={styles.headerContainer}>
      {/* Gradient Banner */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: succeeded ? colors.successDim : colors.warningDim,
            borderColor: succeeded ? colors.success : colors.warning,
          },
        ]}
      >
        <View
          style={[
            styles.resultIcon,
            {
              backgroundColor: succeeded ? colors.success : colors.warning,
            },
            succeeded ? shadows.glowGreen : shadows.glowAmber,
          ]}
        >
          <Ionicons
            name={succeeded ? "trophy" : "refresh"}
            size={32}
            color={colors.textInverse}
          />
        </View>
        <Text style={styles.resultTitle}>
          {succeeded ? "أحسنت!" : "حاول مرة أخرى"}
        </Text>
        <Text style={styles.resultSubtitle}>
          {succeeded ? "أنجزت المهمة بنجاح" : "التعلم يأتي بالتجربة"}
        </Text>
      </View>

      {/* Stars */}
      <View style={styles.starsContainer}>
        <StarRating rating={starRating} />
      </View>
    </View>
  );
};

// Performance metrics grid
const PerformanceCard = ({
  finalBalance,
  savingsGoal,
  healthScore,
}: {
  finalBalance: number;
  savingsGoal: number;
  healthScore: number;
}) => {
  const reachedGoal = finalBalance >= savingsGoal;
  const percentOfGoal = Math.round((finalBalance / savingsGoal) * 100);

  return (
    <GlassCard>
      <Text style={styles.cardTitle}>الأداء</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricValue,
              { color: reachedGoal ? colors.success : colors.warning },
            ]}
          >
            {formatCurrency(finalBalance)}
          </Text>
          <Text style={styles.metricLabel}>الرصيد النهائي</Text>
          <Text style={styles.metricSub}>
            {reachedGoal
              ? "وصلت للهدف"
              : `وصلت ${percentOfGoal}% من الهدف`}
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text
            style={[
              styles.metricValue,
              {
                color:
                  healthScore >= 80
                    ? colors.success
                    : healthScore >= 50
                    ? colors.warning
                    : colors.danger,
              },
            ]}
          >
            {healthScore}
          </Text>
          <Text style={styles.metricLabel}>الصحة المالية</Text>
          <Text style={styles.metricSub}>من 100</Text>
        </View>
      </View>
    </GlassCard>
  );
};

// Spending breakdown
const BreakdownCard = ({
  needs,
  wants,
  giving,
}: {
  needs: number;
  wants: number;
  giving: number;
}) => {
  const total = needs + wants + giving || 1;
  const needsPct = (needs / total) * 100;
  const wantsPct = (wants / total) * 100;
  const givingPct = (giving / total) * 100;

  return (
    <GlassCard>
      <Text style={styles.cardTitle}>توزيع المصاريف</Text>

      <View style={styles.breakdownBar}>
        {needs > 0 && (
          <View
            style={[
              styles.breakdownSegment,
              {
                width: `${needsPct}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        )}
        {wants > 0 && (
          <View
            style={[
              styles.breakdownSegment,
              {
                width: `${wantsPct}%`,
                backgroundColor: colors.warning,
              },
            ]}
          />
        )}
        {giving > 0 && (
          <View
            style={[
              styles.breakdownSegment,
              {
                width: `${givingPct}%`,
                backgroundColor: colors.success,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.breakdownLegend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.primary }]}
          />
          <Text style={styles.legendText}>
            احتياجات: {formatCurrency(needs)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.warning }]}
          />
          <Text style={styles.legendText}>
            كماليات: {formatCurrency(wants)}
          </Text>
        </View>
        {giving > 0 && (
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.success }]}
            />
            <Text style={styles.legendText}>
              عطاء: {formatCurrency(giving)}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
};

// Choice history timeline
const HistoryCard = ({
  choices,
}: {
  choices: Array<{
    day: number;
    eventTitle: string;
    choiceLabel: string;
    amount: number;
  }>;
}) => (
  <GlassCard accentColor={colors.primary}>
    <Text style={styles.cardTitle}>رحلة القرارات</Text>

    {choices.map((choice, index) => (
      <View key={index} style={styles.historyItem}>
        <View style={styles.historyDot} />
        {index < choices.length - 1 && <View style={styles.historyLine} />}
        <View style={styles.historyContent}>
          <Text style={styles.historyDay}>يوم {choice.day}</Text>
          <Text style={styles.historyEvent}>{choice.eventTitle}</Text>
          <View style={styles.historyChoiceRow}>
            <Text style={styles.historyChoice}>{choice.choiceLabel}</Text>
            <Text
              style={[
                styles.historyAmount,
                choice.amount >= 0
                  ? styles.amountPositive
                  : styles.amountNegative,
              ]}
            >
              {choice.amount >= 0 ? "+" : ""}
              {formatCurrency(choice.amount)}
            </Text>
          </View>
        </View>
      </View>
    ))}
  </GlassCard>
);

// Advice card
const AdviceCard = ({
  wins,
  risks,
  insight,
}: {
  wins: string[];
  risks: string[];
  insight: string;
}) => (
  <GlassCard accentColor={colors.success}>
    <Text style={styles.cardTitle}>ما تعلمته</Text>

    {wins.length > 0 && (
      <View style={styles.adviceSection}>
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIcon,
              { backgroundColor: colors.successDim },
            ]}
          >
            <Ionicons name="checkmark" size={16} color={colors.success} />
          </View>
          <Text style={styles.sectionTitle}>نقاط القوة</Text>
        </View>
        {wins.map((win, i) => (
          <Text key={i} style={styles.adviceItem}>
            {win}
          </Text>
        ))}
      </View>
    )}

    {risks.length > 0 && (
      <View style={styles.adviceSection}>
        <View style={styles.sectionHeader}>
          <View
            style={[styles.sectionIcon, { backgroundColor: colors.warningDim }]}
          >
            <Ionicons name="trending-up" size={16} color={colors.warning} />
          </View>
          <Text style={styles.sectionTitle}>للتحسين</Text>
        </View>
        {risks.map((risk, i) => (
          <Text key={i} style={styles.adviceItem}>
            {risk}
          </Text>
        ))}
      </View>
    )}

    <View style={styles.insightBox}>
      <Ionicons name="bulb" size={20} color={colors.primary} />
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  </GlassCard>
);

export const ResultScreen = ({ navigation }: Props) => {
  const result = useSimulationStore((state) => state.result);
  const simulation = useSimulationStore((state) => state.simulation);
  const clearSession = useSimulationStore((state) => state.clearSession);
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const getNextMissionId = useSimulationStore((state) => state.getNextMissionId);

  if (!result || !simulation) {
    navigation.replace("Home");
    return null;
  }

  const scenario = getScenarioById(simulation.scenarioId);
  const nextMissionId = getNextMissionId(simulation.scenarioId);
  const nextScenario = nextMissionId ? getScenarioById(nextMissionId) : null;

  const handleNext = () => {
    if (nextScenario) {
      clearSession();
      startSimulation(nextScenario.id);
      navigation.replace("Simulation");
    }
  };

  const handleRetry = () => {
    clearSession();
    startSimulation(simulation.scenarioId);
    navigation.replace("Simulation");
  };

  const handleBackToMap = () => {
    clearSession();
    navigation.replace("Home");
  };

  const choiceHistory = simulation.choiceHistory.map((choice) => ({
    day: choice.day,
    eventTitle: choice.eventTitle,
    choiceLabel: choice.choiceLabel,
    amount: choice.amount,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ResultHeader
          succeeded={result.succeeded}
          starRating={result.starRating}
        />

        <PerformanceCard
          finalBalance={result.finalBalance}
          savingsGoal={result.savingsGoal}
          healthScore={result.healthScore}
        />

        <BreakdownCard
          needs={result.breakdown.needs}
          wants={result.breakdown.wants}
          giving={result.breakdown.giving}
        />

        {choiceHistory.length > 0 && (
          <HistoryCard choices={choiceHistory} />
        )}

        <AdviceCard
          wins={result.wins}
          risks={result.risks}
          insight={result.insight}
        />

        {/* Action buttons */}
        <View style={styles.actions}>
          {result.succeeded && nextScenario ? (
            <ChoiceButton
              label="المهمة التالية"
              subtitle={nextScenario.title}
              onPress={handleNext}
            />
          ) : !result.succeeded ? (
            <ChoiceButton label="أعد المحاولة" onPress={handleRetry} />
          ) : null}

          <ChoiceButton
            label="العودة للخريطة"
            variant="secondary"
            onPress={handleBackToMap}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
  },
  glassCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Header
  headerContainer: {
    marginBottom: spacing.lg,
  },
  banner: {
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  resultIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  starsContainer: {
    alignItems: "center",
  },
  // Card titles
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    textAlign: "right",
    marginBottom: spacing.md,
  },
  // Performance
  metricsGrid: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  metricLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  metricSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  // Breakdown
  breakdownBar: {
    height: 16,
    flexDirection: "row-reverse",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  breakdownSegment: {
    height: "100%",
  },
  breakdownLegend: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  // History
  historyItem: {
    flexDirection: "row-reverse",
    position: "relative",
    marginBottom: spacing.md,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginLeft: spacing.md,
    marginTop: 4,
    ...shadows.glowCyan,
  },
  historyLine: {
    position: "absolute",
    right: 5,
    top: 20,
    width: 2,
    height: "100%",
    backgroundColor: colors.borderHighlight,
  },
  historyContent: {
    flex: 1,
  },
  historyDay: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  historyEvent: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  historyChoiceRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyChoice: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.danger,
  },
  // Advice
  adviceSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  adviceItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: "right",
    paddingRight: spacing.md,
    marginBottom: spacing.xs,
  },
  insightBox: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    textAlign: "right",
  },
  // Actions
  actions: {
    marginTop: spacing.md,
  },
  bottomPadding: {
    height: 30,
  },
});
