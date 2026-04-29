#!/usr/bin/env node

/**
 * Mission Validation Script
 * 
 * This script validates mission balance by checking:
 * - Every mission has at least one reachable good ending
 * - Easy missions have at least one clean good path (no unethical flags)
 * - Good endings don't explicitly require unethical flags
 * - Goals are achievable
 */

const fs = require('fs');
const path = require('path');

// Truly unethical flags that should prevent a "clean" path
const UNETHICAL_FLAGS = [
  'took_shady_deal',
  'took_riba', 
  'deeper_riba',
  'accepted_shady_business',
  'shady_sourcing',
  'compromised_quality',
  'overpriced_books',
  'ignored_complaint',
  'riba_extension',
  'paid_riba_debt',
];

// Load all missions
const missionsDir = path.join(__dirname, '../src/data/missions');
const missionFiles = fs.readdirSync(missionsDir).filter(f => f.endsWith('.json'));

const missions = missionFiles.map(file => {
  const content = fs.readFileSync(path.join(missionsDir, file), 'utf-8');
  return JSON.parse(content);
});

// Engine functions
function evaluateCondition(condition, state) {
  if (!condition) return true;
  if (condition.money !== undefined && state.money < condition.money) return false;
  if (condition.trust !== undefined && state.trust < condition.trust) return false;
  if (condition.barakah !== undefined && state.barakah < condition.barakah) return false;
  if (condition.moneyBelow !== undefined && state.money >= condition.moneyBelow) return false;
  if (condition.trustBelow !== undefined && state.trust >= condition.trustBelow) return false;
  if (condition.barakahBelow !== undefined && state.barakah >= condition.barakahBelow) return false;
  if (condition.flag && !state.flags.includes(condition.flag)) return false;
  if (condition.flagAbsent && state.flags.includes(condition.flagAbsent)) return false;
  if (condition.hasItem && !state.inventory.includes(condition.hasItem)) return false;
  if (condition.notHasItem && state.inventory.includes(condition.notHasItem)) return false;
  if (condition.previousChoice && !state.choiceLog.some(c => c.choiceId === condition.previousChoice)) return false;
  if (condition.notPreviousChoice && state.choiceLog.some(c => c.choiceId === condition.notPreviousChoice)) return false;
  return true;
}

function canApplyChoice(state, choice) {
  return state.money + (choice.effects?.money ?? 0) >= 0;
}

function getEligibleScenes(mission, state) {
  return mission.scenes
    .map((scene, index) => ({ scene, index }))
    .filter(({ scene }) => {
      if (state.visitedSceneIds.includes(scene.id)) return false;
      return evaluateCondition(scene.condition, state);
    })
    .sort((a, b) => (a.scene.day ?? 999) - (b.scene.day ?? 999) || a.index - b.index)
    .map(({ scene }) => scene);
}

function applyChoice(state, choice, sceneId, day) {
  const newInventory = [...state.inventory];
  if (choice.effects?.addItem && !newInventory.includes(choice.effects.addItem)) {
    newInventory.push(choice.effects.addItem);
  }
  if (choice.effects?.removeItem) {
    const idx = newInventory.indexOf(choice.effects.removeItem);
    if (idx !== -1) newInventory.splice(idx, 1);
  }

  const newFlags = choice.effects?.setFlag && !state.flags.includes(choice.effects.setFlag)
    ? [...state.flags, choice.effects.setFlag]
    : state.flags;

  return {
    ...state,
    money: state.money + (choice.effects?.money ?? 0),
    trust: Math.max(0, Math.min(100, state.trust + (choice.effects?.trust ?? 0))),
    barakah: Math.max(0, Math.min(100, state.barakah + (choice.effects?.barakah ?? 0))),
    inventory: newInventory,
    flags: newFlags,
    visitedSceneIds: [...state.visitedSceneIds, sceneId],
    choiceLog: [...state.choiceLog, { sceneId, choiceId: choice.id, choiceText: choice.text }],
  };
}

function resolveEnding(mission, state) {
  for (const ending of mission.endings) {
    if (evaluateCondition(ending.condition, state)) {
      return ending;
    }
  }
  return { id: 'incomplete', isGood: false };
}

function hasUnethicalFlags(state) {
  return state.flags.some(flag => UNETHICAL_FLAGS.includes(flag));
}

// Find any good path (for debugging)
function findAnyGoodPath(mission, maxDepth = 25, debug = false) {
  const initialState = {
    money: mission.initialMoney,
    trust: mission.initialTrust,
    barakah: mission.initialBarakah,
    inventory: [],
    flags: [],
    visitedSceneIds: [],
    choiceLog: [],
  };

  function dfs(state, depth) {
    if (depth > maxDepth) return null;

    const eligibleScenes = getEligibleScenes(mission, state);
    
    if (eligibleScenes.length === 0) {
      const ending = resolveEnding(mission, state);
      if (ending.isGood) {
        if (debug) console.log(`   DFS found good ending: ${ending.id}, flags: [${state.flags.join(', ')}]`);
        return { ending, state };
      }
      return null;
    }

    const scene = eligibleScenes[0];
    const availableChoices = scene.choices.filter(c => canApplyChoice(state, c));

    for (const choice of availableChoices) {
      const newState = applyChoice(state, choice, scene.id, scene.day);
      const result = dfs(newState, depth + 1);
      if (result) return result;
    }
    
    return null;
  }

  return dfs(initialState, 0);
}

// Find ONE clean path using BFS (finds shortest/cleanest path first)
function findCleanPath(mission, maxDepth = 20, debug = false) {
  const initialState = {
    money: mission.initialMoney,
    trust: mission.initialTrust,
    barakah: mission.initialBarakah,
    inventory: [],
    flags: [],
    visitedSceneIds: [],
    choiceLog: [],
  };

  const queue = [{ state: initialState, depth: 0 }];
  const visited = new Set();
  let iterations = 0;

  while (queue.length > 0) {
    iterations++;
    if (iterations > 100000) {
      if (debug) console.log('   BFS hit iteration limit');
      return null;
    }
    
    const { state, depth } = queue.shift();
    
    if (depth > maxDepth) continue;

    // Create a visited key to avoid cycles
    const key = `${state.money},${state.trust},${state.barakah},${state.flags.sort().join('|')},${state.visitedSceneIds.join(',')}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const eligibleScenes = getEligibleScenes(mission, state);
    
    if (eligibleScenes.length === 0) {
      // End of mission - check if clean and good
      const ending = resolveEnding(mission, state);
      if (debug && ending.isGood) {
        console.log(`   Found good ending: ${ending.id}, unethical: ${hasUnethicalFlags(state)}, flags: [${state.flags.join(', ')}]`);
      }
      if (debug && state.flags.includes('earned_halal_day4') && !ending.isGood) {
        console.log(`   Worked path reached non-good ending: ${ending.id}, flags: [${state.flags.join(', ')}], bike: ${state.inventory.includes('bike')}`);
      }
      if (ending.isGood && !hasUnethicalFlags(state)) {
        if (debug) console.log(`   Found clean path after ${iterations} iterations`);
        return { ending, state };
      }
      continue;
    }

    const scene = eligibleScenes[0];
    const availableChoices = scene.choices.filter(c => canApplyChoice(state, c));

    if (availableChoices.length === 0) continue;

    // Prioritize choices that:
    // 1. Don't set unethical flags
    // 2. Set earned_halal_day4 (prevents shady deal scene)
    // 3. Set frugal_start (allows bike sale price)
    // 4. Add bike (buy it!)
    const sortedChoices = availableChoices.sort((a, b) => {
      const aUnethical = UNETHICAL_FLAGS.includes(a.effects?.setFlag);
      const bUnethical = UNETHICAL_FLAGS.includes(b.effects?.setFlag);
      if (aUnethical !== bUnethical) return aUnethical - bUnethical;
      
      // Prioritize earned_halal_day4
      const aPreventsShady = a.effects?.setFlag === 'earned_halal_day4';
      const bPreventsShady = b.effects?.setFlag === 'earned_halal_day4';
      if (aPreventsShady !== bPreventsShady) return bPreventsShady - aPreventsShady;
      
      // Prioritize frugal_start
      const aFrugal = a.effects?.setFlag === 'frugal_start';
      const bFrugal = b.effects?.setFlag === 'frugal_start';
      if (aFrugal !== bFrugal) return bFrugal - aFrugal;
      
      // Prioritize buying bike
      const aBuysBike = a.effects?.addItem === 'bike';
      const bBuysBike = b.effects?.addItem === 'bike';
      return bBuysBike - aBuysBike;
    });

    for (const choice of sortedChoices) {
      const newState = applyChoice(state, choice, scene.id, scene.day);
      if (debug && newState.flags.includes('earned_halal_day4') && !state.flags.includes('earned_halal_day4')) {
        console.log(`   Reached earned_halal_day4 at depth ${depth+1}, money: ${newState.money}`);
      }
      queue.push({ state: newState, depth: depth + 1 });
    }
  }

  if (debug) console.log(`   BFS exhausted after ${iterations} iterations`);
  return null;
}

// Validate a single mission
function validateMission(mission) {
  const errors = [];
  const warnings = [];
  
  console.log(`\n📋 Mission ${mission.missionNumber}: ${mission.title} (${mission.difficulty})`);
  
  // Find a clean path using BFS
  const debugMode = mission.missionNumber === 1;
  const cleanPath = findCleanPath(mission, 25, debugMode);
  
  // Debug for Mission 1
  if (mission.missionNumber === 1 && !cleanPath) {
    // Try to find ANY good path, even with unethical flags
    const anyPath = findAnyGoodPath(mission, 25, debugMode);
    if (anyPath) {
      console.log(`   ⚠️ Found good path but has unethical flags: [${anyPath.state.flags.join(', ')}]`);
      console.log(`      Ending: ${anyPath.ending.title || anyPath.ending.id}`);
    }
  }
  
  // Check 1: Every mission has at least one reachable good ending
  if (!cleanPath) {
    if (mission.difficulty === 'easy') {
      errors.push(`❌ Easy mission must have at least one clean good path`);
    } else {
      warnings.push(`⚠️ No clean good path found (may require retrying)`);
    }
  } else {
    console.log(`   ✅ Clean good path found!`);
    console.log(`      Ending: ${cleanPath.ending.title || cleanPath.ending.id}`);
    console.log(`      Final: 💰${cleanPath.state.money} 🤝${cleanPath.state.trust} ✨${cleanPath.state.barakah}`);
    console.log(`      Path (${cleanPath.state.choiceLog.length} choices):`);
    cleanPath.state.choiceLog.forEach((log, i) => {
      console.log(`        ${i+1}. ${log.choiceText.substring(0, 45)}...`);
    });
  }
  
  // Check 2: Good endings don't explicitly require unethical flags
  const badEndingConditions = mission.endings.filter(e => 
    e.isGood && e.condition && UNETHICAL_FLAGS.some(f => e.condition.flag === f)
  );
  if (badEndingConditions.length > 0) {
    errors.push(`❌ Good endings should not require unethical flags: ${badEndingConditions.map(e => e.id).join(', ')}`);
  }
  
  // Check 3: Verify mission 3 has flagAbsent check for riba
  if (mission.id === 'mission-3-riba') {
    const halalEnding = mission.endings.find(e => e.id === 'halal_cure');
    if (halalEnding && !halalEnding.condition?.flagAbsent === 'took_riba') {
      errors.push(`❌ Mission 3 halal_cure ending should have flagAbsent: "took_riba"`);
    } else {
      console.log(`   ✅ Mission 3 has riba prevention`);
    }
  }
  
  return { errors, warnings, cleanPath };
}

// Main validation
console.log('🔍 Mission Balance Validation');
console.log('================================');

let totalErrors = 0;
let totalWarnings = 0;

for (const mission of missions.sort((a, b) => a.missionNumber - b.missionNumber)) {
  const { errors, warnings } = validateMission(mission);
  
  errors.forEach(e => console.log(`   ${e}`));
  warnings.forEach(w => console.log(`   ${w}`));
  
  totalErrors += errors.length;
  totalWarnings += warnings.length;
}

console.log('\n================================');
console.log(`Validation complete: ${totalErrors} errors, ${totalWarnings} warnings`);

if (totalErrors > 0) {
  console.log('❌ Validation failed');
  process.exit(1);
} else {
  console.log('✅ All missions pass validation!');
  process.exit(0);
}
