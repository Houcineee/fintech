import type {
  Choice,
  Ending,
  GameState,
  Mission,
  Scene,
  StateCondition,
  XPMilestone,
  Goal,
  GoalProgress,
  ResultSummary,
} from "../types/game";

export const evaluateCondition = (
  condition: StateCondition | undefined,
  state: GameState
): boolean => {
  if (!condition) return true;

  if (condition.money !== undefined && state.money < condition.money) return false;
  if (condition.trust !== undefined && state.trust < condition.trust) return false;
  if (condition.barakah !== undefined && state.barakah < condition.barakah) return false;
  if (condition.moneyBelow !== undefined && state.money >= condition.moneyBelow) return false;
  if (condition.trustBelow !== undefined && state.trust >= condition.trustBelow) return false;
  if (condition.barakahBelow !== undefined && state.barakah >= condition.barakahBelow)
    return false;
  if (condition.flag && !state.flags.includes(condition.flag)) return false;
  if (condition.hasItem && !state.inventory.includes(condition.hasItem)) return false;
  if (
    condition.previousChoice &&
    !state.choiceLog.some((c) => c.choiceId === condition.previousChoice)
  )
    return false;

  return true;
};

export const getNextScene = (
  mission: Mission,
  state: GameState,
  lastChoice?: Choice
): Scene | null => {
  if (lastChoice?.nextSceneId) {
    const explicitScene = mission.scenes.find((s) => s.id === lastChoice.nextSceneId);
    if (explicitScene) return explicitScene;
  }

  const eligible = mission.scenes.filter(
    (scene) =>
      !state.visitedSceneIds.includes(scene.id) && evaluateCondition(scene.condition, state)
  );

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => (a.day ?? 999) - (b.day ?? 999));

  return eligible[0];
};

export const getFirstScene = (mission: Mission): Scene => {
  const firstScene = mission.scenes.find((s) => !s.condition);
  if (!firstScene) throw new Error(`Mission ${mission.id} has no unconditional first scene`);
  return firstScene;
};

export const resolveEnding = (mission: Mission, state: GameState): Ending => {
  for (const ending of mission.endings) {
    if (evaluateCondition(ending.condition, state)) {
      return ending;
    }
  }

  return {
    id: "incomplete",
    title: "حاول مرة أخرى",
    description: "درهمي لم يكمل رحلته بعد. هل يمكنك مساعدته بشكل أفضل؟",
    isGood: false,
    xpReward: 10,
  };
};

export const evaluateMilestones = (
  mission: Mission,
  state: GameState,
  triggeredMilestones: string[]
): XPMilestone[] => {
  return mission.milestones.filter(
    (m) =>
      !triggeredMilestones.includes(m.id) && evaluateCondition(m.condition, state)
  );
};

export const applyChoice = (
  state: GameState,
  choice: Choice,
  sceneId: string,
  day?: number
): GameState => {
  const newInventory = [...state.inventory];
  if (choice.effects.addItem && !newInventory.includes(choice.effects.addItem)) {
    newInventory.push(choice.effects.addItem);
  }
  if (choice.effects.removeItem) {
    const idx = newInventory.indexOf(choice.effects.removeItem);
    if (idx !== -1) newInventory.splice(idx, 1);
  }

  const newFlags = choice.effects.setFlag && !state.flags.includes(choice.effects.setFlag)
    ? [...state.flags, choice.effects.setFlag]
    : state.flags;

  const newMoney = state.money + (choice.effects.money ?? 0);
  const newTrust = Math.max(0, Math.min(100, state.trust + (choice.effects.trust ?? 0)));
  const newBarakah = Math.max(0, Math.min(100, state.barakah + (choice.effects.barakah ?? 0)));

  const record = {
    sceneId,
    choiceId: choice.id,
    choiceText: choice.text,
    day,
    effects: choice.effects,
    dinarReaction: choice.dinarReaction,
  };

  return {
    ...state,
    money: newMoney,
    trust: newTrust,
    barakah: newBarakah,
    xp: state.xp + (choice.effects.xp ?? 0),
    inventory: newInventory,
    flags: newFlags,
    visitedSceneIds: [...state.visitedSceneIds, sceneId],
    choiceLog: [...state.choiceLog, record],
  };
};

export const evaluateGoalProgress = (goals: Goal[], state: GameState): GoalProgress[] => {
  return goals.map((goal) => {
    switch (goal.type) {
      case "money":
        return {
          goal,
          achieved: state.money >= (goal.target ?? 0),
          current: state.money,
        };
      case "trust":
        return {
          goal,
          achieved: state.trust >= (goal.target ?? 0),
          current: state.trust,
        };
      case "barakah":
        return {
          goal,
          achieved: state.barakah >= (goal.target ?? 0),
          current: state.barakah,
        };
      case "hasItem":
        return {
          goal,
          achieved: state.inventory.includes(goal.itemId ?? ""),
          current: state.inventory.includes(goal.itemId ?? ""),
        };
      case "flag":
        return {
          goal,
          achieved: state.flags.includes(goal.flagId ?? ""),
          current: state.flags.includes(goal.flagId ?? ""),
        };
    }
  });
};

export const createResultSummary = (
  mission: Mission,
  state: GameState
): ResultSummary => {
  const ending = resolveEnding(mission, state);
  const goalProgress = evaluateGoalProgress(mission.goals, state);
  const achieved = goalProgress.filter((g) => g.achieved).map((g) => g.goal);

  return {
    endingId: ending.id,
    ending,
    finalMoney: state.money,
    finalTrust: state.trust,
    finalBarakah: state.barakah,
    goalsAchieved: achieved,
    xpEarned: ending.xpReward,
    milestonesHit: state.triggeredMilestones,
    choiceLog: state.choiceLog,
  };
};