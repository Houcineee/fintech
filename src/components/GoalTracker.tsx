import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import type { GoalProgress } from "../types/game";

type Props = {
  goals: GoalProgress[];
};

export const GoalTracker = ({ goals }: Props) => {
  const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "money":
        return "cash";
      case "trust":
        return "people";
      case "barakah":
        return "star";
      case "hasItem":
        return "gift";
      case "flag":
        return "flag";
      default:
        return "checkmark-circle";
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>الأهداف</Text>
      {goals.map((g) => {
        const icon = getIcon(g.goal.type);
        return (
          <View key={g.goal.label} style={s.goalRow}>
            <Ionicons
              name={g.achieved ? "checkmark-circle" : icon}
              size={20}
              color={g.achieved ? colors.success : colors.textSecondary}
            />
            <View style={s.goalContent}>
              <Text
                style={[
                  s.goalLabel,
                  g.achieved && s.goalLabelAchieved,
                ]}
              >
                {g.goal.label}
              </Text>
              {g.goal.type === "money" && typeof g.current === "number" && (
                <Text style={s.goalProgress}>
                  {g.current} / {g.goal.target}
                </Text>
              )}
              {(g.goal.type === "trust" || g.goal.type === "barakah") &&
                typeof g.current === "number" && (
                  <Text style={s.goalProgress}>
                    {g.current} / {g.goal.target}
                  </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  goalLabelAchieved: {
    color: colors.success,
  },
  goalProgress: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});