import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import { formatMoney } from "../logic/format";

type Props = {
  money: number;
  trust: number;
  barakah: number;
  animated?: boolean;
};

const MiniBar = ({ value, maxValue, color }: { value: number; maxValue: number; color: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  return (
    <View style={[s.miniTrack, { backgroundColor: color + "20" }]}>
      <View style={[s.miniFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
};

export const StatsStrip = ({ money, trust, barakah, animated }: Props) => {
  const moneyAnim = useRef(new Animated.Value(0)).current;
  const prevMoneyRef = useRef(money);

  useEffect(() => {
    if (animated && money !== prevMoneyRef.current) {
      const diff = money - prevMoneyRef.current;
      moneyAnim.setValue(diff > 0 ? -20 : 20);
      Animated.timing(moneyAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      prevMoneyRef.current = money;
    }
  }, [money, animated]);

  return (
    <View style={s.container}>
      <Animated.View style={[s.statItem, { transform: [{ translateY: moneyAnim }] }]}>
        <Ionicons name="wallet" size={14} color={colors.warning} />
        <Text style={[s.statValue, { color: colors.warning }]}>{formatMoney(money)}</Text>
      </Animated.View>

      <View style={s.divider} />

      <View style={s.statItem}>
        <Ionicons name="people" size={14} color={colors.primary} />
        <MiniBar value={trust} maxValue={100} color={colors.primary} />
      </View>

      <View style={s.divider} />

      <View style={s.statItem}>
        <Ionicons name="star" size={14} color={colors.purple} />
        <MiniBar value={barakah} maxValue={100} color={colors.purple} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.borderHighlight,
  },
  miniTrack: {
    width: 28,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 2,
  },
});