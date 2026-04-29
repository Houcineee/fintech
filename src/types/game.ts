export type Difficulty = "easy" | "medium" | "hard";

export type StateCondition = {
  money?: number;
  trust?: number;
  barakah?: number;
  hasItem?: string;
  flag?: string;
  previousChoice?: string;
  moneyBelow?: number;
  trustBelow?: number;
  barakahBelow?: number;
};

export type ChoiceEffects = {
  money?: number;
  trust?: number;
  barakah?: number;
  xp?: number;
  addItem?: string;
  removeItem?: string;
  setFlag?: string;
};

export type DelayedConsequence = {
  flag: string;
  description: string;
};

export type Choice = {
  id: string;
  text: string;
  effects: ChoiceEffects;
  nextSceneId?: string;
  dinarReaction?: string;
  delayedConsequence?: DelayedConsequence;
};

export type Scene = {
  id: string;
  day?: number;
  text: string;
  condition?: StateCondition;
  choices: Choice[];
};

export type GoalType = "money" | "trust" | "barakah" | "hasItem" | "flag";

export type Goal = {
  type: GoalType;
  target?: number;
  itemId?: string;
  flagId?: string;
  label: string;
};

export type Ending = {
  id: string;
  condition?: StateCondition;
  title: string;
  description: string;
  isGood: boolean;
  xpReward: number;
};

export type XPMilestone = {
  id: string;
  condition: StateCondition;
  xp: number;
  label: string;
  once: boolean;
};

export type Mission = {
  id: string;
  missionNumber: number;
  title: string;
  summary: string;
  difficulty: Difficulty;
  roleTitle: string;
  roleStory: string;
  initialMoney: number;
  initialTrust: number;
  initialBarakah: number;
  goals: Goal[];
  scenes: Scene[];
  endings: Ending[];
  milestones: XPMilestone[];
  rewardTitle: string;
  rewardIcon: string;
};

export type ChoiceRecord = {
  sceneId: string;
  choiceId: string;
  day?: number;
  effects: ChoiceEffects;
  dinarReaction?: string;
};

export type GoalProgress = {
  goal: Goal;
  achieved: boolean;
  current: number | boolean;
};

export type ResultSummary = {
  endingId: string;
  ending: Ending;
  finalMoney: number;
  finalTrust: number;
  finalBarakah: number;
  goalsAchieved: Goal[];
  xpEarned: number;
  milestonesHit: string[];
  choiceLog: ChoiceRecord[];
};

export type GameState = {
  missionId: string;
  money: number;
  trust: number;
  barakah: number;
  xp: number;
  inventory: string[];
  flags: string[];
  visitedSceneIds: string[];
  currentSceneId: string;
  choiceLog: ChoiceRecord[];
  completed: boolean;
  endingId: string | null;
  triggeredMilestones: string[];
};

export type PersistedState = {
  completedMissionIds: string[];
  totalXP: number;
  hasSeenOnboarding: boolean;
};