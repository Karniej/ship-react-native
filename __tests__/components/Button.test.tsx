/**
 * Button Component Tests
 */

import React from "react";

import { render, fireEvent, screen } from "@testing-library/react-native";

import { Button } from "@/components/ui/Button";

// Mock hooks
jest.mock("@/hooks/useAppTheme", () => ({
  useAppTheme: () => ({ isDark: false }),
}));

describe("Button", () => {
  describe("Rendering", () => {
    it("renders with title", () => {
      render(<Button title="Click me" />);
      expect(screen.getByText("Click me")).toBeTruthy();
    });

    it("shows loading indicator when loading", () => {
      render(<Button title="Submit" loading />);
      // Text is hidden when loading, ActivityIndicator shown instead
      expect(screen.queryByText("Submit")).toBeFalsy();
    });

    it("renders with left icon", () => {
      render(<Button title="Save" leftIcon="save-outline" />);
      expect(screen.getByText("Save")).toBeTruthy();
    });

    it("renders with right icon", () => {
      render(<Button title="Next" rightIcon="arrow-forward" />);
      expect(screen.getByText("Next")).toBeTruthy();
    });
  });

  describe("Interactions", () => {
    it("calls onPress when pressed", () => {
      const onPress = jest.fn();
      render(<Button title="Press me" onPress={onPress} />);

      fireEvent.press(screen.getByText("Press me"));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when disabled", () => {
      const onPress = jest.fn();
      render(<Button title="Disabled" onPress={onPress} disabled />);

      fireEvent.press(screen.getByText("Disabled"));

      expect(onPress).not.toHaveBeenCalled();
    });

    it("does not call onPress when loading", () => {
      const onPress = jest.fn();
      render(<Button title="Loading" onPress={onPress} loading />);

      // Button should be disabled during loading
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("renders primary variant", () => {
      render(<Button title="Primary" variant="primary" />);
      expect(screen.getByText("Primary")).toBeTruthy();
    });

    it("renders secondary variant", () => {
      render(<Button title="Secondary" variant="secondary" />);
      expect(screen.getByText("Secondary")).toBeTruthy();
    });

    it("renders outline variant", () => {
      render(<Button title="Outline" variant="outline" />);
      expect(screen.getByText("Outline")).toBeTruthy();
    });

    it("renders ghost variant", () => {
      render(<Button title="Ghost" variant="ghost" />);
      expect(screen.getByText("Ghost")).toBeTruthy();
    });

    it("renders danger variant", () => {
      render(<Button title="Danger" variant="danger" />);
      expect(screen.getByText("Danger")).toBeTruthy();
    });
  });

  describe("Sizes", () => {
    it("renders xs size", () => {
      render(<Button title="XS" size="xs" />);
      expect(screen.getByText("XS")).toBeTruthy();
    });

    it("renders lg size", () => {
      render(<Button title="LG" size="lg" />);
      expect(screen.getByText("LG")).toBeTruthy();
    });
  });
});
