const fs = require("fs");
const path = require("path");

const missionsDir = path.join(__dirname, "..", "src", "data", "missions");
const mission1 = require(path.join(missionsDir, "mission1.json"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function evaluateCondition(condition, state) {
  if (!condition) return true;

  if (condition.money !== undefined && state.money < condition.money) return false;
  if (condition.trust !== undefined && state.trust < condition.trust) return false;
  if (condition.barakah !== undefined && state.barakah < condition.barakah) return false;
  if (condition.moneyBelow !== undefined && state.money >= condition.moneyBelow) return false;
  if (condition.trustBelow !== undefined && state.trust >= condition.trustBelow) return false;
  if (condition.barakahBelow !== undefined && state.barakah >= condition.barakahBelow) {
    return false;
  }
  if (condition.flag && !state.flags.includes(condition.flag)) return false;
  if (condition.flagAbsent && state.flags.includes(condition.flagAbsent)) return false;
  if (condition.hasItem && !state.inventory.includes(condition.hasItem)) return false;
  if (condition.notHasItem && state.inventory.includes(condition.notHasItem)) return false;
  if (
    condition.previousChoice &&
    !state.choiceLog.some((choice) => choice.choiceId === condition.previousChoice)
  ) {
    return false;
  }
  if (
    condition.notPreviousChoice &&
    state.choiceLog.some((choice) => choice.choiceId === condition.notPreviousChoice)
  ) {
    return false;
  }

  return true;
}

function getFirstScene(mission) {
  const scene = mission.scenes.find((item) => !item.condition);
  assert(scene, `${mission.id} has no unconditional first scene`);
  return scene;
}

function getNextScene(mission, state, lastChoice) {
  if (lastChoice.nextSceneId) {
    const explicitScene = mission.scenes.find((scene) => scene.id === lastChoice.nextSceneId);
    if (
      explicitScene &&
      !state.visitedSceneIds.includes(explicitScene.id) &&
      evaluateCondition(explicitScene.condition, state)
    ) {
      return explicitScene;
    }
  }

  const eligible = mission.scenes
    .map((scene, index) => ({ scene, index }))
    .filter(
      ({ scene }) =>
        !state.visitedSceneIds.includes(scene.id) && evaluateCondition(scene.condition, state)
    )
    .sort((a, b) => (a.scene.day ?? 999) - (b.scene.day ?? 999) || a.index - b.index);

  return eligible[0]?.scene ?? null;
}

function applyChoice(state, mission, choiceId) {
  const scene = mission.scenes.find((item) => item.id === state.currentSceneId);
  assert(scene, `Scene ${state.currentSceneId} was not found`);

  const choice = scene.choices.find((item) => item.id === choiceId);
  assert(choice, `Choice ${choiceId} is not available at ${scene.id}`);
  assert(
    state.money + (choice.effects.money ?? 0) >= 0,
    `Choice ${choiceId} is unaffordable with ${state.money} MAD`
  );

  const inventory = [...state.inventory];
  if (choice.effects.addItem && !inventory.includes(choice.effects.addItem)) {
    inventory.push(choice.effects.addItem);
  }

  const flags = [...state.flags];
  if (choice.effects.setFlag && !flags.includes(choice.effects.setFlag)) {
    flags.push(choice.effects.setFlag);
  }

  const nextState = {
    ...state,
    money: state.money + (choice.effects.money ?? 0),
    trust: Math.max(0, Math.min(100, state.trust + (choice.effects.trust ?? 0))),
    barakah: Math.max(0, Math.min(100, state.barakah + (choice.effects.barakah ?? 0))),
    inventory,
    flags,
    choiceLog: [...state.choiceLog, { choiceId }],
    visitedSceneIds: [...new Set([...state.visitedSceneIds, scene.id])],
  };

  const nextScene = getNextScene(mission, nextState, choice);
  if (!nextScene) return { ...nextState, completed: true };

  return {
    ...nextState,
    currentSceneId: nextScene.id,
    visitedSceneIds: [...new Set([...nextState.visitedSceneIds, nextScene.id])],
  };
}

function runPath(mission, choiceIds) {
  const firstScene = getFirstScene(mission);
  let state = {
    missionId: mission.id,
    money: mission.initialMoney,
    trust: mission.initialTrust,
    barakah: mission.initialBarakah,
    inventory: [],
    flags: [],
    choiceLog: [],
    visitedSceneIds: [firstScene.id],
    currentSceneId: firstScene.id,
    completed: false,
  };

  for (const choiceId of choiceIds) {
    state = applyChoice(state, mission, choiceId);
  }

  return state;
}

function runPathWithScenes(mission, choiceIds) {
  const visitedScenes = [];
  const firstScene = getFirstScene(mission);
  let state = {
    missionId: mission.id,
    money: mission.initialMoney,
    trust: mission.initialTrust,
    barakah: mission.initialBarakah,
    inventory: [],
    flags: [],
    choiceLog: [],
    visitedSceneIds: [firstScene.id],
    currentSceneId: firstScene.id,
    completed: false,
  };

  for (const choiceId of choiceIds) {
    visitedScenes.push(state.currentSceneId);
    state = applyChoice(state, mission, choiceId);
  }

  return { state, visitedScenes };
}

function resolveEnding(mission, state) {
  return mission.endings.find((ending) => evaluateCondition(ending.condition, state));
}

function validateMissionGraph() {
  for (const file of fs.readdirSync(missionsDir).filter((item) => item.endsWith(".json"))) {
    const mission = require(path.join(missionsDir, file));
    const sceneIds = new Set(mission.scenes.map((scene) => scene.id));

    for (const scene of mission.scenes) {
      assert(
        scene.choices.length !== 1,
        `${mission.id}:${scene.id} has only one choice; convert it to a real branch or fold it into another decision`
      );
      for (const choice of scene.choices) {
        assert(
          !choice.nextSceneId || sceneIds.has(choice.nextSceneId),
          `${mission.id}:${scene.id}:${choice.id} points to missing scene ${choice.nextSceneId}`
        );
      }
    }

    const serialized = JSON.stringify(mission);
    for (const banned of ["ингредиенты", "heißt", "�", "。"]) {
      assert(!serialized.includes(banned), `${mission.id} contains broken copy token: ${banned}`);
    }
  }
}

function validateMission1() {
  assert(
    mission1.goals.some((goal) => goal.type === "hasItem" && goal.itemId === "bike"),
    "Mission 1 must use bike ownership as the main goal"
  );
  assert(
    mission1.scenes.find((scene) => scene.id === "s12_bike_shop")?.condition?.notHasItem ===
      "bike",
    "Mission 1 final bike shop must be hidden after the bike is owned"
  );

  const fullPriceState = runPath(mission1, [
    "c1_save_all",
    "c2_used_supplies",
    "c3_resist_toy",
    "c4_give_10",
    "c6_work_full",
    "c7_accept_shady",
    "c8_lend_20",
    "c9_accept_return",
    "c10_keep_saving",
    "c14_accept_gratefully",
    "c12_buy_bike",
  ]);
  const fullPriceEnding = resolveEnding(mission1, fullPriceState);
  assert(fullPriceState.inventory.includes("bike"), "Full-price path should add the bike");
  assert(fullPriceEnding?.isGood, "Full-price bike purchase should reach a good ending");

  const saleRun = runPathWithScenes(mission1, [
    "c1_save_all",
    "c2_used_supplies",
    "c3_resist_toy",
    "c4_give_10",
    "c6_work_full",
    "c7_accept_shady",
    "c8_lend_20",
    "c9_accept_return",
    "c10_buy_sale",
    "c14_accept_gratefully",
  ]);
  const saleState = saleRun.state;
  const saleEnding = resolveEnding(mission1, saleState);
  assert(saleState.inventory.includes("bike"), "Sale path should add the bike");
  assert(saleEnding?.isGood, "Sale bike purchase should reach a good ending");
  assert(
    !saleRun.visitedScenes.includes("s12_bike_shop") && saleState.currentSceneId !== "s12_bike_shop",
    "Sale bike purchase should not route to the final bike shop"
  );

  const noBikeState = runPath(mission1, [
    "c1_save_all",
    "c2_used_supplies",
    "c3_resist_toy",
    "c4_give_10",
    "c6_work_full",
    "c7_accept_shady",
    "c8_lend_20",
    "c9_accept_return",
    "c10_keep_saving",
    "c14_accept_gratefully",
    "c12_keep_saving",
  ]);
  const noBikeEnding = resolveEnding(mission1, noBikeState);
  assert(noBikeState.money >= 300, "No-bike path should still demonstrate reaching 300 MAD");
  assert(!noBikeState.inventory.includes("bike"), "No-bike path should not own the bike");
  assert(!noBikeEnding?.isGood, "Reaching 300 MAD without buying the bike should not pass");
}

validateMissionGraph();
validateMission1();

console.log("Mission validation passed.");
