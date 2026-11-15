# Testing Guide

This project currently uses Jest and React Native Testing Library for unit and component tests.

## Current State

The repo includes examples in `__tests__/` for:

- components
- hooks
- stores
- utilities

There is not yet a full end-to-end suite in the repo.

## Run Tests

```bash
npm test
npm run type-check
npm run lint
```

## What To Prioritize

When extending the boilerplate, prioritize tests for:

- feature flag behavior
- paywall and premium gating logic
- store mutations and selectors
- service-layer request shaping
- utility functions with business logic

## Component Testing Pattern

```ts
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Button } from "@/components/ui/Button";

it("calls onPress when tapped", () => {
  const onPress = jest.fn();
  render(<Button title="Continue" onPress={onPress} />);

  fireEvent.press(screen.getByText("Continue"));
  expect(onPress).toHaveBeenCalledTimes(1);
});
```

## Store Testing Pattern

```ts
import { act } from "@testing-library/react-native";
import { useSettingsStore } from "@/store/useSettingsStore";

beforeEach(() => {
  useSettingsStore.setState({ theme: "system", language: "en" });
});

it("updates theme", () => {
  act(() => {
    useSettingsStore.getState().setTheme("dark");
  });

  expect(useSettingsStore.getState().theme).toBe("dark");
});
```

## Service Testing Pattern

Test the boundary your app owns.

- mock network calls
- verify payload shaping
- verify error handling
- avoid coupling tests to external provider responses more than necessary

For `Convex` mode, mock hook-level or client-level boundaries.

For `Expo API Routes` mode, mock `fetch` or your API helper functions.

## Recommended Next Step

The biggest testing gap in the current repo is E2E coverage for:

- onboarding
- auth
- premium flow
- at least one AI generation flow

Maestro is the simplest next addition if you want realistic app-level protection quickly.
