# MoneyLife Simulator (درهمي)

An Arabic-language financial literacy educational app built with React Native (Expo). Players progress through sequential missions, making day-to-day financial decisions grounded in Islamic financial ethics — learning to distinguish needs from wants, practice moderation, and manage money wisely.

## Features

- **6 Missions of increasing difficulty** — from a child saving for a bike to a young entrepreneur managing a business
- **Interactive simulation** — make choices, see consequences, and track money, trust, and barakah in real time
- **Islamic finance principles** — halal earning, avoiding riba (usury), zakat calculation, and charitable giving
- **Claymorphism UI** — Kid-friendly design with soft 3D cards, warm colors, and playful aesthetics
- **Gamification** — XP system, rank progression (Musafir → Tajir → Aalim → Amir), mission badges
- **Persisted progress** — mission completion and XP survive app restarts via AsyncStorage
- **Sound feedback** — Distinct sounds for money choices, UI interactions, and achievements

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript 5.8 |
| Navigation | React Navigation 6 (native-stack) |
| State | Zustand 4.5 with persist middleware |
| Fonts | @expo-google-fonts/tajawal |
| Audio | expo-audio |
| Icons | Ionicons (@expo/vector-icons) |
| Storage | @react-native-async-storage/async-storage |
| Platforms | iOS, Android, Web |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Emulator

### Install

```bash
git clone <repo-url>
cd fintech
npm install
```

### Run

```bash
# Start the Expo dev server
npm start

# Run on a specific platform
npm run android
npm run ios
npm run web
```

### Type Checking

```bash
npm run typecheck
```

### Clear Metro Cache (if needed)

```bash
npx expo start --clear
```

## Project Structure

```
fintech/
├── App.tsx                      # Root: navigation stack
├── app.json                     # Expo config
├── assets/
│   └── sounds/                  # Audio files (click.mp3, money-coin.mp3)
├── src/
│   ├── data/
│   │   ├── missions/            # Mission JSON files (mission1.json - mission6.json)
│   │   └── index.ts             # Mission data exports
│   ├── hooks/
│   │   └── useChoiceSounds.ts   # Audio playback hook
│   ├── logic/
│   │   ├── engine.ts            # Core game engine (conditions, effects, endings)
│   │   └── format.ts            # Currency formatter
│   ├── store/
│   │   └── gameStore.ts         # Zustand store: state, XP, progress, persistence
│   ├── types/
│   │   ├── game.ts              # TypeScript types (Mission, Scene, Choice, etc.)
│   │   └── navigation.ts        # React Navigation route types
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Mission roadmap with progress
│   │   ├── MissionIntroScreen.tsx # Mission setup and goals
│   │   ├── StoryScreen.tsx      # Active gameplay: scenes and choices
│   │   └── EndScreen.tsx        # Mission results and rewards
│   ├── components/
│   │   ├── SceneCard.tsx        # Scene display + choice buttons
│   │   ├── StatsStrip.tsx       # Money/Trust/Barakah display
│   │   ├── DinarCompanion.tsx   # Guide character with reactions
│   │   └── GoalDrawer.tsx       # Mission goals panel
│   └── theme/
│       ├── colors.ts            # Claymorphism color palette
│       ├── spacing.ts           # Design tokens
│       ├── shadows.ts           # Clay shadows
│       └── typography.tsx       # Tajawal font + Text component
```

## How It Works

1. **Select a mission** on the home roadmap (missions unlock sequentially)
2. **Read the intro** — your role, starting stats, and goals
3. **Make choices** across multiple days, each affecting your stats
4. **See consequences** — money, trust, and barakah update in real time
5. **Achieve endings** — based on your choices and goal completion

Each choice affects:
- **Money (درهم)** — Your currency balance
- **Trust (ثقة)** — Reputation with others (0-100)
- **Barakah (بركة)** — Spiritual blessing in your wealth (0-100)

To succeed, achieve the mission goals while maintaining high trust and barakah.

---

# 📋 Mission JSON Format Specification

This section explains how to create or generate mission files for the game.

## File Location

Missions are stored in:
```
src/data/missions/mission{N}.json
```

Where `{N}` is the mission number (1, 2, 3, etc.)

## Root Object

```json
{
  "id": "mission-1-bike",           // Unique ID: mission-{number}-{name}
  "missionNumber": 1,               // Integer starting from 1
  "title": "دراجة درهمي",           // Arabic mission title
  "summary": "Help Dirhami save...", // Short description
  "difficulty": "easy",             // "easy" | "medium" | "hard"
  "roleTitle": "طفل يريد دراجة",    // Player's role
  "roleStory": "Every day Dirhami...", // Backstory text
  "initialMoney": 100,              // Starting money (dirhams)
  "initialTrust": 30,               // Starting trust (0-100)
  "initialBarakah": 10,             // Starting barakah (0-100)
  "goals": [...],                   // Array of Goal objects
  "scenes": [...],                  // Array of Scene objects
  "endings": [...],                 // Array of Ending objects
  "milestones": [...],              // Array of Milestone objects
  "rewardTitle": "شارة الترتيب",    // Badge name
  "rewardIcon": "trophy"            // Ionicons icon name
}
```

## Goals

What the player must achieve:

```json
{
  "type": "money",                  // "money" | "trust" | "barakah" | "hasItem" | "flag"
  "target": 200,                    // Required value (for numeric types)
  "itemId": "bike",                 // For "hasItem": must have this item
  "flagId": "paid_debt",            // For "flag": must have this flag
  "label": "Collect 200 dirhams"    // Display text (Arabic)
}
```

## Scenes

Story moments presented to the player:

```json
{
  "id": "s1_allowance",             // Unique ID: s{day}_{description}
  "day": 1,                         // In-game day (optional)
  
  // Optional condition - scene only appears if ALL conditions met
  "condition": {
    "flag": "bought_basics",        // Must have this flag
    "flagAbsent": "took_riba",      // Must NOT have this flag
    "moneyBelow": 150,              // Money < 150
    "trust": 40,                    // Trust >= 40
    "barakah": 30,                  // Barakah >= 30
    "hasItem": "bike",              // Must have item
    "previousChoice": "c1_save"     // Must have chosen this
  },
  
  "text": "In the Friday morning...", // Narrative text (Arabic)
  "choices": [...]                  // Array of Choice objects
}
```

## Choices

Options the player can select:

```json
{
  "id": "c1_save_all",              // Unique choice ID
  "text": "Save it all for the bike", // Button text (Arabic)
  
  "effects": {                      // All optional
    "money": -50,                   // Add/subtract money
    "trust": 10,                    // Add/subtract trust
    "barakah": 5,                   // Add/subtract barakah
    "xp": 15,                       // XP gained
    "addItem": "bike",              // Add item to inventory
    "removeItem": "old_item",       // Remove item
    "setFlag": "saved_money"        // Set story flag
  },
  
  // Optional fields
  "dinarReaction": "Quiet decision...", // Guide's feedback
  "nextSceneId": "s2_special",      // Jump to specific scene
  "delayedConsequence": {           // Effect shown later
    "flag": "savings_grew",
    "description": "Your savings grew!"
  }
}
```

## Endings

Mission outcomes (evaluated in order, first match wins):

```json
{
  "id": "success_bike",             // Unique ending ID
  
  // Optional conditions
  "condition": {
    "hasItem": "bike",
    "barakah": 40,
    "flagAbsent": "took_shady_deal"
  },
  
  "title": "Bike with Barakah",     // Ending title (Arabic)
  "description": "Dirhami rode...", // Ending story (Arabic)
  "isGood": true,                   // true = success, false = fail
  "xpReward": 120                   // XP bonus
}
```

**Note:** A default "incomplete" ending is automatic if no conditions match.

## Milestones

Bonus achievements for extra XP:

```json
{
  "id": "refused_riba",
  "condition": {
    "flag": "refused_riba"          // Triggered when flag is set
  },
  "xp": 25,                         // Bonus XP awarded
  "label": "Resisted Riba",         // Achievement name (Arabic)
  "once": true                      // Award only once per playthrough
}
```

---

## Game Engine Logic

### Scene Selection Flow
1. Filter scenes by `condition` (must all be true)
2. Sort by `day` (lowest first), then by array order
3. Pick first unvisited eligible scene
4. If `nextSceneId` specified in previous choice, go there instead

### Ending Selection Flow
1. After last scene, check endings in array order
2. First ending where ALL conditions match = winner
3. If none match → "incomplete" ending (isGood: false)

### Ethical Flag System
Use flags to track player ethics:
- **Positive flags:** `refused_riba`, `earned_halal`, `gave_charity`
- **Negative flags:** `took_shady_deal`, `took_riba`, `ignored_complaint`
- Use `flagAbsent` in good endings to prevent them after unethical choices

---

## Missions

| # | Title | Role | Difficulty |
|---|---|---|---|
| 1 | دراجة درهمي | Child saving for a bike | Easy |
| 2 | البائع الأمين | Lemonade stand owner | Easy |
| 3 | فخ المال السريع | Child facing financial emergency | Medium |
| 4 | الأمانة والثقة | Young person managing amanah | Medium |
| 5 | مساعدة الآخرين | Community helper | Medium |
| 6 | ابنِ مشروعك | Young entrepreneur | Hard |

---

## Sound System

Audio files in `assets/sounds/`:
- **click.mp3** — UI button presses (Home screen, navigation)
- **money-coin.mp3** — Choices involving money changes

The sound system is in `src/hooks/useChoiceSounds.ts`:
- Money choices → money-coin.mp3
- Everything else → click.mp3

---

## License

Private project — all rights reserved.
