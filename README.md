# EventMind AI 🎉

AI-powered event planning for **Weddings**, **Birthday Parties**, and **Community Events** — built with Next.js 16 and Google Gemini.

## Features

- 💰 **Smart Budget Planner** — AI breaks down your total budget across categories with saving tips
- 📅 **Auto Timeline** — Generates a personalised milestone checklist based on your event date
- ✅ **Vendor Checklist** — AI-curated vendor list with booking tips and Q&A prompts
- 💡 **Creative Ideas** — Themes, décor, activities, food menus, favors, and unique touches
- 🤖 **AI Chat** — Conversational Gemini-powered assistant for any event question

## Tech Stack

- **Framework**: Next.js 16 (App Router, webpack mode)
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Language**: TypeScript

## Getting Started

### 1. (Optional) Get a Gemini API Key

Visit [Google AI Studio](https://aistudio.google.com/) and create a free API key.

### 2. Configure Environment Variables

Open `.env.local` in the project root and replace the placeholder if you want AI-generated content:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

The Budget, Timeline, Vendors, Ideas, and AI Chat tabs work without an API key using deterministic offline responses. When a valid key is configured, these features use Gemini for richer personalized output.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
npm run build
npm run start
```

### 6. Test and Validate Changes

The project has unit tests for its deterministic offline planning responses, plus
linting, TypeScript validation, and a production build check:

```bash
# Run the full validation suite
npm test

# Run only unit tests
npm run test:unit

# Keep unit tests running while developing
npm run test:watch
```

Add new behavior-focused tests under `tests/` with a `.test.ts` or `.test.tsx`
extension. `npm test` is the recommended pre-commit check and should remain
green as the application evolves.

## Project Structure

```
event-planner/
├── app/
│   ├── page.tsx                    # Home — event type selection
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind v4 + global styles
│   ├── plan/[type]/page.tsx        # Planning dashboard (Budget/Timeline/Vendors/Ideas/Chat)
│   └── api/gemini/
│       ├── budget/route.ts         # Budget breakdown API
│       ├── timeline/route.ts       # Timeline milestones API
│       ├── vendors/route.ts        # Vendor checklist API
│       ├── ideas/route.ts          # Creative ideas API
│       └── chat/route.ts           # AI chat API
├── public/                         # Static assets
├── postcss.config.mjs              # PostCSS config for Tailwind v4
├── next.config.ts                  # Next.js config (webpack mode)
└── .env.local                      # API keys (git-ignored)
```

## Usage

1. Open the app and choose your event type: **Wedding**, **Birthday**, or **Community Event**
2. Fill in the **Event Details** panel (name, date, budget, guest count, etc.)
3. Use the tabs to generate AI content:
   - **Budget** → Click *Generate Budget*
   - **Timeline** → Add a date first, then click *Generate Timeline*
   - **Vendors** → Click *Generate Vendor List*
   - **Ideas** → Click *Generate Ideas*
   - **AI Chat** → Ask anything about your event

## Notes

- The SWC binary warning (`not a valid Win32 application`) is a known cosmetic issue — the app falls back to WASM bindings and works correctly.
- All AI calls go to the server-side API routes, so your `GEMINI_API_KEY` is never exposed to the browser.
