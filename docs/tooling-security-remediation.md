# Tooling and dependency security

## Required checks

Run these commands before opening or merging a change:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

`npm run lint` uses the ESLint 9 flat configuration and fails on undefined
identifiers, invalid React hook usage, and unused imports. Existing style-only and
Fast Refresh findings remain warnings so they cannot hide the runtime-safety
rules behind a noisy red baseline.

`npm run typecheck` runs TypeScript over the full existing JavaScript scope. The
repository still has legacy Base44 and shadcn inference debt, recorded by source
file and TypeScript error code in `config/typecheck-baseline.json`. The guard
allows counts to decrease, but fails if any bucket increases or a new bucket is
introduced. Use `npm run typecheck:strict` to see every remaining diagnostic; it
will remain non-zero until the legacy baseline reaches zero.

Do not raise the baseline to make a change pass. Fix the new diagnostic instead.
When a legacy bucket is reduced, leave the lower count in place and reduce the
recorded allowance in a dedicated cleanup change.

## Dependency policy

- Keep `npm audit` at zero before merge.
- Do not use `npm audit fix --force` without a reviewed migration plan.
- Remove unused runtime packages instead of carrying vulnerable code.
- After any direct dependency major upgrade, rerun tests, the production build,
  and a rendered preview smoke test before production approval.
