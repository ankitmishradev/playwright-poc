# Playwright Test Framework

End-to-end UI automation for the
[TodoMVC demo application](https://demo.playwright.dev/todomvc), built on
[Playwright](https://playwright.dev) and TypeScript.

- Multi-environment configuration driven by `.env` files
- Typed, validated configuration — a missing variable fails before the browser starts
- Page Object Model with fixture-based injection
- JSON test data with per-environment overrides
- Tag-based run profiles (smoke / regression)

---

## Getting started

```bash
npm install
npx playwright install chromium
cp .env.example .env.dev
npm test
```

---

## Project structure

```
playwright.config.ts      Translates Config into Playwright options
config/
  env.ts                  Reads and validates environment variables
  env.config.ts           Typed Config object consumed by the rest of the suite
src/
  fixtures/
    test.fixture.ts       Extended `test` object that injects page objects
  pages/
    base.page.ts          Shared navigation
    todo.page.ts          TodoMVC screen
  test-data/
    todos.json            Dataset
    todos.data.ts         Typed accessor for the dataset
  types/                  Shared type declarations
  utils/
    test-data.ts          JSON loader with per-environment merging
tests/
  todo.spec.ts            Creating todos (@smoke)
  todo-filters.spec.ts    Filtering and clearing todos (@regression)
```

---

## Running tests

| Command                                      | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `npm test`                                   | Full suite against the default environment |
| `npm run test:dev` / `test:qa` / `test:prod` | Target a specific environment              |
| `npm run test:smoke`                         | Tests tagged `@smoke`                      |
| `npm run test:regression`                    | Tests tagged `@regression`                 |
| `npm run test:headed`                        | Run with a visible browser                 |
| `npm run test:ui`                            | Playwright UI mode                         |
| `npm run test:debug`                         | Step through with the inspector            |
| `npm run report`                             | Open the last HTML report                  |
| `npm run codegen`                            | Record selectors against the app           |

Runs are headless by default. To watch the browser:

```bash
npm run test:headed
npm run test:headed -- --workers=1          # a single window
npm run test:debug                          # headed, with the inspector
```

Variables compose, so any combination works:

```bash
ENV=qa PROFILE=smoke BROWSER=firefox HEADLESS=false npm test
```

Extra Playwright flags pass through after `--`:

```bash
npm test -- --grep "adds a todo" --workers=1 --repeat-each=3
```

---

## Configuration

### Precedence

Variables are resolved highest-priority first:

1. Shell / CI environment variables
2. `.env.local` — personal overrides, gitignored
3. `.env.<ENV>` — per-environment values
4. `.env` — shared defaults

Only `.env.example` is committed. Real credentials belong in CI secrets.

### Variables

| Variable             | Required | Default              | Description                       |
| -------------------- | -------- | -------------------- | --------------------------------- |
| `ENV`                | no       | `dev`                | `dev`, `qa` or `prod`             |
| `BASE_URL`           | **yes**  | —                    | Application origin                |
| `BROWSER`            | no       | `chromium`           | `chromium`, `firefox` or `webkit` |
| `PROFILE`            | no       | `all`                | `smoke`, `regression` or `all`    |
| `HEADLESS`           | no       | `true`               | Forced to `true` on CI            |
| `RETRIES`            | no       | `0` local, `2` on CI | Retry count                       |
| `WORKERS`            | no       | Playwright default   | Parallel workers                  |
| `ACTION_TIMEOUT`     | no       | `15000`              | Per-action timeout (ms)           |
| `NAVIGATION_TIMEOUT` | no       | `60000`              | Per-navigation timeout (ms)       |
| `EXPECT_TIMEOUT`     | no       | `10000`              | Assertion timeout (ms)            |
| `TEST_TIMEOUT`       | no       | `60000`              | Per-test timeout (ms)             |

---

## Architecture

Dependencies flow in one direction, and exactly one file reads `process.env`.

```
.env files ─┐
            ├─> config/env.ts ──> config/env.config.ts ──> playwright.config.ts
shell/CI  ──┘                              │
                                           └──> utils/test-data.ts ──> test-data/*.data.ts ──┐
                                                                                             ├─> tests/
                                            pages/*.page.ts ──> fixtures/test.fixture.ts ────┘
```

### `config/env.ts`

The only module that touches `process.env`. It resolves `ENV`, loads the `.env`
files in precedence order, and exposes four validating readers — `required`,
`num`, `bool` and `oneOf`. Validation lives here so it happens once per
variable rather than at every call site, and so errors name both the variable
and the environment whose file needs fixing.

### `config/env.config.ts`

Declares what settings exist as a single `as const` object. The type is derived
from the value (`export type AppConfig = typeof Config`) rather than written by
hand, so there is no interface to keep in sync, and `as const` makes the whole
tree readonly. `Config` is built eagerly at import, so a missing variable fails
before any browser launches.

### `playwright.config.ts`

Contains no defaults of its own — every value traces back to `Config`. The
single project is named `<env>-<browser>-<profile>`, so every report states
exactly what was run, and the `PROFILE` tag filter is applied at project level
rather than globally so that future untagged projects (an auth `setup` project,
for example) are never filtered out of their own dependency chain.

It lives at the repository root, where Playwright and the VS Code extension
discover it automatically. That keeps `--config` out of every npm script, which
matters because scripts that chain through a second `npm run` silently drop
forwarded CLI arguments.

`BASE_URL` is the application _origin_; each page object owns its own path.
Playwright resolves relative paths with `new URL(path, baseURL)`, so folding an
app path into `BASE_URL` would be discarded by any `goto('/...')` call.

### Page objects

Page objects expose locators and actions. They contain **no assertions** — those
belong in the spec, so a failure points at an expectation rather than at library
code.

Locators are assigned in the constructor body, not as class field initialisers.
With `target: ES2022`, `useDefineForClassFields` is enabled, which means field
initialisers run _before_ parameter properties are assigned — `this.page` would
still be `undefined`.

### Fixtures

`src/fixtures/test.fixture.ts` re-exports both `test` and `expect`, so specs
have a single import for the test framework and never import
`@playwright/test` directly. A test only pays for the fixtures it destructures.

### Test data

`loadTestData` reads `<name>.json` and spreads an optional `<name>.<env>.json`
over it, extending the `.env` precedence idea to data. Datasets are exported as
modules rather than fixtures because specs loop over them to generate tests, and
that loop runs at collection time, before fixtures exist.

---

## Writing a test

```ts
import { expect, test } from '@fixtures/test.fixture';

test.describe('Feature', { tag: '@smoke' }, () => {
    test('does something', async ({ todoPage }) => {
        await todoPage.open();
        await todoPage.add('buy some cheese');

        await expect(todoPage.titles).toHaveText(['buy some cheese']);
    });
});
```

Tag the `describe` block to place the whole file into a run profile. Assertions
belong in the spec; page objects expose only locators and actions.

---

## Extending

| Goal                      | Change                                                          |
| ------------------------- | --------------------------------------------------------------- |
| New environment           | Add to `EnvName` and `ENV_NAMES`, create `.env.<name>`          |
| New page object           | Add `src/pages/*.page.ts`, register it in the fixture           |
| New setting               | One line in `Config`; the type follows automatically            |
| Environment-specific data | Add `<name>.<env>.json`                                         |
| New profile               | Add to `ProfileName`, `PROFILES` and `PROFILE_GREP`             |
| Authentication            | A `setup` project writing `storageState`, keyed by `Config.env` |

---

## Path aliases

`@config/*`, `@pages/*`, `@fixtures/*`, `@typings/*`, `@utils/*`,
`@test-data/*`. Playwright resolves these natively, so there are no relative
`../../..` imports. The alias is `@typings` rather than `@types` to avoid
colliding with TypeScript's `node_modules/@types` resolution.

---

## Quality gates

```bash
npm run lint          # ESLint, type-checked rules + eslint-plugin-playwright
npm run lint:fix
npm run format        # Prettier
npm run type-check    # tsc --noEmit
```

Husky and lint-staged run these on commit.

---

## Troubleshooting

**`Missing required environment variable "X" for ENV="dev"`** — the variable is
absent from `.env.dev`, `.env` and your shell. This is intentional fail-fast
behaviour.

**`net::ERR_TUNNEL_CONNECTION_FAILED`** — a proxy is refusing the connection.
Playwright honours `HTTP_PROXY` / `HTTPS_PROXY`. Verify reachability
independently with `curl -v <BASE_URL>`; if `curl` also fails, the domain is
blocked by network policy rather than by the framework.

**Every test 404s** — `BASE_URL` probably includes an application path.
It must be the origin only; page objects supply their own paths.
