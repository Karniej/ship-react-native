import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const blockedNodeModules = [
  "fs",
  "path",
  "child_process",
  "http",
  "https",
  "net",
  "tls",
  "os",
  "stream",
  "zlib",
  "worker_threads",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function productionSourceFiles(directory = join(process.cwd(), "src")): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) return productionSourceFiles(entryPath);
    if (!entry.isFile()) return [];
    if (!/\.tsx?$/.test(entry.name) || /\.(?:test|spec)\.tsx?$/.test(entry.name)) {
      return [];
    }
    return [entryPath];
  });
}

const blockedSpecifier = `(?:node:)?(?:${blockedNodeModules
  .map(escapeRegExp)
  .join("|")})(?:/[^"'\\s]+)?`;
const blockedImportPattern = new RegExp(
  `(?:from\\s+|import\\s*\\(\\s*|require\\s*\\(\\s*|import\\s*)["']${blockedSpecifier}["']`
);

describe("browser safety", () => {
  it("does not import Node-only built-ins from production source", () => {
    const violations = productionSourceFiles().flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return blockedImportPattern.test(source) ? [filePath] : [];
    });

    expect(violations).toEqual([]);
  });

  it("detects side-effect imports and Node builtin subpaths", () => {
    expect(blockedImportPattern.test('import "fs";')).toBe(true);
    expect(blockedImportPattern.test('import "node:fs/promises";')).toBe(true);
    expect(blockedImportPattern.test('import value from "path/to/file";')).toBe(true);
    expect(blockedImportPattern.test('import matcher from "path-to-regexp";')).toBe(false);
  });
});
