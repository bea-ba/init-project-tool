# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dreamwell (formerly Sleepzy) is a sleep tracking application built with Vite, React, TypeScript, shadcn-ui, and Tailwind CSS. The app helps users track sleep sessions, set alarms, log sleep notes with activities, and view insights about their sleep patterns.

## Development Commands

```bash
# Development
npm run dev              # Start development server (port 8080)

# Building
npm run build            # Production build
npm run build:dev        # Development build (includes dev tools)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Testing - Unit Tests (Vitest)
npm test                 # Run all unit tests
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate coverage report

# Testing - E2E (Playwright)
npm run test:e2e         # Run all E2E tests (auto-starts dev server)
npm run test:e2e:ui      # Interactive E2E test runner
npm run test:e2e:headed  # Run E2E tests with browser UI
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:report  # Show HTML test report
npm run test:e2e:codegen # Generate E2E tests from browser interactions
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

### Testing Architecture

The app has comprehensive test coverage using Vitest (unit) and Playwright (E2E):

**Unit Testing (Vitest)**:
- 78+ tests covering utils, components, and hooks
- jsdom environment with comprehensive browser API mocks
- Coverage reporting with v8 provider
- Located in `src/test/` directory

**E2E Testing (Playwright)**:
- 60+ tests across Chrome, Firefox, and Safari
- Mobile viewports (Pixel 5, iPhone 12) testing
- WCAG 2.1 AA accessibility compliance with Axe integration
- PWA offline functionality testing
- Test files located in `tests/e2e/`

### Internationalization (i18n)

Multi-language support with i18next:
- 4 languages: English (en), Portuguese (pt), Spanish (es), Slovak (sk)
- Automatic language detection via localStorage and browser navigator
- Persistent language preference
- Translation files in `public/locales/`

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

### Build Configuration

**Vite Configuration**:
- Manual code splitting with optimized chunks:
  - `vendor-react`: React core, React Router
  - `vendor-radix`: All Radix UI components
  - `vendor-recharts`: Charts and d3 dependencies
  - `vendor-framer`: Animation library
- Development server runs on port 8080 with IPv6 support
- Path alias `@/` maps to `src/` directory
- PWA support with service worker for offline functionality

### Styling Conventions

- Uses Tailwind CSS with custom design tokens defined in `tailwind.config.ts`
- shadcn-ui components follow a consistent pattern with `cn()` utility for class merging
- Theme support (dark/light/auto) managed via SleepContext and applied to document root
- Inter font for UI text, DM Sans for headings
- Custom sleep-themed color palette with CSS variables

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

### TypeScript Configuration
- Two-tier configuration: `tsconfig.json` (strict) and `tsconfig.app.json` (strict disabled)
- Development prioritizes rapid iteration over strict typing
- `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters` are disabled

### Development Practices
- Use Lucide React for icons
- Toast notifications: shadcn Toaster for general notifications, Sonner for form feedback
- Run `npm test` before commits to ensure unit tests pass
- E2E tests cover complete user journeys - run with `npm run test:e2e` before major releases
- Accessibility compliance is mandatory - all features must meet WCAG 2.1 AA standards

### Platform Integration
- Project linked to Lovable.dev for deployment
- `lovable-tagger` plugin provides component tagging in development
- PWA functionality enabled with offline support

### Security & Privacy
- All data encrypted with crypto-js before localStorage storage
- No server-side data storage - complete privacy
- Export/import functionality for data portability
