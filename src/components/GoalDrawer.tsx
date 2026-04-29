import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import type { GoalProgress } from "../types/game";

type Props = {
  visible: boolean;
  onClose: () => void;
  goals: GoalProgress[];
};

export const GoalDrawer = ({ visible, onClose, goals }: Props) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "money": return "wallet";
      case "trust": return "people";
      case "barakah": return "star";
      case "hasItem": return "gift";
      case "flag": return "flag";
      default: return "checkmark-circle";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        <Pressable style={s.overlayPress} onPress={onClose} />

        <Animated.View style={[s.drawer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={s.handle} />

          <View style={s.header}>
            <Text style={s.title}>أهدافك</Text>
            <Pressable onPress={onClose} style={s.closeButton}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={s.goalsList}>
            {goals.map((g) => {
              const icon = getIcon(g.goal.type);
              const progress =
                g.goal.type === "money" || g.goal.type === "trust" || g.goal.type === "barakah"
                  ? Math.min(100, Math.max(0, ((g.current as number) / (g.goal.target ?? 1)) * 100))
                  : g.achieved ? 100 : 0;

              return (
                <View key={g.goal.label} style={[s.goalRow, g.achieved && s.goalRowAchieved]}>
                  <Ionicons
                    name={g.achieved ? "checkmark-circle" : icon}
                    size={22}
                    color={g.achieved ? colors.success : colors.textSecondary}
                  />
                  <View style={s.goalContent}>
                    <Text style={[s.goalLabel, g.achieved && s.goalLabelAchieved]}>
                      {g.goal.label}
                    </Text>
                    {(g.goal.type === "money" || g.goal.type === "trust" || g.goal.type === "barakah") && (
                      <View style={s.progressRow}>
                        <View style={s.progressTrack}>
                          <View style={[s.progressFill, { width: `${progress}%` }, g.achieved && { backgroundColor: colors.success }]} />
                        </View>
                        <Text style={s.progressText}>
                          {g.current} / {g.goal.target}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  overlayPress: {
    flex: 1,
  },
  drawer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderHighlight,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  goalsList: {
    gap: spacing.sm,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalRowAchieved: {
    borderColor: colors.success + "40",
    backgroundColor: colors.success + "10",
  },
  goalContent: {
    flex: 1,
    gap: 4,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  goalLabelAchieved: {
    color: colors.success,
  },
  progressRow: {
    flexDirection: "row",
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
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    minWidth: 40,
  },
});