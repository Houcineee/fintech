import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";

type Props = {
  trust: number;
  barakah: number;
  reaction?: string | null;
};

export const DinarCompanion = ({ trust, barakah, reaction }: Props) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const reactionOpacity = useRef(new Animated.Value(0)).current;

  const average = (trust + barakah) / 2;
  const expression =
    average >= 65 ? "happy" : average >= 35 ? "neutral" : "sad";

  const expressionIcon =
    expression === "happy"
      ? "happy"
      : expression === "neutral"
        ? "remove"
        : "sad";

  const glowColor =
    expression === "happy"
      ? colors.success
      : expression === "neutral"
        ? colors.warning
        : colors.danger;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (reaction) {
      reactionOpacity.setValue(0);
      Animated.timing(reactionOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [reaction]);

  return (
    <View style={s.container}>
      <View style={s.companionRow}>
        <Animated.View
          style={[s.orbWrapper, { transform: [{ translateY: bounceAnim }] }]}
        >
          <View style={[s.orb, { borderColor: glowColor }, shadows.glowCyan]}>
            <Ionicons
              name={expression === "happy" ? "happy-outline" : expression === "neutral" ? "remove-circle-outline" : "sad-outline"}
              size={32}
              color={glowColor}
            />
          </View>
        </Animated.View>

        <View style={s.statsMini}>
          <Text style={s.companionName}> درهمي</Text>
          <View style={s.miniRow}>
            <Ionicons name="people" size={12} color={colors.primary} />
            <Text style={s.miniStat}>{trust}</Text>
          </View>
          <View style={s.miniRow}>
            <Ionicons name="star" size={12} color={colors.purple} />
            <Text style={s.miniStat}>{barakah}</Text>
          </View>
        </View>
      </View>

      {reaction && (
        <Animated.View style={[s.bubble, { opacity: reactionOpacity }]}>
          <Text style={s.bubbleText}>{reaction}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
  },
  companionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  orbWrapper: {
    alignItems: "center",
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  statsMini: {
    gap: 4,
  },
  companionName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniStat: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 280,
    alignSelf: "center",
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
});