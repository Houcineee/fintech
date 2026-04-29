import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  applyChoice,
  createResultSummary,
  evaluateMilestones,
  getNextScene,
  getFirstScene,
  resolveEnding,
} from "../logic/engine";
import { getMissionById, missionData } from "../data";
import type { Choice, GameState, PersistedState, ResultSummary } from "../types/game";

const RANKS = [
  { name: "مسافر", minXP: 0, icon: "walk" as const },
  { name: "تاجر", minXP: 100, icon: "storefront" as const },
  { name: "عالم", minXP: 300, icon: "school" as const },
  { name: "أمير", minXP: 600, icon: "diamond" as const },
];

export function getRankForXP(xp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r;
  }
  return rank;
}

export function getNextRankXP(xp: number): number | null {
  for (const r of RANKS) {
    if (xp < r.minXP) return r.minXP;
  }
  return null;
}

export function isMissionUnlocked(
  missionId: string,
  completedMissionIds: string[]
): boolean {
  const mission = getMissionById(missionId);
  if (!mission) return false;
  if (mission.missionNumber === 1) return true;
  const prevMission = getMissionByNumber(mission.missionNumber - 1);
  if (!prevMission) return false;
  return completedMissionIds.includes(prevMission.id);
}

function getMissionByNumber(num: number) {
  return missionData.find((m) => m.missionNumber === num);
}

type StoreState = {
  game: GameState | null;
  result: ResultSummary | null;
  completedMissionIds: string[];
  totalXP: number;
  hasSeenOnboarding: boolean;
  startMission: (missionId: string) => void;
  makeChoice: (sceneId: string, choiceId: string) => void;
  finishMission: () => void;
  isMissionUnlocked: (missionId: string) => boolean;
  getNextMissionId: (missionId: string) => string | null;
  clearSession: () => void;
  resetAcademy: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;
};

export const useGameStore = create<StoreState>()(
  persist(
    (set, get) => ({
      game: null,
      result: null,
      completedMissionIds: [],
      totalXP: 0,
      hasSeenOnboarding: false,

      startMission: (missionId: string) => {
        const mission = getMissionById(missionId);
        if (!mission) return;

        const firstScene = getFirstScene(mission);
        const initialState: GameState = {
          missionId,
          money: mission.initialMoney,
          trust: mission.initialTrust,
          barakah: mission.initialBarakah,
          xp: 0,
          inventory: [],
          flags: [],
          visitedSceneIds: [firstScene.id],
          currentSceneId: firstScene.id,
          choiceLog: [],
          completed: false,
          endingId: null,
          triggeredMilestones: [],
        };

        set({ game: initialState, result: null });
      },

      makeChoice: (sceneId: string, choiceId: string) => {
        const current = get().game;
        if (!current || current.completed) return;

        const mission = getMissionById(current.missionId);
        if (!mission) return;

        const scene = mission.scenes.find((s) => s.id === sceneId);
        if (!scene) return;

        const choice = scene.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        const newState = applyChoice(current, choice, sceneId, scene.day);
        const triggered = evaluateMilestones(
          mission,
          newState,
          newState.triggeredMilestones
        );
        const milestoneXP = triggered.reduce((sum, m) => sum + m.xp, 0);
        const newTriggeredIds = [
          ...newState.triggeredMilestones,
          ...triggered.map((m) => m.id),
        ];
        const updatedState: GameState = {
          ...newState,
          xp: newState.xp + milestoneXP,
          triggeredMilestones: newTriggeredIds,
        };

        let nextScene: ReturnType<typeof getNextScene> = null;
        let isComplete = false;

        if (!choice.nextSceneId) {
          nextScene = getNextScene(mission, updatedState, choice);
        } else {
          nextScene = mission.scenes.find((s) => s.id === choice.nextSceneId) ?? null;
        }

        if (nextScene) {
          set({
            game: {
              ...updatedState,
              currentSceneId: nextScene.id,
              visitedSceneIds: [...updatedState.visitedSceneIds, nextScene.id],
            },
          });
        } else {
          isComplete = true;
          set({
            game: { ...updatedState, completed: true },
          });
          get().finishMission();
        }
      },

      finishMission: () => {
        const current = get().game;
        if (!current) return;

        const mission = getMissionById(current.missionId);
        if (!mission) return;

        const summary = createResultSummary(mission, current);
        const completedIds = get().completedMissionIds;
        const newCompleted =
          summary.ending.isGood && !completedIds.includes(current.missionId)
            ? [...completedIds, current.missionId]
            : completedIds;

        set({
          result: summary,
          completedMissionIds: newCompleted,
          totalXP: get().totalXP + summary.xpEarned + current.xp,
          game: { ...current, completed: true },
        });
      },

      isMissionUnlocked: (missionId: string) => {
        return isMissionUnlocked(missionId, get().completedMissionIds);
      },

      getNextMissionId: (missionId: string) => {
        const mission = getMissionById(missionId);
        if (!mission) return null;
        const next = getMissionByNumber(mission.missionNumber + 1);
        return next?.id ?? null;
      },

      clearSession: () =>
        set((state) => ({
          game: null,
          result: null,
          completedMissionIds: state.completedMissionIds,
        })),

      resetAcademy: () =>
        set({
          game: null,
          result: null,
          completedMissionIds: [],
          totalXP: 0,
          hasSeenOnboarding: false,
        }),

      setHasSeenOnboarding: (seen: boolean) => set({ hasSeenOnboarding: seen }),
    }),
    {
      name: "dirhami-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) =>
        ({
          completedMissionIds: state.completedMissionIds,
          totalXP: state.totalXP,
          hasSeenOnboarding: state.hasSeenOnboarding,
        }) as PersistedState,
    }
  )
);