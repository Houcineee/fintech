import mission1 from "./missions/mission1.json";
import mission2 from "./missions/mission2.json";
import mission3 from "./missions/mission3.json";
import mission4 from "./missions/mission4.json";
import mission5 from "./missions/mission5.json";
import mission6 from "./missions/mission6.json";
import type { Mission } from "../types/game";

export const missionData: Mission[] = [
  mission1,
  mission2,
  mission3,
  mission4,
  mission5,
  mission6,
] as Mission[];

export const getMissionById = (id: string): Mission | undefined =>
  missionData.find((m) => m.id === id);

export const getMissionByNumber = (num: number): Mission | undefined =>
  missionData.find((m) => m.missionNumber === num);