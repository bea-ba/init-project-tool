# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dreamwell (formerly Sleepzy) is a sleep tracking application built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS. The app helps users track sleep sessions, set alarms, log sleep notes with activities, and view insights about their sleep patterns.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (includes dev tools)
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### State Management

The app uses React Context API for global state management via `SleepContext` (`src/contexts/SleepContext.tsx`). This context provides:
- `sessions`: All sleep tracking sessions
- `alarms`: User-configured alarms
- `notes`: Sleep-related notes with activities
- `settings`: User preferences
- `activeSleep`: Currently active sleep session (if tracking)

Access context in components using the `useSleep()` hook. All state changes are persisted to localStorage automatically.

### Data Persistence

All application data persists in localStorage with the `dreamwell_` prefix:
- `dreamwell_sessions`: Sleep session records
- `dreamwell_alarms`: Alarm configurations
- `dreamwell_notes`: Sleep notes with activity tracking
- `dreamwell_settings`: User settings and preferences

The storage layer (`src/utils/localStorage.ts`) handles serialization/deserialization, including Date object conversions.

### Routing Structure

App uses React Router with a desktop sidebar + mobile bottom navigation pattern:
- `/` - Dashboard (overview of sleep metrics)
- `/sleep-tracker` - Start/stop sleep tracking
- `/alarm-setup` - Configure alarms
- `/sleep-history` - View past sleep sessions
- `/sleep-notes` - Log activities and mood
- `/insights` - Analytics and trends
- `/sounds` - Relaxation sounds library
- `/settings` - User preferences
- `/premium` - Premium feature upgrades

### Type System

Core types defined in `src/types/sleep.ts`:
- `SleepSession`: Sleep tracking data with phases (light/deep/REM/awake), quality score, interruptions
- `Alarm`: Alarm configuration with smart wake, snooze settings
- `SleepNote`: Daily notes with activities (exercise, caffeine, stress, screen time, etc.)
- `UserSettings`: User preferences including sleep goals, theme, notifications
- `RelaxationSound`: Sound library items

### Sleep Calculations

The `src/utils/sleepCalculations.ts` module provides sleep-specific logic:
- `calculateSleepQuality()`: Computes 0-100 quality score based on duration (30%), efficiency (25%), interruptions (20%), phase distribution (15%), and consistency (10%)
- `generateSleepPhases()`: Creates realistic sleep phase distribution across 90-minute cycles
- `calculateSleepDebt()`: Tracks cumulative sleep debt over 7 days against user's goal
- Formatting and color utilities for displaying metrics

### Component Organization

```
src/
├── components/
│   ├── layout/         # Navigation components (sidebar, mobile nav)
│   ├── sleep/          # Sleep-specific components (quality cards, debt indicators)
│   └── ui/             # shadcn-ui components (auto-generated, avoid manual edits)
├── pages/              # Route components (one per route)
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (cn helper for class merging)
├── types/              # TypeScript type definitions
└── utils/              # Business logic utilities
```

### Styling Conventions

- Uses Tailwind CSS with custom design tokens defined in `tailwind.config.ts`
- shadcn-ui components follow a consistent pattern with `cn()` utility for class merging
- Theme support (dark/light/auto) managed via SleepContext and applied to document root
- Path alias `@/` maps to `src/` directory

## Working with Data

When modifying sleep sessions, alarms, or notes:
1. Use the appropriate SleepContext method (`addSession`, `updateAlarm`, etc.)
2. Context methods automatically handle localStorage persistence
3. Dates in storage are serialized - the storage layer handles conversion to Date objects
4. Always use existing type definitions from `src/types/sleep.ts`

## shadcn-ui Components

The `src/components/ui/` directory contains auto-generated shadcn-ui components. When adding new UI components:
- Follow the shadcn-ui CLI pattern for consistency
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class merging
- Components are built on Radix UI primitives with Tailwind styling

## Key Conventions

- TypeScript strict mode is partially disabled (see `tsconfig.json`) - `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters` are set to false
- Use Lucide React for icons
- Toast notifications use both shadcn Toaster and Sonner for different use cases
- Server runs on port 8080 with IPv6 support enabled
