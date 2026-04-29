import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import { formatMoney } from "../logic/format";
import type { Goal, GoalProgress } from "../types/game";

type Props = {
  money: number;
  trust: number;
  barakah: number;
  day?: number;
  totalDays?: number;
  goals: GoalProgress[];
};

const StatItem = ({
  icon,
  value,
  maxValue,
  color,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  maxValue: number;
  color: string;
  label: string;
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  return (
    <View style={s.statItem}>
      <View style={[s.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={s.statContent}>
        <View style={s.statHeader}>
          <Text style={s.statLabel}>{label}</Text>
          <Text style={[s.statValue, { color }]}>{value}</Text>
        </View>
        <View style={s.statTrack}>
          <View style={[s.statFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

export const StateBar = ({ money, trust, barakah, goals }: Props) => {
  const activeGoals = goals.filter((g) => !g.achieved);

  return (
    <View style={s.container}>
      <View style={s.moneyRow}>
        <Ionicons name="wallet" size={18} color={colors.warning} />
        <Text style={s.moneyText}>{formatMoney(money)}</Text>
      </View>

      <StatItem icon="people" value={trust} maxValue={100} color={colors.primary} label="ثقة" />
      <StatItem icon="star" value={barakah} maxValue={100} color={colors.purple} label="بركة" />

      {activeGoals.length > 0 && (
        <View style={s.goalsContainer}>
          {activeGoals.map((g) => (
            <View key={g.goal.label} style={s.goalPill}>
              <Ionicons
                name={g.goal.type === "money" ? "wallet" : g.goal.type === "trust" ? "people" : g.goal.type === "barakah" ? "star" : "checkmark-circle"}
                size={12}
                color={colors.warning}
              />
              <Text style={s.goalText}>{g.goal.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  moneyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  moneyText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.warning,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
    gap: 4,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  statTrack: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  statFill: {
    height: "100%",
    borderRadius: 2,
  },
  goalsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  goalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});