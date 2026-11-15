# 100AppIdeas opportunity seed

This directory is a vendored, read-only seed from
[Karniej/100appsideas-landing](https://github.com/Karniej/100appsideas-landing) commit
`44de67a`.

Copied assets:

- `specs/`: 76 ranked idea specs plus the index
- `docs/ranking-methodology-2026-05-11.md`: Astro ranking methodology
- `docs/full-list-keyword-audit-2026-05-11.md`: the 76-idea / 486-keyword audit
- `seed/foxdata-keywords.json`: the later FoxData keyword snapshot used by the landing ranking

The source audits were collected in May 2026 for the US App Store / iPhone market. They are useful
for candidate keywords, scoring behavior, comparison fixtures, and historical context. They are not
current validation evidence. `validate-idea` must refresh all required metrics from accessible,
source-backed providers before assigning a numeric score or graded status.

## Scoring contract extracted from the source

- A keyword qualifies only when volume/popularity is greater than 20 and difficulty is below 45.
- No qualifying keyword makes an idea `DEAD` regardless of how attractive the concept sounds.
- Ranking combines keyword strength, search intent, cluster depth, competition, build friction, and
  policy risk.
- Exact app intent is rewarded; broad, brand, misleading, saturated, and IP-heavy queries are
  penalized or rejected.
- The source status ranges are `STRONG` 50–60, `MODERATE` 36–49, `WEAK` 23–34, and `DEAD` 15–20.
  `@ship-rn/system/opportunity` versions these boundaries as `100appideas-v1`.

Do not silently edit the snapshot. A refresh must record its source repository commit, provider,
market, fetched-at date, field mapping, and regeneration command.
