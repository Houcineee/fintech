import { scenarioData } from "../data";
import {
  Choice,
  ChoiceRecord,
  ResultSummary,
  Scenario,
  SimulationEvent,
  SimulationState,
  SpendingBreakdown,
} from "../types/simulation";

const initialBreakdown = (): SpendingBreakdown => ({
  needs: 0,
  wants: 0,
  giving: 0,
  income: 0,
});

export const getScenarioById = (scenarioId: string) =>
  scenarioData.find((scenario) => scenario.id === scenarioId);

export const getScenarioEvents = (scenario: Scenario): SimulationEvent[] =>
  scenario.events.sort((a, b) => a.day - b.day);

export const getNextMission = (scenarioId: string) => {
  const current = scenarioData.find((scenario) => scenario.id === scenarioId);
  if (!current) {
    return null;
  }

  return (
    scenarioData.find((scenario) => scenario.missionNumber === current.missionNumber + 1) ?? null
  );
};

export const getPreviousMission = (scenarioId: string) => {
  const current = scenarioData.find((scenario) => scenario.id === scenarioId);
  if (!current || current.missionNumber === 1) {
    return null;
  }

  return (
    scenarioData.find((scenario) => scenario.missionNumber === current.missionNumber - 1) ?? null
  );
};

export const createInitialState = (scenarioId: string): SimulationState => {
  const scenario = getScenarioById(scenarioId);

  if (!scenario) {
    throw new Error("Simulation data is incomplete.");
  }

  return {
    scenarioId,
    currentDay: 1,
    balance: scenario.startingBalance + scenario.income + (scenario.extraStartingCash ?? 0),
    healthScore: 50,
    feedback: scenario.coachIntro,
    choiceHistory: [],
    breakdown: {
      ...initialBreakdown(),
      income: scenario.income + (scenario.extraStartingCash ?? 0),
    },
    completed: false,
  };
};

const applyBreakdown = (
  breakdown: SpendingBreakdown,
  choice: Choice,
  event: SimulationEvent,
): SpendingBreakdown => {
  if (choice.trackedAmounts) {
    return {
      needs: breakdown.needs + (choice.trackedAmounts.needs ?? 0),
      wants: breakdown.wants + (choice.trackedAmounts.wants ?? 0),
      giving: breakdown.giving + (choice.trackedAmounts.giving ?? 0),
      income: breakdown.income + (choice.trackedAmounts.income ?? 0),
    };
  }

  const category = choice.category ?? event.category;
  if (!category) {
    return breakdown;
  }

  const amount = Math.abs(choice.balanceEffect || event.amount || 0);

  if (category === "income") {
    return { ...breakdown, income: breakdown.income + amount };
  }

  return {
    ...breakdown,
    [category]: breakdown[category] + amount,
  };
};

const buildFeedback = (nextBalance: number, choice: Choice, ethicalMode: boolean): string => {
  // Only use generic feedback for critical situations
  if (nextBalance < 0) {
    return "أصبحت تحت الصفر! " + choice.feedback;
  }

  if (nextBalance < 200) {
    return "تحذير: رصيدك منخفض جداً. " + choice.feedback;
  }

  // Always use the author-written feedback for normal situations
  return choice.feedback;
};

export const applyChoiceToState = (
  state: SimulationState,
  event: SimulationEvent,
  choice: Choice,
): SimulationState => {
  const nextBalance = state.balance + choice.balanceEffect;
  const nextHealth = Math.max(0, Math.min(100, state.healthScore + choice.healthEffect));
  const nextBreakdown = applyBreakdown(state.breakdown, choice, event);
  const record: ChoiceRecord = {
    eventId: event.id,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceLabel: choice.label,
    amount: choice.balanceEffect,
    category: choice.category ?? event.category ?? "needs",
    day: event.day,
    feedback: choice.feedback,
    consequence: choice.consequence,
  };

  return {
    ...state,
    currentDay: event.day,
    balance: nextBalance,
    healthScore: nextHealth,
    feedback: buildFeedback(nextBalance, choice, true),
    breakdown: nextBreakdown,
    choiceHistory: [...state.choiceHistory, record],
  };
};

export const generateInsight = (state: SimulationState, scenario: Scenario): string => {
  if (state.balance < 0) {
    return "تجاوزت حدودك المالية. صرفت بسرعة أكبر من قدرتك على تغطية الالتزامات.";
  }

  if (state.breakdown.wants > state.breakdown.needs * 0.6) {
    return "أنفقت كثيرا على الكماليات مقارنة بالاحتياجات، وهذا أضعف هدف الادخار.";
  }

  if (state.breakdown.giving > 0 && state.balance >= scenario.savingsGoal) {
    return "وازنت بين الادخار والعطاء بشكل جيد، وهذا يعكس قرارا ماليا ناضجا.";
  }

  if (state.balance >= scenario.savingsGoal) {
    return "نجحت في حماية احتياجاتك والوصول لهدف الادخار ضمن السيناريو.";
  }

  return "اقتربت من الهدف لكنك تحتاج هامشا أكبر للطوارئ وتقليلا لبعض الرغبات.";
};

const buildWins = (state: SimulationState, scenario: Scenario): string[] => {
  const wins: string[] = [];

  if (state.breakdown.wants <= state.breakdown.needs * 0.4) {
    wins.push("عرفت كيف تضع الاحتياجات قبل الكماليات.");
  }

  if (state.balance >= scenario.savingsGoal) {
    wins.push("أنهيت المهمة وأنت قريب من عقلية الادخار المستمر.");
  }

  if (state.breakdown.giving > 0) {
    wins.push("مارست العطاء بدون أن تنهار ميزانيتك.");
  }

  if (state.choiceHistory.some((item) => item.category === "income")) {
    wins.push("استفدت من الفرص الصغيرة بدل تجاهلها.");
  }

  return wins.slice(0, 3);
};

const buildRisks = (state: SimulationState): string[] => {
  const risks: string[] = [];

  if (state.balance < 300) {
    risks.push("احتياطك النقدي ضعيف وأي طارئ جديد سيؤلمك مباشرة.");
  }

  if (state.breakdown.wants > state.breakdown.needs * 0.6) {
    risks.push("الكماليات أخذت مساحة أكبر من اللازم من ميزانيتك.");
  }

  if (state.balance < 0) {
    risks.push("وصلت إلى صرف أكبر من دخلك الحالي.");
  }

  if (state.breakdown.giving === 0) {
    risks.push("الوضع الأخلاقي يحتاج قرارات أكثر توازنا بين الذات والغير.");
  }

  return risks.slice(0, 3);
};

export const createResultSummary = (state: SimulationState): ResultSummary => {
  const scenario = getScenarioById(state.scenarioId);

  if (!scenario) {
    throw new Error("Scenario was not found for the result.");
  }

  const zakatEstimate = state.balance > 0 ? Number((state.balance * 0.025).toFixed(2)) : 0;
  const savedAmount = Math.max(state.balance, 0);
  const starRating = Math.max(1, Math.min(5, Math.round(state.healthScore / 20)));
  const wins = buildWins(state, scenario);
  const risks = buildRisks(state);

  return {
    finalBalance: state.balance,
    succeeded: state.balance >= scenario.savingsGoal,
    healthScore: state.healthScore,
    savingsGoal: scenario.savingsGoal,
    breakdown: state.breakdown,
    insight: generateInsight(state, scenario),
    zakatEstimate,
    savedAmount,
    starRating,
    wins,
    risks,
    nextLesson:
      risks.length > 0
        ? "المرة القادمة اسأل نفسك: هل هذا القرار يساعدني بعد يومين أم فقط الآن؟"
        : "أنت جاهز لسيناريو أصعب: نفس الانضباط مع مفاجآت أكبر.",
  };
};
