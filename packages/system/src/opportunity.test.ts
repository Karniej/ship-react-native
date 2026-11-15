import { describe, expect, it } from "vitest";

import {
  scoreOpportunity,
  validateOpportunityEvidence,
  type OpportunityEvidence,
} from "./opportunity";

const NOW = new Date("2026-08-08T09:00:00.000Z");

function evidence(overrides: Partial<OpportunityEvidence> = {}): OpportunityEvidence {
  return {
    idea: "A focused study timer",
    market: "US App Store / iPhone",
    researchedAt: "2026-08-08T08:00:00.000Z",
    buildTime: "weekend",
    policyRisk: "low",
    sources: [
      {
        id: "keyword-source",
        provider: "example-provider",
        reference: "https://example.com/keywords",
        fetchedAt: "2026-08-08T08:00:00.000Z",
        market: "US App Store / iPhone",
      },
      {
        id: "store-source",
        provider: "Apple App Store",
        reference: "https://apps.apple.com/us/app/example/id1",
        fetchedAt: "2026-08-08T08:00:00.000Z",
        market: "US App Store / iPhone",
      },
    ],
    keywords: [
      {
        keyword: "study timer",
        volume: 60,
        chance: 80,
        difficulty: 20,
        results: 100,
        intentScore: 100,
        sourceIds: ["keyword-source"],
      },
    ],
    competitors: [
      {
        name: "Example Timer",
        reviews: 300,
        rating: 4.5,
        sourceIds: ["store-source"],
      },
    ],
    ...overrides,
  };
}

describe("100AppIdeas opportunity contract", () => {
  it("grades complete fresh evidence", () => {
    const result = scoreOpportunity(evidence(), { now: NOW });

    expect(result.status).toBe("STRONG");
    expect(result.rankingKeyword).toBe("study timer");
    expect(result.qualifiedKeywordCount).toBe(1);
    expect(result.totalScore).not.toBeNull();
    expect(result.errors).toEqual([]);
  });

  it("refuses to grade stale seed data", () => {
    const stale = evidence({
      sources: evidence().sources.map((source) => ({
        ...source,
        fetchedAt: "2026-05-13T00:00:00.000Z",
      })),
    });

    const result = scoreOpportunity(stale, { now: NOW });

    expect(result.status).toBe("UNVALIDATED");
    expect(result.totalScore).toBeNull();
    expect(result.errors).toContain("source keyword-source is stale (older than 30 days)");
  });

  it("uses unavailable rather than inventing a missing metric", () => {
    const incomplete = evidence({
      keywords: [{ ...evidence().keywords[0]!, chance: null }],
    });

    const result = scoreOpportunity(incomplete, { now: NOW });

    expect(result.status).toBe("UNVALIDATED");
    expect(result.errors).toContain("keyword study timer is missing chance");
  });

  it("marks an idea dead when no keyword passes the strict cutoff", () => {
    const result = scoreOpportunity(
      evidence({
        keywords: [
          {
            ...evidence().keywords[0]!,
            volume: 20,
            difficulty: 45,
          },
        ],
      }),
      { now: NOW }
    );

    expect(result.status).toBe("DEAD");
    expect(result.qualifiedKeywordCount).toBe(0);
  });

  it("requires every metric to cite a known source", () => {
    const invalid = evidence({
      keywords: [{ ...evidence().keywords[0]!, sourceIds: ["missing-source"] }],
    });

    const validation = validateOpportunityEvidence(invalid, { now: NOW });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      "keyword study timer references unknown source missing-source"
    );
  });
});
