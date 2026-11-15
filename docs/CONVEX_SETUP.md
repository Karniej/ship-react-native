# Convex Backend Setup

This guide covers setting up Convex as your backend for Ship React Native.

## Overview

Convex provides:

- Real-time reactive database
- Built-in authentication
- Serverless functions (queries, mutations, actions)
- Automatic TypeScript type generation
- File storage

## Prerequisites

- Node.js 18+
- A Convex account ([convex.dev](https://convex.dev))

## Setup Steps

### 1. Install Convex

```bash
npm install convex @convex-dev/auth
```

### 2. Initialize Convex Project

```bash
npx convex init
```

This creates:

- `convex/` directory with configuration
- Prompts you to create/select a project on Convex

### 3. Start Development Server

```bash
npx convex dev
```

Keep this running in a separate terminal. It:

- Syncs your schema and functions to Convex
- Generates TypeScript types in `convex/_generated/`
- Shows real-time logs

### 4. Configure Environment

Add to your `.env` file:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

Get this URL from your Convex dashboard or from the `npx convex dev` output.

### 5. Add API Keys to Convex

In your Convex dashboard (Settings > Environment Variables), add:

| Variable              | Description                                |
| --------------------- | ------------------------------------------ |
| `OPENAI_API_KEY`      | OpenAI API key for DALL-E, Whisper, GPT-4V |
| `REPLICATE_API_TOKEN` | Replicate API token for Flux, SDXL         |
| `ELEVENLABS_API_KEY`  | ElevenLabs API key for text-to-speech      |

## Project Structure

```
convex/
├── _generated/          # Auto-generated types (don't edit)
│   ├── api.d.ts
│   ├── api.js
│   ├── dataModel.d.ts
│   └── server.d.ts
├── schema.ts            # Database schema
├── auth.ts              # Authentication config
├── http.ts              # HTTP endpoints (webhooks)
├── profiles.ts          # Profile queries/mutations
├── credits.ts           # Credit management
├── generations.ts       # Generation history
├── pushTokens.ts        # Push notification tokens
├── rateLimits.ts        # Rate limiting
├── subscriptions.ts     # RevenueCat integration
└── ai/                  # AI generation actions
    ├── chat.ts
    ├── imageGeneration.ts
    ├── replicate.ts
    ├── textToSpeech.ts
    ├── transcription.ts
    ├── video.ts
    └── vision.ts
```

## Database Schema

The schema is defined in `convex/schema.ts`:

### profiles

Stores user profile information.

| Field              | Type      | Description                         |
| ------------------ | --------- | ----------------------------------- |
| `userId`           | `string`  | Convex auth user ID                 |
| `email`            | `string?` | User email (optional for anonymous) |
| `fullName`         | `string?` | Display name                        |
| `avatarUrl`        | `string?` | Profile picture URL                 |
| `isPremium`        | `boolean` | Premium subscription status         |
| `premiumExpiresAt` | `number?` | Expiration timestamp                |
| `settings`         | `object?` | User preferences                    |

### userCredits

Tracks AI generation credits.

| Field              | Type     | Description           |
| ------------------ | -------- | --------------------- |
| `userId`           | `string` | User ID               |
| `creditsRemaining` | `number` | Available credits     |
| `creditsUsedTotal` | `number` | Lifetime credits used |
| `lastRefillAt`     | `number` | Last refill timestamp |

### generations

Logs all AI generations.

| Field         | Type      | Description                           |
| ------------- | --------- | ------------------------------------- |
| `userId`      | `string`  | User ID                               |
| `provider`    | `string`  | AI provider (openai, replicate, etc.) |
| `model`       | `string`  | Model used                            |
| `prompt`      | `string?` | Input prompt                          |
| `inputData`   | `any?`    | Additional input                      |
| `outputUrl`   | `string?` | Generated content URL                 |
| `outputData`  | `any?`    | Additional output                     |
| `creditsUsed` | `number`  | Credits consumed                      |
| `contentType` | `string`  | image, video, audio, text             |

## Authentication

Convex Auth is pre-configured with:

- **Email/Password** - Traditional sign up/in
- **Magic Link** - Passwordless email
- **Anonymous** - No credentials required
- **OAuth** - Google and Apple (requires additional setup)

### Using Auth in React Native

```typescript
import { useConvexAuthState, useConvexAuthActions } from "@/hooks/useConvexAuth";

function AuthExample() {
  const { isLoading, isAuthenticated, user } = useConvexAuthState();
  const { signInWithEmail, signUpWithEmail, signOut } = useConvexAuthActions();

  // Sign up
  await signUpWithEmail("user@example.com", "password123", "John Doe");

  // Sign in
  await signInWithEmail("user@example.com", "password123");

  // Anonymous sign in
  await signInAnonymously();

  // Sign out
  await signOut();
}
```

## Queries and Mutations

### Reading Data (Queries)

Queries are reactive - they automatically update when data changes.

```typescript
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function MyComponent() {
  // Automatically updates when profile changes
  const profile = useQuery(api.profiles.getCurrentProfile);
  const credits = useQuery(api.credits.getCurrentCredits);
  const generations = useQuery(api.generations.listUserGenerations, { limit: 10 });

  if (profile === undefined) {
    return <Loading />;
  }

  return <Text>{profile.fullName}</Text>;
}
```

### Writing Data (Mutations)

```typescript
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function UpdateProfile() {
  const updateProfile = useMutation(api.profiles.updateProfile);

  const handleSave = async () => {
    await updateProfile({
      fullName: "New Name",
      avatarUrl: "https://example.com/avatar.jpg",
    });
  };
}
```

### AI Actions

Actions run server-side code (external API calls).

```typescript
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

function GenerateImage() {
  const generateImage = useAction(api.ai.imageGeneration.generateImage);

  const handleGenerate = async () => {
    const result = await generateImage({
      prompt: "A sunset over mountains",
      model: "dall-e-3",
    });

    if (result.success) {
      console.log("Image URL:", result.url);
    }
  };
}
```

## Webhooks

HTTP endpoints for external services are in `convex/http.ts`.

### RevenueCat Webhook

Configure in RevenueCat dashboard:

```
URL: https://your-project.convex.site/webhooks/revenuecat
Method: POST
```

The webhook:

1. Validates the request
2. Updates user's premium status
3. Logs the subscription event

## Deployment

### Development

```bash
npx convex dev
```

### Production

```bash
npx convex deploy
```

This deploys your functions to production. Environment variables must be set in the Convex dashboard for production.

## Best Practices

### 1. Use Reactive Queries

Let Convex handle real-time updates instead of manual refetching:

```typescript
// Good - automatically updates
const generations = useQuery(api.generations.listUserGenerations);

// Avoid - manual refetching
const [generations, setGenerations] = useState([]);
useEffect(() => {
  fetchGenerations().then(setGenerations);
}, []);
```

### 2. Handle Loading States

Queries return `undefined` while loading:

```typescript
const data = useQuery(api.something);

if (data === undefined) {
  return <Loading />;
}

return <Display data={data} />;
```

### 3. Use Internal Functions for Server Logic

Internal functions are only callable from other Convex functions:

```typescript
// convex/credits.ts
export const useCreditInternal = internalMutation({
  args: { userId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    // Called from AI actions, not from client
  },
});
```

### 4. Validate Inputs

Convex validators provide runtime type checking:

```typescript
import { v } from "convex/values";

export const myFunction = mutation({
  args: {
    name: v.string(),
    age: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // args are type-safe and validated
  },
});
```

## Troubleshooting

### "Convex client not initialized"

Ensure `EXPO_PUBLIC_CONVEX_URL` is set and ConvexProvider wraps your app.

### "Unauthorized" errors

Check that:

1. User is authenticated
2. Auth middleware is applied to the function
3. Token hasn't expired

### Types not updating

Run `npx convex dev` to regenerate types, or check for TypeScript errors in your functions.

### Function timeout

Actions have a 10 minute timeout. For long-running operations, use scheduled functions.

## Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Convex Auth](https://docs.convex.dev/auth)
- [Convex React Native Guide](https://docs.convex.dev/client/react-native)
