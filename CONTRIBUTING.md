# Contributing to Ship React Native

First off, thank you for considering contributing! This project aims to be the best starting point for building AI-powered React Native apps.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- npm or yarn
- iOS Simulator (Mac) or Android Emulator
- Git

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ship-react-native.git
   cd boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on your device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (app)/             # Authenticated screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
│   ├── ai/               # AI-specific components
│   ├── ui/               # UI component library
│   └── premium/          # Premium/subscription components
├── constants/            # App constants and config
│   ├── config.ts         # App configuration
│   ├── features.ts       # Feature flags
│   └── theme.ts          # Theme configuration
├── hooks/                # Custom React hooks
├── locales/              # i18n translation files
├── services/             # API and service integrations
│   └── ai/              # AI provider services
├── store/                # Zustand state stores
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── convex/               # Convex backend (recommended mode)
├── src/app/api/          # Expo API Routes (lighter backend mode)
└── scripts/              # Build and setup scripts
```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-voice-cloning`
- `fix/image-generation-crash`
- `docs/update-readme`
- `refactor/improve-store-structure`

### Types of Contributions

#### 🐛 Bug Fixes

1. Check existing issues first
2. Create an issue if one doesn't exist
3. Reference the issue in your PR

#### ✨ New Features

1. Open an issue to discuss the feature first
2. Get approval before starting work
3. Follow existing patterns and architecture

#### 📚 Documentation

- Fix typos and improve clarity
- Add examples and use cases
- Update outdated information

#### 🎨 UI/UX Improvements

- Follow existing design patterns
- Ensure dark mode support
- Test on multiple screen sizes

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(ai): add support for Claude API
fix(video): resolve playback issue on Android
docs(readme): update installation instructions
refactor(store): simplify AI store structure
```

## Pull Request Process

1. **Before submitting:**
   - [ ] Run `npm run lint` and fix any issues
   - [ ] Run `npm run type-check` and fix any errors
   - [ ] Run `npm test` and ensure all tests pass
   - [ ] Update documentation if needed
   - [ ] Add/update translations if adding UI strings

2. **PR Title:** Follow commit message format

   ```
   feat(ai): add image-to-image generation
   ```

3. **PR Description:** Use the template

   ```markdown
   ## Summary

   Brief description of changes

   ## Changes

   - Added X
   - Fixed Y
   - Updated Z

   ## Testing

   How to test these changes

   ## Screenshots (if applicable)

   Before/after screenshots

   ## Checklist

   - [ ] Code follows project style
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] Translations added
   ```

4. **Review Process:**
   - At least one approval required
   - All CI checks must pass
   - Merge conflicts must be resolved

## Code Style

### TypeScript

- Use strict TypeScript
- Define interfaces for all props and state
- Avoid `any` type - use `unknown` if necessary

### React Native

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused

### Formatting

- Prettier handles formatting automatically
- Run `npm run lint` before committing
- Use meaningful variable names

### File Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { Button } from '@/components/ui';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  // Hooks first
  const theme = useTheme();
  const [state, setState] = useState(false);

  // Handlers
  const handlePress = () => {};

  // Render
  return <View />;
}

// 4. Styles (if using StyleSheet)
const styles = StyleSheet.create({});
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- MyComponent.test.tsx

# Watch mode
npm test -- --watch
```

### Writing Tests

- Place tests next to the file: `Component.tsx` → `Component.test.tsx`
- Test user behavior, not implementation
- Use meaningful test descriptions

```typescript
describe('Button', () => {
  it('should call onPress when tapped', () => {
    // Arrange
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Click me</Button>);

    // Act
    fireEvent.press(screen.getByText('Click me'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

```typescript
/**
 * Generates an image using the specified AI provider.
 *
 * @param prompt - Text description of the image to generate
 * @param provider - AI provider to use ('openai' | 'replicate')
 * @returns Generated image URL or error
 *
 * @example
 * const result = await generateImage('A sunset over mountains', 'openai');
 */
```

### README Updates

- Keep examples up to date
- Document new features
- Update screenshots if UI changes

## Questions?

- Open an issue for questions
- Check existing issues and discussions first
- Report security problems privately; see [SECURITY.md](SECURITY.md)

---

Thank you for contributing! 🎉
