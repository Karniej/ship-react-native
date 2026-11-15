# How to Use This Guide with AI Coding Assistants

This guide is designed to work seamlessly with AI coding assistants like Claude, ChatGPT, Cursor, GitHub Copilot, and others. Here's how to get the most out of it.

---

## Why This Guide + AI = Superpower

Traditional tutorials give you code. This guide gives you **context**.

When you feed this guide to an LLM, it understands:

- The architecture patterns you're using
- The specific libraries and versions
- Best practices for React Native + Expo
- Common pitfalls to avoid

**Result:** The AI generates code that actually fits your project, not generic examples.

---

## Quick Start: Feed This to Your AI

### Option 1: Full Context (Recommended)

Copy and paste this entire guide into your AI assistant's context window, then start asking questions:

```
[Paste the entire guide here]

---

I'm building a [describe your app]. Help me implement [specific feature] following the patterns in this guide.
```

### Option 2: Section-Specific Context

For focused help, paste only the relevant sections:

```
[Paste Part 1: Tech Stack + Appendix C: Essential Features]

---

Help me set up dark mode with the theme system described above.
```

### Option 3: Use as System Prompt (Claude/ChatGPT)

For ongoing sessions, set this as your system prompt:

```
You are a React Native expert helping me build an app using:
- Expo SDK 54 with Expo Router
- Supabase for backend and auth
- RevenueCat for payments
- Zustand for state management
- TanStack Query for server state
- TypeScript in strict mode

Follow these patterns:
- Use functional components with hooks
- Prefer Zustand stores over Context
- Always use Row Level Security in Supabase
- Never expose API keys in client code
- Use Edge Functions for sensitive operations

When generating code, match the style and patterns from this guide.
```

---

## Effective Prompts for Each Phase

### Day 1-2: Project Setup

```
Using the Expo + Supabase setup from this guide, create:
1. The complete app/_layout.tsx with proper providers
2. A Supabase client with AsyncStorage persistence
3. The folder structure for a [type] app

Follow the patterns exactly as shown in the guide.
```

### Day 3: Core Feature Development

```
I'm building [describe feature]. Based on the guide's patterns:
1. Create the Supabase table schema with RLS policies
2. Create a Zustand store for the feature state
3. Create the main screen component
4. Create an Edge Function if API calls are needed

Use the exact patterns from Part 1 and Appendix A.
```

### Day 4: Payments

```
Following the RevenueCat setup in this guide:
1. Create the usePremium hook as shown
2. Create a paywall screen with package selection
3. Create a useCredits hook for a freemium model with [X] free daily uses

Match the code style exactly.
```

### Day 5-6: Polish

```
Based on Appendix C, implement these features for my app:
1. Dark mode with ThemeContext
2. Push notifications with the patterns shown
3. Onboarding flow (3 screens about [topics])
4. Form validation for [form type]

Use the exact component patterns from the guide.
```

---

## Prompt Templates

### Generate a New Screen

```
Create a new screen for [purpose] following this guide's patterns:
- Use SafeAreaView and proper insets
- Use the theme colors from ThemeContext
- Add keyboard handling for any inputs
- Include loading and error states
- Match the Button and styling patterns shown

The screen should [describe functionality].
```

### Generate a New Component

```
Create a reusable [component name] component that:
- [List requirements]
- Uses the theme system from this guide
- Includes TypeScript props interface
- Follows the styling patterns (StyleSheet, spacing constants)
- Includes haptic feedback on press if interactive
```

### Generate a Supabase Table + CRUD

```
For a [feature] in my app, create:
1. SQL table schema with appropriate columns
2. RLS policies (users can only access their own data)
3. TypeScript type matching the schema
4. CRUD functions using Supabase client
5. TanStack Query hooks for the operations

Follow the database patterns from Appendix D.
```

### Generate an Edge Function

```
Create a Supabase Edge Function that:
- [Describe what it does]
- Includes rate limiting (max X requests per minute)
- Validates the user is authenticated
- Handles errors gracefully
- Returns proper JSON responses

Follow the Edge Function patterns from Appendix A.
```

### Debug an Issue

```
I'm getting this error in my React Native app:
[Paste error]

My setup follows this guide:
- Expo SDK 54
- Supabase for backend
- [Other relevant details]

Here's my code:
[Paste relevant code]

What's wrong and how do I fix it following the patterns in this guide?
```

---

## Best Practices for AI-Assisted Development

### DO:

1. **Provide context** - Always mention you're using the patterns from this guide
2. **Be specific** - "Create a login screen" vs "Create a button"
3. **Ask for explanations** - "Explain why this pattern is used"
4. **Iterate** - "Now add error handling" → "Now add loading state"
5. **Verify** - Always review generated code before using

### DON'T:

1. **Don't blindly copy** - Understand what the code does
2. **Don't skip types** - Ask for TypeScript types if missing
3. **Don't ignore security** - Always check for exposed keys, missing RLS
4. **Don't forget tests** - Ask for test cases for critical logic

---

## Section-by-Section AI Usage

| Section                    | Best Used For                                     |
| -------------------------- | ------------------------------------------------- |
| Part 1: Tech Stack         | Initial project setup, architecture decisions     |
| Part 2: 7-Day Roadmap      | Day-by-day implementation guidance                |
| Part 3: Checklist          | Pre-submission verification                       |
| Part 4: AI Assets          | App Store content creation (use ChatGPT directly) |
| Part 5: 7 Mistakes         | Debugging common issues                           |
| Part 6: Quick Reference    | Quick lookups, code snippets                      |
| Appendix A: Edge Functions | API integrations, AI features                     |
| Appendix B: Store Setup    | App Store/Play Store configuration                |
| Appendix C: Features       | Adding specific features (auth, push, i18n)       |
| Appendix D: Database       | Schema design for different app types             |

---

## Example AI Session

Here's a real example of how to use this guide with an AI:

**You:**

```
I've attached the React Native Launch Blueprint guide. I'm building a habit tracking app.

Based on Part 1 and Appendix D (Habit Tracker Schema), create:
1. The complete database schema for habits and completions
2. A Zustand store for habit management
3. The main habits list screen

Follow the exact patterns from the guide.
```

**AI Response:** [Generates code matching the guide's patterns]

**You:**

```
Great! Now based on Appendix C, add:
1. Haptic feedback when completing a habit
2. Offline detection with a banner
3. Dark mode support

Use the exact implementations from the guide.
```

**AI Response:** [Generates code matching the guide's patterns]

---

## Troubleshooting AI Responses

### AI generates code that doesn't match the guide

```
That doesn't match the patterns from this guide. Please regenerate using:
- Zustand (not Redux or Context)
- Supabase (not Firebase)
- Expo Router (not React Navigation)
- The exact styling patterns shown (StyleSheet, theme colors)
```

### AI is missing security considerations

```
Please update this code to:
1. Add RLS policies as shown in the guide
2. Move API keys to Edge Functions
3. Add proper error handling
4. Validate user authentication
```

### AI generates outdated code

```
Please update to use:
- Expo SDK 54 patterns
- expo-router v4 syntax
- TanStack Query v5 syntax
- Current Supabase JS v2 patterns
```

---

## Combining with ShipReactNative Boilerplate

If you use the free, open-source [ShipReactNative](https://github.com/Karniej/ship-react-native) boilerplate, you can be even more specific:

```
I'm using the ShipReactNative boilerplate which follows this guide's patterns.

The existing codebase has:
- lib/supabase.ts - Supabase client
- stores/useAuthStore.ts - Auth state
- contexts/ThemeContext.tsx - Theme system
- components/ui/* - Base UI components

Please create a new feature for [description] that integrates with these existing patterns.
```

---

## Summary

1. **Feed the guide to your AI** for context-aware code generation
2. **Reference specific sections** for focused help
3. **Use the prompt templates** for common tasks
4. **Always verify** the generated code matches the patterns
5. **Iterate and refine** until the code is production-ready

The more context you give your AI, the better the output. This guide provides that context.

---

_Pro Tip: Save this page as a reference for your AI prompts. The patterns here will help you get consistent, high-quality code generation throughout your project._
