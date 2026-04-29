import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { formatMoney } from "../logic/format";
import type { ChoiceEffects, Scene } from "../types/game";

const MAX_CHOICES = 5;

type Props = {
  scene: Scene;
  money: number;
  onChoose: (sceneId: string, choiceId: string) => void;
  selectedChoiceId?: string | null;
  disabled?: boolean;
};

type EffectChip = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  tone: string;
};

const itemLabel: Record<string, string> = {
  bike: "الدراجة",
};

const signed = (value: number, label: string) =>
  `${value > 0 ? "+" : ""}${value} ${label}`;

const getEffectChips = (effects: ChoiceEffects): EffectChip[] => {
  const chips: EffectChip[] = [];

  if (effects.money) {
    chips.push({
      key: "money",
      icon: "wallet",
      label: effects.money > 0 ? `+${formatMoney(effects.money)}` : formatMoney(effects.money),
      color: effects.money > 0 ? colors.warning : colors.danger,
      tone: effects.money > 0 ? colors.warningLight : colors.dangerLight,
    });
  }
  if (effects.trust) {
    chips.push({
      key: "trust",
      icon: "people",
      label: signed(effects.trust, "ثقة"),
      color: effects.trust > 0 ? colors.success : colors.danger,
      tone: effects.trust > 0 ? colors.successLight : colors.dangerLight,
    });
  }
  if (effects.barakah) {
    chips.push({
      key: "barakah",
      icon: "star",
      label: signed(effects.barakah, "بركة"),
      color: effects.barakah > 0 ? colors.barakah : colors.danger,
      tone: effects.barakah > 0 ? colors.barakahLight : colors.dangerLight,
    });
  }
  if (effects.xp) {
    chips.push({
      key: "xp",
      icon: "ribbon",
      label: signed(effects.xp, "XP"),
      color: colors.primary,
      tone: colors.primaryLight,
    });
  }
  if (effects.addItem) {
    chips.push({
      key: "item",
      icon: "gift",
      label: itemLabel[effects.addItem] ?? effects.addItem,
      color: colors.primary,
      tone: colors.primaryLight,
    });
  }

  return chips;
};

const getPreviewChips = (effects: ChoiceEffects): EffectChip[] =>
  getEffectChips({ money: effects.money });

export const SceneCard = ({ scene, money, onChoose, selectedChoiceId, disabled }: Props) => {
  const narrativeOpacity = useRef(new Animated.Value(0)).current;
  const choiceOpacities = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(0))
  ).current;
  const choiceTranslations = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(20))
  ).current;
  const choiceScales = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(1))
  ).current;
  const burstOpacities = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(0))
  ).current;
  const burstTranslations = useRef(
    Array.from({ length: MAX_CHOICES }, () => new Animated.Value(0))
  ).current;
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    narrativeOpacity.setValue(0);
    choiceOpacities.forEach((a) => a.setValue(0));
    choiceTranslations.forEach((a) => a.setValue(20));
    choiceScales.forEach((a) => a.setValue(1));
    burstOpacities.forEach((a) => a.setValue(0));
    burstTranslations.forEach((a) => a.setValue(0));

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

  useEffect(() => {
    if (!selectedChoiceId) return;
    const selectedIndex = scene.choices.findIndex((choice) => choice.id === selectedChoiceId);
    if (selectedIndex < 0) return;

    choiceScales[selectedIndex].setValue(0.96);
    burstOpacities[selectedIndex].setValue(1);
    burstTranslations[selectedIndex].setValue(0);

    Animated.parallel([
      Animated.spring(choiceScales[selectedIndex], {
        toValue: 1.04,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(burstTranslations[selectedIndex], {
        toValue: -28,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(burstOpacities[selectedIndex], {
        toValue: 0,
        duration: 520,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedChoiceId, scene.choices]);

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
          const isSelected = selectedChoiceId === choice.id;
          const previewChips = getPreviewChips(choice.effects);
          const burstChips = getEffectChips(choice.effects);
          const isDisabled = disabled || unaffordable || !!selectedChoiceId;

          return (
            <Animated.View
              key={choice.id}
              style={[
                s.choiceWrapper,
                {
                  opacity: choiceOpacities[index],
                  transform: [
                    { translateY: choiceTranslations[index] },
                    { scale: choiceScales[index] },
                  ],
                },
              ]}
            >
              <Pressable
                onPress={() => !unaffordable && onChoose(scene.id, choice.id)}
                disabled={isDisabled}
                style={({ pressed }) => [
                  s.choiceButton,
                  isSelected && s.choiceSelected,
                  pressed && !isDisabled && s.choicePressed,
                  isDisabled && !isSelected && s.choiceDisabled,
                  unaffordable && s.choiceUnaffordable,
                ]}
              >
                <Text
                  style={[s.choiceText, unaffordable && s.choiceTextUnaffordable]}
                  numberOfLines={2}
                >
                  {choice.text}
                </Text>
                {previewChips.length > 0 && (
                  <View style={s.effectsRow}>
                    {previewChips.map((chip) => (
                      <View
                        key={chip.key}
                        style={[
                          s.effectChip,
                          { backgroundColor: chip.tone, borderColor: chip.color + "40" },
                        ]}
                      >
                        <Ionicons name={chip.icon} size={12} color={chip.color} />
                        <Text style={[s.effectText, { color: chip.color }]}>
                          {chip.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {isSelected && burstChips.length > 0 && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      s.burstLayer,
                      {
                        opacity: burstOpacities[index],
                        transform: [{ translateY: burstTranslations[index] }],
                      },
                    ]}
                  >
                    {burstChips.map((chip) => (
                      <View
                        key={chip.key}
                        style={[
                          s.burstChip,
                          { backgroundColor: chip.color, borderColor: chip.color },
                        ]}
                      >
                        <Ionicons name={chip.icon} size={13} color={colors.textInverse} />
                        <Text style={s.burstText}>{chip.label}</Text>
                      </View>
                    ))}
                  </Animated.View>
                )}
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
  // Claymorphic button style
  choiceButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
    ...shadows.clay,
  },
  choicePressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.surfaceRaised,
    ...shadows.clayPressed,
  },
  choiceDisabled: {
    opacity: 0.5,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  choiceUnaffordable: {
    borderColor: colors.danger + "40",
    backgroundColor: colors.dangerLight,
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
  effectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  effectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  effectText: {
    fontSize: 11,
    fontWeight: "800",
  },
  burstLayer: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    top: -8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
  },
  burstChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...shadows.clay,
  },
  burstText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textInverse,
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
