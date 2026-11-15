# Security Best Practices

This guide reflects the current Ship React Native architecture.

## Core Rule

Never put provider secrets in client code.

- In `Convex` mode, store secrets in the Convex dashboard environment variables.
- In `Expo API Routes` mode, store secrets in your deployment environment.
- Only `EXPO_PUBLIC_*` variables should be exposed to the app bundle.

## API Key Management

### Do Not Do This

```ts
const OPENAI_KEY = "sk-...";
```

### Convex Mode

Put secrets in Convex and call them from actions.

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

### Expo API Routes Mode

Put secrets in the server environment used by your API routes.

```ts
const apiKey = process.env.OPENAI_API_KEY;
```

## Authentication

### Convex

Convex is the recommended mode when you need real auth and persisted user state.

Security goals:

- authenticate protected mutations and actions
- avoid exposing user identifiers from untrusted client state alone
- validate authorization server-side before reading or writing user data

### Expo API Routes

This mode is lighter and currently does not have full parity with Convex for auth-heavy products.

Use it when:

- your app mainly needs server-side AI proxying
- you are comfortable with a simpler backend model

## Input Validation

Validate all untrusted input server-side.

```ts
import { z } from "zod";

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string().min(1),
});
```

## Logging

Do not log:

- API keys
- access tokens
- user PII
- raw payment payloads unless redacted

Safe examples:

- internal IDs
- non-sensitive event names
- summarized error codes

## Client Storage

Treat client persistence as convenience storage, not a trust boundary.

- AsyncStorage is fine for non-sensitive state
- use secure storage where sensitive credentials are involved
- do not trust client-side flags for premium access without server validation in full-backend flows

## Transport Security

- use HTTPS only in production
- never call insecure HTTP endpoints from the app
- verify deployment URLs before release

## Release Checklist

- no secrets in source files
- no placeholder env values in production
- production analytics and error tracking configured
- auth-protected flows validated on real devices
- payment flows tested in sandbox
- server-side input validation in place
- rate limits applied where AI or paid features can be abused
