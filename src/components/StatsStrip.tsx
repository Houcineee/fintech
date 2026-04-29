import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { formatMoney } from "../logic/format";

type Props = {
  money: number;
  trust: number;
  barakah: number;
  animated?: boolean;
};

const MiniBar = ({
  animatedValue,
  color,
}: {
  animatedValue: Animated.Value;
  color: string;
}) => {
  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={[s.miniTrack, { backgroundColor: color + "20" }]}>
      <Animated.View style={[s.miniFill, { width, backgroundColor: color }]} />
    </View>
  );
};

export const StatsStrip = ({ money, trust, barakah, animated }: Props) => {
  const moneyAnim = useRef(new Animated.Value(0)).current;
  const moneyScale = useRef(new Animated.Value(1)).current;
  const trustScale = useRef(new Animated.Value(1)).current;
  const barakahScale = useRef(new Animated.Value(1)).current;
  const trustAnim = useRef(new Animated.Value(trust)).current;
  const barakahAnim = useRef(new Animated.Value(barakah)).current;
  const prevMoneyRef = useRef(money);
  const prevTrustRef = useRef(trust);
  const prevBarakahRef = useRef(barakah);

  const pulse = (value: Animated.Value) => {
    value.setValue(1);
    Animated.sequence([
      Animated.spring(value, {
        toValue: 1.12,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (animated && money !== prevMoneyRef.current) {
      const diff = money - prevMoneyRef.current;
      moneyAnim.setValue(diff > 0 ? -20 : 20);
      pulse(moneyScale);
      Animated.spring(moneyAnim, {
        toValue: 0,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
      prevMoneyRef.current = money;
    }
  }, [money, animated, moneyAnim, moneyScale]);

  useEffect(() => {
    if (trust !== prevTrustRef.current) {
      if (animated) pulse(trustScale);
      Animated.timing(trustAnim, {
        toValue: trust,
        duration: 450,
        useNativeDriver: false,
      }).start();
      prevTrustRef.current = trust;
    }
  }, [trust, animated, trustAnim, trustScale]);

  useEffect(() => {
    if (barakah !== prevBarakahRef.current) {
      if (animated) pulse(barakahScale);
      Animated.timing(barakahAnim, {
        toValue: barakah,
        duration: 450,
        useNativeDriver: false,
      }).start();
      prevBarakahRef.current = barakah;
    }
  }, [barakah, animated, barakahAnim, barakahScale]);

  return (
    <View style={s.container}>
      <Animated.View
        style={[
          s.statPill,
          s.moneyPill,
          { transform: [{ translateY: moneyAnim }, { scale: moneyScale }] },
        ]}
      >
        <Ionicons name="wallet" size={14} color={colors.warning} />
        <Text style={[s.statValue, { color: colors.warning }]}>{formatMoney(money)}</Text>
      </Animated.View>

      <Animated.View style={[s.statPill, { transform: [{ scale: trustScale }] }]}>
        <Ionicons name="people" size={14} color={colors.success} />
        <MiniBar animatedValue={trustAnim} color={colors.success} />
      </Animated.View>

      <Animated.View style={[s.statPill, { transform: [{ scale: barakahScale }] }]}>
        <Ionicons name="star" size={14} color={colors.barakah} />
        <MiniBar animatedValue={barakahAnim} color={colors.barakah} />
      </Animated.View>
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
    paddingVertical: spacing.sm,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  moneyPill: {
    borderColor: colors.warning + "40",
    backgroundColor: colors.warningLight,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
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
