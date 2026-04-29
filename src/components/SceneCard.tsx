import React from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import type { Scene, Choice } from "../types/game";

type Props = {
  scene: Scene;
  onChoose: (sceneId: string, choiceId: string) => void;
  disabled?: boolean;
};

export const SceneCard = ({ scene, onChoose, disabled }: Props) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [scene.id]);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      <View style={s.dayBadge}>
        <Ionicons name="calendar" size={14} color={colors.primary} />
        <Text style={s.dayText}>{scene.day ? `اليوم ${scene.day}` : ""}</Text>
      </View>

      <Text style={s.narrative}>{scene.text}</Text>

      <View style={s.choicesContainer}>
        {scene.choices.map((choice, index) => (
          <ChoiceButton
            key={choice.id}
            choice={choice}
            index={index}
            onPress={() => onChoose(scene.id, choice.id)}
            disabled={disabled}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const ChoiceButton = ({
  choice,
  index,
  onPress,
  disabled,
}: {
  choice: Choice;
  index: number;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const getEffectHints = () => {
    const hints: string[] = [];
    if (choice.effects.money && choice.effects.money !== 0) {
      hints.push(choice.effects.money > 0 ? `+${choice.effects.money}` : `${choice.effects.money}`);
    }
    if (choice.effects.trust && choice.effects.trust !== 0) {
      hints.push(choice.effects.trust > 0 ? `ثقة +${choice.effects.trust}` : `ثقة ${choice.effects.trust}`);
    }
    if (choice.effects.barakah && choice.effects.barakah !== 0) {
      hints.push(choice.effects.barakah > 0 ? `بركة +${choice.effects.barakah}` : `بركة ${choice.effects.barakah}`);
    }
    return hints;
  };

  const effects = getEffectHints();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.choiceButton,
        index === 0 && s.choicePrimary,
        pressed && !disabled && s.choicePressed,
        disabled && s.choiceDisabled,
      ]}
    >
      <Text
        style={[
          s.choiceText,
          index === 0 && s.choiceTextPrimary,
        ]}
        numberOfLines={2}
      >
        {choice.text}
      </Text>
      {effects.length > 0 && (
        <View style={s.effectsRow}>
          {effects.map((hint, i) => (
            <Text key={i} style={[s.effectHint, index === 0 && s.effectHintPrimary]}>
              {hint}
            </Text>
          ))}
        </View>
      )}
    </Pressable>
  );
};

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  narrative: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 28,
    textAlign: "right",
    marginBottom: spacing.lg,
  },
  choicesContainer: {
    gap: spacing.md,
  },
  choiceButton: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choicePrimary: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
    ...shadows.glowCyan,
  },
  choicePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    textAlign: "right",
  },
  choiceTextPrimary: {
    color: colors.primary,
  },
  effectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  effectHint: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  effectHintPrimary: {
    color: colors.primary + "AA",
  },
});