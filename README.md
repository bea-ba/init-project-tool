# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/199a2365-76ec-4698-a27e-a8728da88d4b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/199a2365-76ec-4698-a27e-a8728da88d4b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Howler.js (audio playback)
- Playwright (E2E testing)

## Testing

This project includes comprehensive testing:

### Unit Tests (Vitest)
```bash
npm test              # Run unit tests
npm run test:ui       # Run with UI
npm run test:coverage # Generate coverage report
```

### E2E Tests (Playwright)
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Run with interactive UI
npm run test:e2e:headed  # Run with visible browser
npm run test:e2e:debug   # Debug tests step by step
npm run test:e2e:report  # View test report
```

See [e2e/README.md](./e2e/README.md) for detailed E2E testing documentation.

### Test Coverage

- **78 unit tests** covering utils, components, and hooks
- **60+ E2E tests** covering:
  - Sleep tracking flows
  - Navigation and routing
  - Alarm setup
  - Sleep notes
  - WCAG 2.1 AA accessibility
  - PWA offline functionality
  - Complete user journeys

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/199a2365-76ec-4698-a27e-a8728da88d4b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
