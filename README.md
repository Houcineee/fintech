# MoneyLife Simulator (درهمي)

An Arabic-language financial literacy educational app built with React Native (Expo). Players progress through 5 sequential missions, making day-to-day financial decisions grounded in Islamic financial ethics — learning to distinguish needs from wants, practice moderation, and manage money wisely.

## Features

- **5 Missions of increasing difficulty** — from a student managing a weekly budget to a young professional balancing savings, zakat, and charity
- **Interactive simulation** — make choices, see consequences, and track your balance & health score in real time
- **Islamic finance principles** — halal earning, avoiding israf (extravagance), zakat calculation, and charitable giving
- **Arabic-first RTL interface** — fully Arabic UI with Cairo font and right-to-left layout
- **Gamification** — XP system, rank progression (Musafir → Tajir → Aalim → Amir), and star ratings
- **Persisted progress** — mission completion and XP survive app restarts via AsyncStorage

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript 5.8 |
| Navigation | React Navigation 6 (native-stack) |
| State | Zustand 4.5 with persist middleware |
| Fonts | @expo-google-fonts/cairo (9 weights) |
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

## Project Structure

```
fintech/
├── App.tsx                      # Root: navigation stack + error boundary
├── app.json                     # Expo config
├── index.js                     # Expo entry point
├── src/
│   ├── data/
│   │   ├── scenarios.json        # 5 mission definitions (events, choices, amounts)
│   │   └── index.ts             # Typed scenario re-exports
│   ├── logic/
│   │   ├── simulation.ts         # Core engine: state, choices, results, insights
│   │   └── format.ts             # Currency formatter (MAD, Arabic locale)
│   ├── store/
│   │   └── simulationStore.ts    # Zustand store: state, actions, XP/rank, persistence
│   ├── types/
│   │   ├── simulation.ts         # All TypeScript types (Scenario, Choice, etc.)
│   │   └── navigation.ts         # React Navigation route param types
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Mission map with progress & rank display
│   │   ├── SimulationScreen.tsx   # Active gameplay: events, choices, consequences
│   │   └── ResultScreen.tsx       # Post-mission analysis & advice
│   ├── components/
│   │   ├── EventCard.tsx          # Event display + choice buttons
│   │   ├── ChoiceButton.tsx       # Styled button (primary/secondary)
│   │   └── Gamification.tsx      # Badge & StarRating components
│   └── theme/
│       ├── colors.ts             # Dark neon color palette + glow shadows
│       ├── spacing.ts            # Spacing constants
│       └── typography.tsx        # Cairo font loader + weight-mapped Text
```

## How It Works

1. **Select a mission** on the home screen (missions unlock sequentially)
2. **Read the scenario intro** — your role, starting balance, and savings goal
3. **Make choices** for each financial event across multiple days
4. **See consequences** — balance and health score update in real time
5. **Review your results** — spending breakdown, wins, risks, and advice

Each choice affects your **balance** (MAD) and **health score** (0–100). To pass a mission, your final balance must meet or exceed the savings goal. Ethical choices (halal earning, charity) earn bonus XP toward your rank.

## Missions

| # | Title | Role | Difficulty |
|---|---|---|---|
| 1 | Needs before Wants | Student with weekly budget | Easy |
| 2 | Halal Earning & Responsibility | Working student | Easy |
| 3 | Student with Tight Budget | University student | Medium |
| 4 | Engineer with Bigger Responsibilities | Young engineer | Medium |
| 5 | Savings, Zakat, and Mercy | Income manager | Advanced |

## License

Private project — all rights reserved.