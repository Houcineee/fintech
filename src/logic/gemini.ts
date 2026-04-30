import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import type { Mission } from "../types/game";

// Get API key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const CONDITION_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    money: { type: SchemaType.NUMBER },
    trust: { type: SchemaType.NUMBER },
    barakah: { type: SchemaType.NUMBER },
    moneyBelow: { type: SchemaType.NUMBER },
    trustBelow: { type: SchemaType.NUMBER },
    barakahBelow: { type: SchemaType.NUMBER },
    flag: { type: SchemaType.STRING },
    flagAbsent: { type: SchemaType.STRING },
    hasItem: { type: SchemaType.STRING },
    notHasItem: { type: SchemaType.STRING },
    previousChoice: { type: SchemaType.STRING },
    notPreviousChoice: { type: SchemaType.STRING },
  },
};

const MISSION_SCHEMA: Schema = {
  description: "A financial literacy mission/quest",
  type: SchemaType.OBJECT,
  properties: {
    id: { type: SchemaType.STRING },
    missionNumber: { type: SchemaType.NUMBER },
    title: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    difficulty: { type: SchemaType.STRING, enum: ["easy", "medium", "hard"], format: "enum" },
    roleTitle: { type: SchemaType.STRING },
    roleStory: { type: SchemaType.STRING },
    initialMoney: { type: SchemaType.NUMBER },
    initialTrust: { type: SchemaType.NUMBER },
    initialBarakah: { type: SchemaType.NUMBER },
    goals: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, enum: ["money", "trust", "barakah", "hasItem", "flag"], format: "enum" },
          target: { type: SchemaType.NUMBER },
          itemId: { type: SchemaType.STRING },
          flagId: { type: SchemaType.STRING },
          label: { type: SchemaType.STRING },
        },
        required: ["type", "label"],
      },
    },
    scenes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          day: { type: SchemaType.NUMBER },
          text: { type: SchemaType.STRING },
          condition: CONDITION_SCHEMA,
          choices: {
            type: SchemaType.ARRAY,
            minItems: 2,
            maxItems: 3,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                text: { type: SchemaType.STRING },
                effects: {
                  type: SchemaType.OBJECT,
                  properties: {
                    money: { type: SchemaType.NUMBER },
                    trust: { type: SchemaType.NUMBER },
                    barakah: { type: SchemaType.NUMBER },
                    xp: { type: SchemaType.NUMBER },
                    addItem: { type: SchemaType.STRING },
                    removeItem: { type: SchemaType.STRING },
                    setFlag: { type: SchemaType.STRING },
                  },
                },
                nextSceneId: { type: SchemaType.STRING },
                dinarReaction: { type: SchemaType.STRING },
              },
              required: ["id", "text", "effects"],
            },
          },
        },
        required: ["id", "text", "choices"],
      },
    },
    endings: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          condition: CONDITION_SCHEMA,
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          isGood: { type: SchemaType.BOOLEAN },
          xpReward: { type: SchemaType.NUMBER },
        },
        required: ["id", "title", "description", "isGood", "xpReward"],
      },
    },
    milestones: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          condition: CONDITION_SCHEMA,
          xp: { type: SchemaType.NUMBER },
          label: { type: SchemaType.STRING },
          once: { type: SchemaType.BOOLEAN },
        },
        required: ["id", "condition", "xp", "label", "once"],
      },
    },
    rewardTitle: { type: SchemaType.STRING },
    rewardIcon: { type: SchemaType.STRING },
  },
  required: [
    "id",
    "missionNumber",
    "title",
    "summary",
    "difficulty",
    "roleTitle",
    "roleStory",
    "initialMoney",
    "initialTrust",
    "initialBarakah",
    "goals",
    "scenes",
    "endings",
    "milestones",
    "rewardTitle",
    "rewardIcon",
  ],
};

const SYSTEM_PROMPT = `
You are an expert game designer for a financial literacy app called "Dirhami", specializing in Islamic Financial Ethics.
Your goal is to generate an interactive, branching educational story (Mission) in Arabic.

Core Educational Mandate:
- Integrate Islamic principles of wealth: 
  1. Halal Earnings (الكسب الحلال): Avoiding cheating, interest (Riba), and gambling.
  2. Social Responsibility (المسؤولية الاجتماعية): Encouraging Zakat and Sadaqah.
  3. Ethical Consumption (الاستهلاك الرشيد): Avoiding waste (Israf) and prioritizing needs over wants.
  4. Honesty in Trade (الأمانة في التجارة): Clarity in contracts and avoiding deception (Gharar).

Gameplay Rules:
- MANDATORY: Every single scene MUST have exactly 2 or 3 distinct choices. NEVER leave a scene without choices.
- Choices must have clear financial or ethical consequences on Money, Trust, or Barakah.
- Characters: "Dinar" (دينار) is a wise mentor who provides feedback in Modern Standard Arabic (Fusha) based on the ethical quality of the player's choice.

Guidelines:
- Everything must be in Arabic.
- Ensure logical flow. Each 'nextSceneId' must point to a valid scene ID.
- Provide a mix of positive and negative effects for choices.
- Include 5-7 scenes.
- Create 3 distinct endings: a "Barakah" ending (high ethics), a "Wealthy but Lost" ending (high money, low trust/barakah), and a "Lesson Learned" ending (failure/bankruptcy).
- Use the provided JSON schema strictly.
`;

export const generateMission = async (userPrompt: string): Promise<Mission | null> => {
  if (!API_KEY) {
    console.error("Gemini API Key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY.");
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: MISSION_SCHEMA,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      `Generate a financial literacy mission based on this situation: ${userPrompt}`
    );

    const responseText = result.response.text();
    const mission = JSON.parse(responseText) as Mission;
    
    // Safety check for mission IDs to avoid collisions
    const timestamp = Date.now();
    mission.id = `gen-${timestamp}`;
    mission.missionNumber = 99; // Placeholder for custom missions

    return mission;
  } catch (error) {
    console.error("Error generating mission with Gemini:", error);
    return null;
  }
};
