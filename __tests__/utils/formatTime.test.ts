/**
 * formatTime Utility Tests
 */

import { formatTime } from "@/utils/formatTime";

describe("formatTime", () => {
  it("formats milliseconds to mm:ss", () => {
    expect(formatTime(45000)).toBe("0:45");
  });

  it("formats minutes and seconds correctly", () => {
    expect(formatTime(125000)).toBe("2:05");
  });

  it("pads single digit seconds", () => {
    expect(formatTime(65000)).toBe("1:05");
  });

  it("handles zero", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("handles undefined/null gracefully", () => {
    expect(formatTime(undefined as any)).toBe("0:00");
  });
});
