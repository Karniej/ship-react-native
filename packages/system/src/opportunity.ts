export const OPPORTUNITY_STATUSES = ["STRONG", "MODERATE", "WEAK", "DEAD", "UNVALIDATED"] as const;

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type OpportunityBuildTime = "weekend" | "week" | "complex" | "ai";
export type OpportunityPolicyRisk = "low" | "review" | "high";

export type OpportunitySource = {
  id: string;
  provider: string;
  reference: string;
  fetchedAt: string;
  market: string;
  notes?: string;
};

export type KeywordEvidence = {
  keyword: string;
  volume: number | null;
  chance: number | null;
  difficulty: number | null;
  results: number | null;
  intentScore: number | null;
  sourceIds: string[];
};

export type CompetitorEvidence = {
  name: string;
  reviews: number | null;
  rating: number | null;
  sourceIds: string[];
};

export type OpportunityEvidence = {
  idea: string;
  market: string;
  researchedAt: string;
  keywords: KeywordEvidence[];
  competitors: CompetitorEvidence[];
  buildTime: OpportunityBuildTime;
  policyRisk: OpportunityPolicyRisk;
  sources: OpportunitySource[];
};

export type OpportunityValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type OpportunityScore = {
  status: OpportunityStatus;
  totalScore: number | null;
  rankingKeyword: string | null;
  qualifiedKeywordCount: number;
  components: {
    keyword: number | null;
    intent: number | null;
    cluster: number | null;
    competition: number | null;
    build: number | null;
    policy: number | null;
  };
  errors: string[];
  warnings: string[];
};

export const OPPORTUNITY_SCORING_VERSION = "100appideas-v1";

export const OPPORTUNITY_THRESHOLDS = {
  minimumVolumeExclusive: 20,
  maximumDifficultyExclusive: 45,
  strong: 50,
  moderate: 36,
  deadMaximum: 20,
} as const;

function isFiniteMetric(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function ageInDays(timestamp: string, now: Date): number {
  return (now.getTime() - new Date(timestamp).getTime()) / 86_400_000;
}

function keywordScore(keyword: KeywordEvidence): number {
  return (
    keyword.volume! * 0.55 +
    keyword.chance! * 0.35 +
    (100 - keyword.difficulty!) * 0.1 -
    keyword.results! / 18
  );
}

function intentDelta(intentScore: number): number {
  return intentScore >= 80 ? (intentScore - 80) * 0.25 : -(80 - intentScore) * 0.45;
}

function buildDelta(buildTime: OpportunityBuildTime): number {
  switch (buildTime) {
    case "weekend":
      return 1.5;
    case "week":
      return 1;
    case "complex":
      return 0;
    case "ai":
      return -1;
  }
}

function policyPenalty(policyRisk: OpportunityPolicyRisk): number {
  if (policyRisk === "high") return 16;
  if (policyRisk === "review") return 12;
  return 0;
}

function competitionScore(reviews: number): number {
  if (reviews <= 100) return 18;
  if (reviews <= 500) return 15;
  if (reviews <= 1_000) return 11;
  if (reviews <= 5_000) return 7;
  if (reviews <= 25_000) return 3;
  return 0;
}

function statusForScore(totalScore: number, qualifiedKeywordCount: number): OpportunityStatus {
  if (qualifiedKeywordCount === 0 || totalScore <= OPPORTUNITY_THRESHOLDS.deadMaximum) {
    return "DEAD";
  }
  if (totalScore >= OPPORTUNITY_THRESHOLDS.strong) return "STRONG";
  if (totalScore >= OPPORTUNITY_THRESHOLDS.moderate) return "MODERATE";
  return "WEAK";
}

export function validateOpportunityEvidence(
  evidence: OpportunityEvidence,
  options: { now?: Date; maxAgeDays?: number } = {}
): OpportunityValidation {
  const now = options.now ?? new Date();
  const maxAgeDays = options.maxAgeDays ?? 30;
  const errors: string[] = [];
  const warnings: string[] = [];
  const sourceIds = new Set(evidence.sources.map((source) => source.id));

  if (!evidence.idea.trim()) errors.push("idea is required");
  if (!evidence.market.trim()) errors.push("market is required");
  if (Number.isNaN(new Date(evidence.researchedAt).getTime())) {
    errors.push("researchedAt is invalid");
  }
  if (evidence.sources.length === 0) errors.push("at least one source is required");
  if (evidence.keywords.length === 0) errors.push("at least one keyword is required");

  for (const source of evidence.sources) {
    if (!source.id.trim() || !source.provider.trim() || !source.reference.trim()) {
      errors.push("every source requires id, provider, and reference");
    }
    const fetchedAt = new Date(source.fetchedAt);
    if (Number.isNaN(fetchedAt.getTime())) {
      errors.push(`source ${source.id || "<unknown>"} has an invalid fetchedAt`);
    } else if (ageInDays(source.fetchedAt, now) > maxAgeDays) {
      errors.push(`source ${source.id} is stale (older than ${maxAgeDays} days)`);
    } else if (ageInDays(source.fetchedAt, now) < -1) {
      errors.push(`source ${source.id} has a future fetchedAt`);
    }
  }

  for (const keyword of evidence.keywords) {
    if (!keyword.keyword.trim()) errors.push("keyword text is required");
    for (const field of ["volume", "chance", "difficulty", "results", "intentScore"] as const) {
      if (!isFiniteMetric(keyword[field])) {
        errors.push(`keyword ${keyword.keyword || "<unknown>"} is missing ${field}`);
      }
    }
    for (const field of ["volume", "chance", "difficulty", "intentScore"] as const) {
      const value = keyword[field];
      if (isFiniteMetric(value) && (value < 0 || value > 100)) {
        errors.push("keyword " + (keyword.keyword || "<unknown>") + " has out-of-range " + field);
      }
    }
    if (isFiniteMetric(keyword.results) && keyword.results < 0) {
      errors.push("keyword " + (keyword.keyword || "<unknown>") + " has negative results");
    }
    if (keyword.sourceIds.length === 0) {
      errors.push(`keyword ${keyword.keyword || "<unknown>"} has no source`);
    }
    for (const sourceId of keyword.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `keyword ${keyword.keyword || "<unknown>"} references unknown source ${sourceId}`
        );
      }
    }
  }

  for (const competitor of evidence.competitors) {
    if (!competitor.name.trim()) errors.push("competitor name is required");
    if (!isFiniteMetric(competitor.reviews)) {
      errors.push(`competitor ${competitor.name || "<unknown>"} is missing reviews`);
    }
    if (isFiniteMetric(competitor.reviews) && competitor.reviews < 0) {
      errors.push("competitor " + (competitor.name || "<unknown>") + " has negative reviews");
    }
    if (!isFiniteMetric(competitor.rating)) {
      errors.push("competitor " + (competitor.name || "<unknown>") + " is missing rating");
    } else if (competitor.rating < 0 || competitor.rating > 5) {
      errors.push("competitor " + (competitor.name || "<unknown>") + " has out-of-range rating");
    }
    if (competitor.sourceIds.length === 0) {
      errors.push(`competitor ${competitor.name || "<unknown>"} has no source`);
    }
    for (const sourceId of competitor.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `competitor ${competitor.name || "<unknown>"} references unknown source ${sourceId}`
        );
      }
    }
  }

  if (evidence.competitors.length === 0) {
    warnings.push("no direct competitors were captured");
  }
  if (evidence.sources.some((source) => source.market !== evidence.market)) {
    warnings.push("evidence markets are not fully aligned");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function scoreOpportunity(
  evidence: OpportunityEvidence,
  options: { now?: Date; maxAgeDays?: number } = {}
): OpportunityScore {
  const validation = validateOpportunityEvidence(evidence, options);
  if (!validation.valid) {
    return {
      status: "UNVALIDATED",
      totalScore: null,
      rankingKeyword: null,
      qualifiedKeywordCount: 0,
      components: {
        keyword: null,
        intent: null,
        cluster: null,
        competition: null,
        build: null,
        policy: null,
      },
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const rankedKeywords = evidence.keywords
    .map((keyword) => ({ keyword, score: keywordScore(keyword) }))
    .sort((a, b) => b.score - a.score);
  const best = rankedKeywords[0]!;
  const qualifiedKeywordCount = evidence.keywords.filter(
    (keyword) =>
      keyword.volume! > OPPORTUNITY_THRESHOLDS.minimumVolumeExclusive &&
      keyword.difficulty! < OPPORTUNITY_THRESHOLDS.maximumDifficultyExclusive
  ).length;
  const topCompetitorReviews = Math.max(
    0,
    ...evidence.competitors.map((competitor) => competitor.reviews!)
  );

  const components = {
    keyword: best.score,
    intent: intentDelta(best.keyword.intentScore!),
    cluster: Math.max(0, qualifiedKeywordCount - 1) * 1.5,
    competition: competitionScore(topCompetitorReviews),
    build: buildDelta(evidence.buildTime),
    policy: -policyPenalty(evidence.policyRisk),
  };
  const totalScore = Math.round(
    components.keyword +
      components.intent +
      components.cluster +
      components.competition +
      components.build +
      components.policy
  );

  return {
    status: statusForScore(totalScore, qualifiedKeywordCount),
    totalScore,
    rankingKeyword: best.keyword.keyword,
    qualifiedKeywordCount,
    components,
    errors: [],
    warnings: validation.warnings,
  };
}
