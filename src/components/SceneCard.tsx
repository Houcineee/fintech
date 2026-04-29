import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import type { Scene } from "../types/game";

const MAX_CHOICES = 5;

type Props = {
  scene: Scene;
  money: number;
  onChoose: (sceneId: string, choiceId: string) => void;
  disabled?: boolean;
};

export const SceneCard = ({ scene, money, onChoose, disabled }: Props) => {
  const narrativeOpacity = useRef(new Animated.Value(0)).current;
  const choiceOpacities = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(0))
  ).current;
  const choiceTranslations = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(20))
  ).current;
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    narrativeOpacity.setValue(0);
    choiceOpacities.forEach((a) => a.setValue(0));
    choiceTranslations.forEach((a) => a.setValue(20));

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    Animated.timing(narrativeOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    scene.choices.forEach((_, i) => {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(choiceOpacities[i], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(choiceTranslations[i], {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 300 + i * 150);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [scene.id]);

  const isChoiceUnaffordable = (choice: typeof scene.choices[number]): boolean => {
    const moneyEffect = choice.effects.money ?? 0;
    return money + moneyEffect < 0;
  };

  return (
    <View style={s.container}>
      <View style={s.dayBadge}>
        <Text style={s.dayText}>{scene.day ? `اليوم ${scene.day}` : ""}</Text>
      </View>

      <Animated.View style={{ opacity: narrativeOpacity }}>
        <Text style={s.narrative}>{scene.text}</Text>
      </Animated.View>

      <View style={s.choicesContainer}>
        {scene.choices.map((choice, index) => {
          const unaffordable = isChoiceUnaffordable(choice);
          const isDisabled = disabled || unaffordable;

          return (
            <Animated.View
              key={choice.id}
              style={[
                s.choiceWrapper,
                {
                  opacity: choiceOpacities[index],
                  transform: [{ translateY: choiceTranslations[index] }],
                },
              ]}
            >
              <Pressable
                onPress={() => !unaffordable && onChoose(scene.id, choice.id)}
                disabled={isDisabled}
                style={({ pressed }) => [
                  s.choiceButton,
                  pressed && !isDisabled && s.choicePressed,
                  isDisabled && s.choiceDisabled,
                  unaffordable && s.choiceUnaffordable,
                ]}
              >
                <Text
                  style={[s.choiceText, unaffordable && s.choiceTextUnaffordable]}
                  numberOfLines={2}
                >
                  {choice.text}
                </Text>
                {unaffordable && (
                  <View style={s.unaffordableRow}>
                    <Ionicons name="wallet-outline" size={12} color={colors.danger} />
                    <Text style={s.unaffordableLabel}>غير كافٍ</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  dayBadge: {
    alignItems: "center",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  narrative: {
    fontSize: 19,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 32,
    textAlign: "right",
  },
  choicesContainer: {
    gap: spacing.md,
  },
  choiceWrapper: {
    width: "100%",
  },
  choiceButton: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choicePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceUnaffordable: {
    borderColor: colors.danger + "40",
    backgroundColor: colors.danger + "08",
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "right",
  },
  choiceTextUnaffordable: {
    color: colors.textMuted,
  },
  unaffordableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
    justifyContent: "flex-end",
  },
  unaffordableLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.danger,
  },
});