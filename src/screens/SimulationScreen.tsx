import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextProps,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { EventCard } from "../components/EventCard";
import { getScenarioById, getScenarioEvents } from "../logic/simulation";
import { formatCurrency } from "../logic/format";
import { useSimulationStore } from "../store/simulationStore";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { RootStackParamList } from "../types/navigation";
import { Text } from "../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Simulation">;

// ── Character Companion: "Dinar" the coin ──
const DinarCharacter = ({ healthScore }: { healthScore: number }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -4,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getExpression = () => {
    if (healthScore >= 70) return { icon: "happy-outline" as keyof typeof Ionicons.glyphMap, color: colors.success, glow: shadows.glowGreen };
    if (healthScore >= 40) return { icon: "remove-circle-outline" as keyof typeof Ionicons.glyphMap, color: colors.warning, glow: shadows.glowAmber };
    return { icon: "sad-outline" as keyof typeof Ionicons.glyphMap, color: colors.danger, glow: shadows.glowPink };
  };

  const expr = getExpression();

  return (
    <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
      <View style={[styles.dinarOrb, { backgroundColor: expr.color + "20" }, expr.glow]}>
        <Ionicons name={expr.icon} size={24} color={expr.color} />
      </View>
    </Animated.View>
  );
};

// ── Animated Balance Counter ──
const AnimatedBalance = ({ value }: { value: number }) => {
  const displayValue = useRef(new Animated.Value(value)).current;
  const prevValue = useRef(value);
  const [displayText, setDisplayText] = useState(formatCurrency(value));
  const flashColor = useRef(colors.text);
  const [textColor, setTextColor] = useState(colors.text);

  useEffect(() => {
    const diff = value - prevValue.current;
    if (diff === 0) return;

    flashColor.current = diff > 0 ? colors.success : colors.danger;
    setTextColor(flashColor.current);

    const anim = Animated.timing(displayValue, {
      toValue: value,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) {
        prevValue.current = value;
        setTextColor(colors.text);
      }
    });

    const listener = displayValue.addListener(({ value: v }) => {
      setDisplayText(formatCurrency(Math.round(v)));
    });

    return () => displayValue.removeListener(listener);
  }, [value]);

  return <Text style={[styles.balanceValue, { color: textColor }]}>{displayText}</Text>;
};

// ── Day Transition Screen ──
const DayTransition = ({
  day,
  totalDays,
  onFinish,
}: {
  day: number;
  totalDays: number;
  onFinish: () => void;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.dayTransition, { opacity }]}>
      <Animated.View style={[styles.dayContent, { transform: [{ scale }] }]}>
        <Ionicons name="sunny" size={40} color={colors.warning} />
        <Text style={styles.dayNumber}>يوم {day}</Text>
        <Text style={styles.dayTotal}>من {totalDays} أيام</Text>
      </Animated.View>
    </Animated.View>
  );
};

// ── Consequence Reveal Card ──
const ConsequenceCard = ({
  consequence,
  feedback,
  isPositive,
  onContinue,
}: {
  consequence: string;
  feedback: string;
  isPositive: boolean;
  onContinue: () => void;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const accentColor = isPositive ? colors.success : colors.danger;

  return (
    <Animated.View
      style={[
        styles.consequenceContainer,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.consequenceCard,
          { borderLeftColor: accentColor },
        ]}
      >
        <View style={[styles.consequenceIcon, { backgroundColor: accentColor + "20" }]}>
          <Ionicons
            name={isPositive ? "checkmark-circle" : "alert-circle"}
            size={28}
            color={accentColor}
          />
        </View>

        <Text style={styles.consequenceFeedback}>{feedback}</Text>

        <View style={styles.consequenceDivider} />

        <Text style={styles.consequenceText}>{consequence}</Text>

        <Pressable onPress={onContinue} style={styles.consequenceButton}>
          <Text style={styles.consequenceButtonText}>تابع</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ── Confetti / Celebration Particles ──
const Celebration = ({ type }: { type: "good" | "bad" | "mission" }) => {
  const particles = useRef(
    Array.from({ length: type === "mission" ? 12 : 6 }, (_, i) => ({
      id: i,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const distance = type === "mission" ? 150 : 80;
      const duration = type === "mission" ? 1000 : 500;

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * distance - (type === "mission" ? 50 : 20),
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration,
          delay: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.spring(p.scale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const getParticleColor = (index: number) => {
    if (type === "good") return colors.success;
    if (type === "bad") return colors.danger;
    const celebrationColors = [colors.primary, colors.success, colors.warning, colors.purple, colors.danger];
    return celebrationColors[index % celebrationColors.length];
  };

  const getParticleIcon = (index: number) => {
    if (type === "mission") {
      const icons = ["star", "diamond", "flash", "heart"];
      return icons[index % icons.length];
    }
    return type === "good" ? "add" : "remove";
  };

  return (
    <View style={styles.celebrationContainer} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        >
          <Ionicons
            name={getParticleIcon(i) as any}
            size={type === "mission" ? 20 : 14}
            color={getParticleColor(i)}
          />
        </Animated.View>
      ))}
    </View>
  );
};

// ── Screen Shake Effect ──
const useShake = () => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  return { shakeAnim, shake };
};

// ── Mission Intro Card ──
const MissionIntroCard = ({
  scenario,
  onStart,
}: {
  scenario: ReturnType<typeof getScenarioById>;
  onStart: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!scenario) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.introCard}>
        <View style={styles.introHeader}>
          <Text style={styles.introMissionNumber}>
            مهمة {scenario.missionNumber}
          </Text>
          <Text style={styles.introTitle}>{scenario.title}</Text>
        </View>

        <View style={styles.introMeta}>
          <View style={styles.metaBadge}>
            <Ionicons name="person" size={14} color={colors.primary} />
            <Text style={styles.metaText}>{scenario.roleTitle}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Ionicons name="flag" size={14} color={colors.success} />
            <Text style={styles.metaText}>{scenario.goalLabel}</Text>
          </View>
        </View>

        <Text style={styles.introDescription}>{scenario.summary}</Text>

        <View style={styles.introStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{scenario.durationDays}</Text>
            <Text style={styles.statLabel}>أيام</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(scenario.startingBalance)}
            </Text>
            <Text style={styles.statLabel}>بداية</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(scenario.savingsGoal)}
            </Text>
            <Text style={styles.statLabel}>هدف</Text>
          </View>
        </View>

        <Pressable onPress={onStart} style={styles.introButton}>
          <Text style={styles.introButtonText}>ابدأ المهمة</Text>
          <Ionicons name="rocket" size={20} color={colors.textInverse} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ── Main Screen ──
export const SimulationScreen = ({ navigation }: Props) => {
  const simulation = useSimulationStore((state) => state.simulation);
  const result = useSimulationStore((state) => state.result);
  const applyChoice = useSimulationStore((state) => state.applyChoice);

  const [showIntro, setShowIntro] = useState(true);
  const [showDayTransition, setShowDayTransition] = useState(false);
  const [pendingDay, setPendingDay] = useState(0);
  const [consequence, setConsequence] = useState<{
    consequence: string;
    feedback: string;
    isPositive: boolean;
  } | null>(null);
  const [celebration, setCelebration] = useState<"good" | "bad" | "mission" | null>(null);
  const { shakeAnim, shake } = useShake();

  useEffect(() => {
    if (!simulation) {
      navigation.replace("Home");
      return;
    }
    if (result) {
      navigation.replace("Results");
    }
  }, [navigation, result, simulation]);

  if (!simulation) return null;

  const scenario = getScenarioById(simulation.scenarioId);
  if (!scenario) return null;

  const events = getScenarioEvents(scenario);
  const currentEvent = events[simulation.choiceHistory.length];

  const handleChoose = (choice: any) => {
    if (!currentEvent) return;

    const isPositive = choice.healthEffect >= 0;

    // Show consequence reveal card
    setConsequence({
      consequence: choice.consequence,
      feedback: choice.feedback,
      isPositive,
    });

    // Show micro-celebration
    setCelebration(isPositive ? "good" : "bad");
    if (!isPositive) shake();

    setTimeout(() => setCelebration(null), 600);

    applyChoice(currentEvent.id, choice.id);
  };

  const handleConsequenceContinue = () => {
    setConsequence(null);

    // Check if there's a next event — show day transition
    const nextEvent = events[simulation.choiceHistory.length];
    if (nextEvent && currentEvent) {
      if (nextEvent.day !== currentEvent.day) {
        setPendingDay(nextEvent.day);
        setShowDayTransition(true);
      }
    }
  };

  const handleDayTransitionFinish = () => {
    setShowDayTransition(false);
  };

  // ── Intro Screen ──
  if (showIntro) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <MissionIntroCard
            scenario={scenario}
            onStart={() => setShowIntro(false)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Day Transition ──
  if (showDayTransition) {
    return (
      <SafeAreaView style={styles.safe}>
        <DayTransition
          day={pendingDay}
          totalDays={scenario.durationDays}
          onFinish={handleDayTransitionFinish}
        />
      </SafeAreaView>
    );
  }

  // ── Consequence Reveal ──
  if (consequence) {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Status bar visible during consequence */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <AnimatedBalance value={simulation.balance} />
            <Text style={styles.statusLabel}>الرصيد</Text>
          </View>
          <View style={styles.statusDivider} />
          <DinarCharacter healthScore={simulation.healthScore} />
          <View style={styles.statusDivider} />
          <View style={styles.statusItem}>
            <Text
              style={[
                styles.healthValue,
                {
                  color:
                    simulation.healthScore >= 70
                      ? colors.success
                      : simulation.healthScore >= 40
                      ? colors.warning
                      : colors.danger,
                },
              ]}
            >
              {simulation.healthScore}%
            </Text>
            <Text style={styles.statusLabel}>الصحة</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <ConsequenceCard
            consequence={consequence.consequence}
            feedback={consequence.feedback}
            isPositive={consequence.isPositive}
            onContinue={handleConsequenceContinue}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main Gameplay ──
  return (
    <SafeAreaView style={styles.safe}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <AnimatedBalance value={simulation.balance} />
          <Text style={styles.statusLabel}>الرصيد</Text>
        </View>
        <View style={styles.statusDivider} />
        <DinarCharacter healthScore={simulation.healthScore} />
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text
            style={[
              styles.healthValue,
              {
                color:
                  simulation.healthScore >= 70
                    ? colors.success
                    : simulation.healthScore >= 40
                    ? colors.warning
                    : colors.danger,
              },
            ]}
          >
            {simulation.healthScore}%
          </Text>
          <Text style={styles.statusLabel}>الصحة</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.dayContainer}>
          <View style={styles.dayRing}>
            <Text style={styles.dayValue}>
              {currentEvent?.day ?? scenario.durationDays}/{scenario.durationDays}
            </Text>
          </View>
          <Text style={styles.dayLabel}>اليوم</Text>
        </View>
      </View>

      {/* Celebration Particles */}
      {celebration && <Celebration type={celebration} />}

      {/* Main Content with Shake */}
      <Animated.View
        style={[styles.flex, { transform: [{ translateX: shakeAnim }] }]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {currentEvent ? (
            <EventCard event={currentEvent} onChoose={handleChoose} />
          ) : (
            <View style={styles.completionCard}>
              <View style={styles.spinner}>
                <Ionicons name="sync" size={32} color={colors.primary} />
              </View>
              <Text style={styles.completionText}>جار تحضير النتيجة...</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  // Status bar
  statusBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusItem: {
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  healthValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  // Dinar character
  dinarOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderHighlight,
  },
  // Day counter
  dayContainer: {
    alignItems: "center",
  },
  dayRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.borderHighlight,
    borderTopColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  dayValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Day transition
  dayTransition: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  dayContent: {
    alignItems: "center",
  },
  dayNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.text,
    marginTop: spacing.md,
  },
  dayTotal: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  // Consequence card
  consequenceContainer: {
    marginTop: spacing.lg,
  },
  consequenceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
  },
  consequenceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  consequenceFeedback: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  consequenceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  consequenceText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  consequenceButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.glowCyan,
  },
  consequenceButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: "800",
  },
  // Celebration
  celebrationContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    zIndex: 100,
  },
  particle: {
    position: "absolute",
  },
  // Intro card
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introHeader: {
    marginBottom: spacing.lg,
  },
  introMissionNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 34,
  },
  introMeta: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  introDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: spacing.lg,
  },
  introStats: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  introButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadows.glowCyan,
  },
  introButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: "800",
  },
  // Completion
  completionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  completionText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 50,
  },
});
