import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  applyChoiceToState,
  createInitialState,
  createResultSummary,
  getNextMission,
  getPreviousMission,
  getScenarioById,
  getScenarioEvents,
} from "../logic/simulation";
import { ResultSummary, SimulationState } from "../types/simulation";

// XP Ranks
export const RANKS = [
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

function calculateXPForChoice(choice: { ethicalTag?: string; category?: string }): number {
  if (choice.ethicalTag === "charity") return 25;
  if (choice.ethicalTag === "halal") return 20;
  if (choice.ethicalTag === "non_halal") return 5;
  if (choice.category === "giving") return 15;
  if (choice.category === "needs") return 10;
  return 10;
}

type StoreState = {
  simulation: SimulationState | null;
  result: ResultSummary | null;
  completedMissionIds: string[];
  hasSeenOnboarding: boolean;
  totalXP: number;
  startSimulation: (scenarioId: string) => void;
  applyChoice: (eventId: string, choiceId: string) => void;
  finishSimulation: () => void;
  isMissionUnlocked: (scenarioId: string) => boolean;
  getNextMissionId: (scenarioId: string) => string | null;
  clearSession: () => void;
  resetAcademy: () => void;
  setHasSeenOnboarding: (seen: boolean) => void;
};

export const useSimulationStore = create<StoreState>()(
  persist(
    (set, get) => ({
      simulation: null,
      result: null,
      completedMissionIds: [],
      hasSeenOnboarding: false,
      totalXP: 0,

      startSimulation: (scenarioId) => {
        set({
          simulation: createInitialState(scenarioId),
          result: null,
        });
      },

      applyChoice: (eventId, choiceId) => {
        const current = get().simulation;
        if (!current || current.completed) {
          return;
        }

        const scenario = getScenarioById(current.scenarioId);
        if (!scenario) {
          return;
        }

        const event = scenario.events.find((item) => item.id === eventId);
        const choice = event?.choices.find((item) => item.id === choiceId);

        if (!event || !choice) {
          return;
        }

        const updated = applyChoiceToState(current, event, choice);
        const visibleEvents = getScenarioEvents(scenario);
        const isLastEvent =
          visibleEvents.findIndex((item: { id: string }) => item.id === event.id) ===
          visibleEvents.length - 1;

        // Award XP
        const xpGained = calculateXPForChoice(choice);
        const newTotalXP = get().totalXP + xpGained;

        set({
          simulation: {
            ...updated,
            completed: isLastEvent,
          },
          totalXP: newTotalXP,
        });

        if (isLastEvent) {
          get().finishSimulation();
        }
      },

      finishSimulation: () => {
        const current = get().simulation;
        if (!current) {
          return;
        }

        const summary = createResultSummary(current);
        const completedMissionIds = get().completedMissionIds;
        const nextCompleted =
          summary.succeeded && !completedMissionIds.includes(current.scenarioId)
            ? [...completedMissionIds, current.scenarioId]
            : completedMissionIds;

        set({
          result: summary,
          completedMissionIds: nextCompleted,
          simulation: {
            ...current,
            completed: true,
          },
        });
      },

      isMissionUnlocked: (scenarioId) => {
        const scenario = getScenarioById(scenarioId);
        if (!scenario) {
          return false;
        }

        if (scenario.missionNumber === 1) {
          return true;
        }

        const previousScenario = getPreviousMission(scenarioId);
        return previousScenario
          ? get().completedMissionIds.includes(previousScenario.id)
          : false;
      },

      getNextMissionId: (scenarioId) => getNextMission(scenarioId)?.id ?? null,

      clearSession: () =>
        set((state) => ({
          simulation: null,
          result: null,
          completedMissionIds: state.completedMissionIds,
        })),

      resetAcademy: () =>
        set({
          simulation: null,
          result: null,
          completedMissionIds: [],
          hasSeenOnboarding: false,
          totalXP: 0,
        }),

      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
    }),
    {
      name: "moneylife-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        completedMissionIds: state.completedMissionIds,
        hasSeenOnboarding: state.hasSeenOnboarding,
        totalXP: state.totalXP,
      }),
    }
  )
);