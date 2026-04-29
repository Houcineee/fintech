import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing, radius } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";
import { useGameStore } from "../store/gameStore";
import { getMissionById } from "../data";
import { evaluateGoalProgress } from "../logic/engine";
import { StatsStrip } from "../components/StatsStrip";
import { SceneCard } from "../components/SceneCard";
import { DinarCompanion } from "../components/DinarCompanion";
import { GoalDrawer } from "../components/GoalDrawer";

type Props = NativeStackScreenProps<RootStackParamList, "Story">;

type Phase = "reading" | "choosing" | "reacting";

export const StoryScreen = ({ navigation }: Props) => {
  const game = useGameStore((s) => s.game);
  const makeChoice = useGameStore((s) => s.makeChoice);
  const [phase, setPhase] = useState<Phase>("reading");
  const [showGoalDrawer, setShowGoalDrawer] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const suppressSceneResetRef = useRef(false);

  const mission = game ? getMissionById(game.missionId) : null;
  const currentScene = mission?.scenes.find((s) => s.id === game?.currentSceneId);

  // Navigation guard
  useEffect(() => {
    if (!game || !mission) {
      navigation.replace("Home");
      return;
    }
  }, [game, mission, navigation]);

  // Phase transition: on new scene, start at "reading"
  useEffect(() => {
    if (!currentScene) return;
    if (suppressSceneResetRef.current) return;
    setPhase("reading");
    setCurrentReaction(null);
    setSelectedChoiceId(null);

    // After narrative appears, switch to choosing
    readingTimerRef.current = setTimeout(() => {
      setPhase("choosing");
    }, 1500);

    return () => {
      if (readingTimerRef.current) {
        clearTimeout(readingTimerRef.current);
      }
    };
  }, [currentScene?.id]);

  const handleChoose = useCallback(
    (sceneId: string, choiceId: string) => {
      if (!game || !mission || !currentScene || selectedChoiceId) return;

      const choice = currentScene.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      setSelectedChoiceId(choiceId);
      if (choice.dinarReaction) {
        setCurrentReaction(choice.dinarReaction);
      }

      // Let the selected choice burst first, then apply the state change.
      transitionTimerRef.current = setTimeout(() => {
        suppressSceneResetRef.current = true;
        setPhase("reacting");
        makeChoice(sceneId, choiceId);

        transitionTimerRef.current = setTimeout(() => {
          const updatedGame = useGameStore.getState().game;
          if (updatedGame?.completed) {
            navigation.navigate("End");
            suppressSceneResetRef.current = false;
            return;
          }

          setSelectedChoiceId(null);
          setCurrentReaction(null);
          setPhase("reading");
          suppressSceneResetRef.current = false;

          readingTimerRef.current = setTimeout(() => {
            setPhase("choosing");
          }, 1500);
        }, 1400);
      }, 560);
    },
    [game, mission, currentScene, makeChoice, navigation, selectedChoiceId]
  );

  if (!game || !mission || !currentScene) return null;

  const goalProgress = evaluateGoalProgress(mission.goals, game);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.replace("Home")} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>{mission.title}</Text>
        <View style={s.dayIndicator}>
          <Text style={s.dayText}>
            {currentScene.day ? `اليوم ${currentScene.day}` : ""}
          </Text>
        </View>
      </View>

      {/* Stats Strip */}
      <StatsStrip
        money={game.money}
        trust={game.trust}
        barakah={game.barakah}
        animated={phase === "reacting"}
      />

      {/* Main Content Area */}
      <View style={s.mainContent}>
        {/* Phase 1 & 2: Narrative + Choices */}
        {(phase === "reading" || phase === "choosing") && (
          <View style={s.sceneContainer}>
            <SceneCard
              scene={currentScene}
              money={game.money}
              onChoose={handleChoose}
              selectedChoiceId={selectedChoiceId}
              disabled={phase === "reading"}
            />
          </View>
        )}

        {/* Phase 3: Dinar Reaction */}
        {phase === "reacting" && (
          <View style={s.reactionContainer}>
            <DinarCompanion
              trust={game.trust}
              barakah={game.barakah}
              reaction={currentReaction}
            />
          </View>
        )}
      </View>

      {/* Bottom area: Goal button */}
      {phase !== "reacting" && (
        <View style={s.bottomBar}>
          <Pressable
            style={[s.goalButton, shadows.clay]}
            onPress={() => setShowGoalDrawer(true)}
          >
            <Ionicons name="flag" size={16} color={colors.warning} />
            <Text style={s.goalButtonText}>الأهداف</Text>
          </Pressable>
        </View>
      )}

      {/* Goal Drawer */}
      <GoalDrawer
        visible={showGoalDrawer}
        onClose={() => setShowGoalDrawer(false)}
        goals={goalProgress}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    ...shadows.clay,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  dayIndicator: {
    width: 70,
    alignItems: "flex-end",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sceneContainer: {
    flex: 1,
    justifyContent: "center",
  },
  reactionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "flex-end",
  },
  goalButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warning,
  },
});
