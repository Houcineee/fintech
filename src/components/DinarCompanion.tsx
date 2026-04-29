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
  const reactionScale = useRef(new Animated.Value(0.9)).current;

  const expression =
    trust >= 40 && barakah >= 30
      ? "happy"
      : trust >= 20 || barakah >= 15
        ? "neutral"
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
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (reaction) {
      reactionOpacity.setValue(0);
      reactionScale.setValue(0.9);
      Animated.parallel([
        Animated.timing(reactionOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(reactionScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [reaction]);

  return (
    <View style={s.container}>
      <Animated.View
        style={[s.orbWrapper, { transform: [{ translateY: bounceAnim }] }]}
      >
        <View style={[s.orb, { borderColor: glowColor }]}>
          <Ionicons
            name={
              expression === "happy"
                ? "happy-outline"
                : expression === "neutral"
                  ? "remove-circle-outline"
                  : "sad-outline"
            }
            size={48}
            color={glowColor}
          />
        </View>
        <Text style={s.name}>درهمي</Text>
      </Animated.View>

      {reaction && (
        <Animated.View
          style={[
            s.bubble,
            {
              opacity: reactionOpacity,
              transform: [{ scale: reactionScale }],
            },
          ]}
        >
          <Text style={s.bubbleText}>{reaction}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    flex: 1,
  },
  orbWrapper: {
    alignItems: "center",
    gap: spacing.sm,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    maxWidth: 300,
    minWidth: 200,
    ...shadows.sm,
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    lineHeight: 26,
  },
});