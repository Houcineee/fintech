<div align="center">
  <br>
  
  <img src="./logo.png" alt="Dirhami Logo" width="250">
  
  <h1>درهمي | Dirhami</h1>
  
  <p><strong>Where Islamic Finance Meets Gamified Learning</strong></p>
  
  <p>An immersive Arabic financial literacy simulator that teaches ethical money management through interactive storytelling and real-world decision consequences.</p>

  <br>
</div>

---

## 🎯 The Challenge

Financial literacy rates in the MENA region remain critically low, with **less than 30% of youth** understanding basic financial concepts. Traditional education methods fail to engage Arabic-speaking learners, and existing financial apps often conflict with Islamic principles of halal earnings, riba avoidance, and zakat obligations.

**Dirhami bridges this gap**—combining culturally-relevant content with Islamic financial ethics in an engaging, game-based learning experience.

---

## ✨ What Makes Dirhami Different

### 🎮 **Gamified Learning That Sticks**
Players don't just read about finance—they live it. Through 6 progressively challenging missions, learners make real decisions, face consequences, and develop financial intuition through experience, not lectures.

### 🕌 **Islamic Finance, Authentically Taught**
Every choice reinforces core principles: distinguishing needs from wants, avoiding riba (usury), calculating zakat, and understanding barakah (blessing in wealth). Not an afterthought—the foundation.

### 🎨 **Claymorphism Design Philosophy**
Soft 3D cards, warm earth tones, and playful aesthetics create a welcoming environment that reduces anxiety around "boring" financial topics. Kid-friendly without being childish.

### ⚡ **Real-Time Consequence Engine**
Decisions immediately impact three core metrics:
- **💰 Money (درهم)** — Currency balance
- **🤝 Trust (ثقة)** — Reputation with others (0-100)
- **✨ Barakah (بركة)** — Spiritual blessing in wealth (0-100)

### 🏆 **Progression System with Purpose**
Rank up from **Musafir → Tajir → Aalim → Amir** as you complete missions. XP and badges aren't just cosmetic—they represent genuine financial competency milestones.

---

## 🚀 The Experience

### Mission Roadmap

| Mission | Title | Role | Challenge Level | Key Lesson |
|---------|-------|------|-----------------|------------|
| 1 | 🚲 دراجة درهمي | Child Saving for a Bike | ⭐ Easy | Delayed gratification, saving habits |
| 2 | 🍋 البائع الأمين | Lemonade Stand Owner | ⭐ Easy | Halal earning, honest business |
| 3 | ⚡ فخ المال السريع | Emergency Situation | ⭐⭐ Medium | Avoiding riba, ethical shortcuts |
| 4 | 🤲 الأمانة والثقة | Amanah Management | ⭐⭐ Medium | Trust, responsibility |
| 5 | 🌍 مساعدة الآخرين | Community Helper | ⭐⭐ Medium | Charity, social impact |
| 6 | 🏢 ابنِ مشروعك | Young Entrepreneur | ⭐⭐⭐ Hard | Business management, zakat calculation |

### Core Mechanics

```
┌─────────────────────────────────────────────────────┐
│  CHOICE → CONSEQUENCE → FEEDBACK → PROGRESSION     │
└─────────────────────────────────────────────────────┘
```

1. **Select Mission** — Unlock missions sequentially based on completion
2. **Understand Context** — Read your role, starting stats, and goals
3. **Make Decisions** — Navigate multi-day scenarios with branching choices
4. **See Impact** — Watch money, trust, and barakah update in real-time
5. **Achieve Endings** — Earn success, partial, or failure outcomes based on choices
6. **Unlock Rewards** — Gain XP, badges, and new mission access

---

## 🛠️ Technical Architecture

### Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native (Expo SDK 54) |
| **Language** | TypeScript 5.8 |
| **Navigation** | React Navigation 6 (Native Stack) |
| **State Management** | Zustand 4.5 + Persist Middleware |
| **Audio** | expo-audio |
| **Storage** | AsyncStorage |
| **Icons** | Ionicons (@expo/vector-icons) |
| **Fonts** | Tajawal (Arabic-optimized) |
| **Platforms** | iOS, Android, Web |

### Innovation: Declarative Mission System

Missions are defined in **JSON**—no code changes required to add new scenarios:

```typescript
// src/data/missions/mission{N}.json
{
  "id": "mission-1-bike",
  "title": "دراجة درهمي",
  "difficulty": "easy",
  "initialMoney": 100,
  "initialTrust": 30,
  "initialBarakah": 10,
  "scenes": [...],      // Story moments
  "choices": [...],     // Decision options with effects
  "endings": [...],     // Conditional outcomes
  "milestones": [...]   // Achievement triggers
}
```

**Why This Matters:** Content creators can build missions without touching React code. Teachers can customize scenarios for their classrooms. Scalability without engineering bottlenecks.

### Game Engine Features

- **Conditional Scene Logic** — Scenes appear based on flags, stats, previous choices
- **Branching Narratives** — `nextSceneId` enables complex story trees
- **Delayed Consequences** — Choices can trigger effects days later
- **Ethical Flag System** — Track positive (`refused_riba`) vs negative (`took_shady_deal`) behaviors
- **Dynamic Ending Selection** — First-match-wins algorithm evaluates conditions in priority order

---

## 🎨 Design System

### Claymorphism Aesthetic
- Soft shadows and rounded corners
- Layered depth with subtle elevation
- Warm color palette (gold, sand, ocean blue)
- Accessible contrast ratios

### Audio Experience
- **Click.mp3** — UI interactions
- **Money-coin.mp3** — Financial decisions
- Contextual feedback reinforces learning

---

## 📦 Quick Start

### Prerequisites
- Node.js v18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode + Simulator OR Android: Android Studio + Emulator

### Installation

```bash
# Clone repository
git clone <repo-url>
cd fintech

# Install dependencies
npm install

# Start development server
npm start
```

### Run on Device

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Type Checking

```bash
npm run typecheck
```

---

## 📁 Project Structure

```
fintech/
├── App.tsx                      # Root navigation stack
├── app.json                     # Expo configuration
├── assets/
│   └── sounds/                  # Audio feedback files
├── src/
│   ├── data/missions/           # JSON mission definitions
│   ├── hooks/                   # Custom React hooks (audio, etc.)
│   ├── logic/                   # Game engine & formatting
│   ├── store/                   # Zustand state management
│   ├── types/                   # TypeScript definitions
│   ├── screens/                 # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── MissionIntroScreen.tsx
│   │   ├── StoryScreen.tsx
│   │   └── EndScreen.tsx
│   ├── components/              # Reusable UI components
│   │   ├── SceneCard.tsx
│   │   ├── StatsStrip.tsx
│   │   ├── DinarCompanion.tsx
│   │   └── GoalDrawer.tsx
│   └── theme/                   # Design tokens
│       ├── colors.ts
│       ├── spacing.ts
│       ├── shadows.ts
│       └── typography.tsx
└── scripts/                     # Build & validation utilities
```

---

## 🌟 Mission JSON Format

### Scene Definition
```json
{
  "id": "s1_allowance",
  "day": 1,
  "text": "يوم الجمعة...",
  "condition": {
    "trust": 40,
    "flagAbsent": "took_riba"
  },
  "choices": [
    {
      "id": "c1_save",
      "text": "ادخر المال",
      "effects": {
        "money": 50,
        "barakah": 10,
        "xp": 25
      },
      "dinarReaction": "قرار حكيم!"
    }
  ]
}
```

### Ending Definition
```json
{
  "id": "success_ethical",
  "condition": {
    "hasItem": "bike",
    "barakah": 40,
    "flagAbsent": "took_shady_deal"
  },
  "title": "دراجة مباركة",
  "isGood": true,
  "xpReward": 150
}
```

---

## 🔮 Roadmap

- [ ] **Mission Editor** — Web-based visual mission creator
- [ ] **Multiplayer Mode** — Family/teacher dashboard
- [ ] **Advanced Analytics** — Learning progress tracking
- [ ] **Community Missions** — User-generated scenarios
- [ ] **Additional Languages** — Urdu, Malay, English
- [ ] **AR Integration** — Virtual "spending" in real environments

---

## 📜 License

Private project — all rights reserved.

---
