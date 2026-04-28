export type Difficulty = "سهل" | "متوسط" | "متقدم";

export type EventType =
  | "fixed_expense"
  | "optional_spending"
  | "emergency"
  | "opportunity"
  | "ethical";

export type Category = "needs" | "wants" | "giving" | "income";

export type Choice = {
  id: string;
  label: string;
  balanceEffect: number;
  healthEffect: number;
  category?: Category;
  trackedAmounts?: Partial<SpendingBreakdown>;
  feedback: string;
  consequence: string;
  ethicalTag?: "halal" | "non_halal" | "charity";
};

export type SimulationEvent = {
  id: string;
  day: number;
  type: EventType;
  title: string;
  description: string;
  amount?: number;
  category?: Category;
  ethicalOnly?: boolean;
  coachPrompt?: string;
  lesson?: string;
  choices: Choice[];
};

export type Scenario = {
  id: string;
  missionNumber: number;
  title: string;
  summary: string;
  goalLabel: string;
  coachIntro: string;
  learningGoal: string;
  rewardTitle: string;
  shariaFocus: string;
  roleTitle: string;
  roleStory: string;
  conceptTag: string;
  difficulty: Difficulty;
  durationDays: number;
  income: number;
  savingsGoal: number;
  startingBalance: number;
  extraStartingCash?: number;
  events: SimulationEvent[];
};

export type ChoiceRecord = {
  eventId: string;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  amount: number;
  category: Category;
  day: number;
  feedback: string;
  consequence: string;
};

export type SpendingBreakdown = {
  needs: number;
  wants: number;
  giving: number;
  income: number;
};

export type ResultSummary = {
  finalBalance: number;
  succeeded: boolean;
  healthScore: number;
  savingsGoal: number;
  breakdown: SpendingBreakdown;
  insight: string;
  zakatEstimate: number;
  savedAmount: number;
  starRating: number;
  wins: string[];
  risks: string[];
  nextLesson: string;
};

export type SimulationState = {
  scenarioId: string;
  currentDay: number;
  balance: number;
  healthScore: number;
  feedback: string;
  choiceHistory: ChoiceRecord[];
  breakdown: SpendingBreakdown;
  completed: boolean;
};

export type MissionProgress = {
  completedMissionIds: string[];
};
