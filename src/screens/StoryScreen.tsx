import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadows } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { Text } from "../theme/typography";
import { RootStackParamList } from "../types/navigation";
import { useGameStore } from "../store/gameStore";
import { getMissionById } from "../data";
import { evaluateGoalProgress } from "../logic/engine";
import { StateBar } from "../components/StateBar";
import { SceneCard } from "../components/SceneCard";
import { DinarCompanion } from "../components/DinarCompanion";
import { GoalTracker } from "../components/GoalTracker";

type Props = NativeStackScreenProps<RootStackParamList, "Story">;

export const StoryScreen = ({ navigation }: Props) => {
  const game = useGameStore((s) => s.game);
  const makeChoice = useGameStore((s) => s.makeChoice);
  const finishMission = useGameStore((s) => s.finishMission);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showReaction, setShowReaction] = React.useState<string | null>(null);
  const [transitioning, setTransitioning] = React.useState(false);

  const mission = game ? getMissionById(game.missionId) : null;
  const currentScene = mission?.scenes.find((s) => s.id === game?.currentSceneId);

  useEffect(() => {
    if (!game || !mission) {
      navigation.replace("Home");
      return;
    }
  }, [game, mission, navigation]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentScene?.id]);

  const handleChoose = useCallback(
    (sceneId: string, choiceId: string) => {
      if (!game || !mission || !currentScene) return;

      const choice = currentScene.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      if (choice.dinarReaction) {
        setShowReaction(choice.dinarReaction);
        setTimeout(() => setShowReaction(null), 2500);
      }

      setTransitioning(true);
      setTimeout(() => {
        makeChoice(sceneId, choiceId);

        setTimeout(() => {
          setTransitioning(false);
          const updatedGame = useGameStore.getState().game;
          if (updatedGame?.completed) {
            navigation.navigate("End");
          }
        }, 100);
      }, 300);
    },
    [game, mission, currentScene, makeChoice, navigation]
  );

  if (!game || !mission || !currentScene) return null;

  const goalProgress = evaluateGoalProgress(mission.goals, game);
  const lastChoice = game.choiceLog.length > 0 ? game.choiceLog[game.choiceLog.length - 1] : null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.navigate("Home")} style={s.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={s.headerTitle}>{mission.title}</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <StateBar
            money={game.money}
            trust={game.trust}
            barakah={game.barakah}
            day={currentScene.day}
            goals={goalProgress}
          />
        </Animated.View>

        <View style={s.spacer} />

        <DinarCompanion
          trust={game.trust}
          barakah={game.barakah}
          reaction={showReaction}
        />

        <View style={s.spacer} />

        <Animated.View style={{ opacity: fadeAnim }}>
          <SceneCard
            scene={currentScene}
            onChoose={handleChoose}
            disabled={transitioning}
          />
        </Animated.View>

        <View style={s.spacer} />

        <GoalTracker goals={goalProgress} />

        <View style={s.bottomPadding} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  spacer: {
    height: spacing.md,
  },
  bottomPadding: {
    height: 40,
  },
});