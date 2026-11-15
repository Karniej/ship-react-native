# Vendored package provenance

`packages/system` is the vendored copy of `@ship-rn/system`. It is
included in this repository so ShipReactNative works from one clone without a
sibling checkout.

## Upstream

- Repository: `https://github.com/Karniej/ship-rn`
- Branch: `fix/system-review-findings` (upstream PR #1; merge target `main`)
- Source commit: `abaec6b475c07e86afbae3077d2047dc6f65d23b`
- Vendored path: `packages/system`

The upstream repository is the private development home of the package. This
copy is distributed under the MIT `LICENSE` at the repository root.

## Sync contract

1. Export only tracked files from `packages/system` at a reviewed upstream
   commit. Do not copy `node_modules` or generated `dist` output.
2. Replace this directory while preserving this provenance file.
3. Update the source commit above.
4. From a clean clone of only the product repository, run:

   ```bash
   npm ci
   npm run validate
   npm run apply -- --dry-run
   ```

5. Record intentional upstream differences in the pull request. Never edit the
   upstream and vendored copies independently without documenting the drift.
