# Deadlock Custom Randomizer

A Panorama UI mod for Deadlock that replaces the vanilla random hero picker with an interactive 3-slot hero and build roulette, automatically applying roster selections and priorities in-game.

## Features

- **3-Hero Roster Roulette:** Rolls 3 unique heroes simultaneously with animated card reveals and build type roulettes.
- **Build Archetypes:** Each hero slot rolls one of three build types with equal probability:
  - Weapon (Gun)
  - Spirit
  - Melee
- **Automatic Roster Selection & Priorities:**
  - Slot 1: High Priority.
  - Slot 2: Standard Priority.
  - Slot 3: Standard Priority.
  - Clears previous hero selections automatically before applying the new roll.
  - Protected against duplicate priority cycling upon closing or accepting.
- **Hero Pool Management:**
  - Supports all 38 heroes.
  - Real-time search, select all, deselect all, and individual hero toggles.
  - Minimum 3 heroes required to roll: displays a toast notification and blocks spin if fewer than 3 heroes are selected.
- **Bilingual Support:**
  - English by default.
  - Russian language toggle available in settings ([RU] / [ENG]).

## Installation

1. Download `deadlock-custom-randomizer.vpk` from the Releases section.
2. Place the `.vpk` file into your Deadlock addons folder:
   ```
   <SteamLibrary>\steamapps\common\Deadlock\game\citadel\addons\
   ```
   *(If the `addons` folder does not exist, create it).*
3. Launch Deadlock, open the roster selection screen, and click **ROULETTE** or the **?** card.

## File Structure

```
deadlock-custom-randomizer/
├── panorama/
│   ├── layout/
│   │   └── popups/
│   │       └── citadel_popup_roster_select.xml   # UI hook for the roster selection popup
│   ├── scripts/
│   │   └── custom_randomizer.js                  # Hero pool, roulette math, and auto-priority clicks
│   └── styles/
│       └── custom_randomizer.css                 # Modal dialog, slot cards, animations, and themes
└── README.md
```

- `citadel_popup_roster_select.xml`: Overrides the native roster select popup, mounting custom roulette and settings buttons into row 5 next to the vanilla random card.
- `custom_randomizer.js`: ES6 script managing pool filtering, 3-slot spin timelines, centered build strip alignment, and automated game roster selection with priority.
- `custom_randomizer.css`: Panorama stylesheet defining card layouts, animations, transitions, and typography.
