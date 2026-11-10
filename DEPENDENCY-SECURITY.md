# Dependency remediation — 2026-11-10

Replaces the incomplete dependency-only proposal #21 with Zod 4.6.7 and the strictly required `@hookform/resolvers` 5.1.0 migration. Resolver4 expects Zod3 `errors`; resolver5 handles Zod4 `issues`, including invalid submissions.

Both real form schemas now live in `src/lib/animal-form-schemas.ts`, imported by the forms and offline tests. The removed `required_error` API becomes a Zod4 `error` callback, preserving the existing missing-species message without changing other validation rules. Form input/output types are explicit: the registration checkbox is optional on input but defaults to a required boolean on parsed output. Optional/null values, dates and enum contracts are preserved.

## Local validation

Node 24.22.1 / npm 10.9.4, with installation lifecycle scripts disabled:

- Clean `npm ci --ignore-scripts --no-audit --no-fund --prefer-offline`: passed.
- `npm run test:forms --ignore-scripts`: ten tests passed. Actual application schemas/resolver in async and sync modes: valid/invalid species, preserved messages, nullable fields, invalid URL/date/enum/boolean, and parsed checkbox defaults. Invalid inputs return field errors, not an uncaught ZodError.
- `tsc --noEmit --incremental false`: passed.
- `npm run test:braces-security --ignore-scripts`: four existing tests passed.
- `npm run lint --ignore-scripts`: failed because `eslint` is not installed/declared and there is no repository ESLint configuration. This pre-existing tooling gap is not reported as passing lint; no unrelated lint stack was introduced.
- Next build was deliberately **not executed**: `src/app/page.tsx` and other server pages await `getAnimais`/`getCadastros`, whose actions access Firestore; layout also uses network-backed Google fonts. No provider, Firestore, IUCN or Pexels service was contacted by these offline schema tests.

Only Zod and the required resolver changed existing package versions. npm also completed six optional WASI lockfile records; no other existing dependency major was changed. No forced transitive major override was used.

No remote merge, deploy, publish, migrations, production/infrastructure configuration changes, or inspection of env/secrets. Existing remote automation may run on push/PR. Default-branch alerts require merge and GitHub re-evaluation.
