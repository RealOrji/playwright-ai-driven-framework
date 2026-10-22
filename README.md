# playwright-ai-driven-framework

Playwright + TypeScript end-to-end test framework built on the Page Object Model, testing
[SauceDemo](https://www.saucedemo.com). It is the Playwright counterpart of
[cypress-ai-driven-framework](https://github.com/RealOrji/cypress-ai-driven-framework) and covers the
same test cases.

## Getting started

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run pw:install # download Chromium and Firefox
npm test
```

## Project structure

```
config/environments.ts   Environment → base URL map (select with TEST_ENV)
playwright.config.ts     Projects (setup, chromium, firefox), reporters, retries
src/
  data/                  Test data: users, products, customer
  fixtures/test.ts       `test` extended with every page object as a fixture
  pages/                 Page objects (BasePage, LoginPage, …) and components/Header
  types/                 Shared types
  utils/                 Routes, error messages, price helpers, cart seeding
tests/
  auth.setup.ts          Logs in once and saves the session to playwright/.auth/
  auth/ cart/ checkout/ inventory/   Specs
scripts/traceability.mts Links test-cases/test-cases.xlsx to the specs
```

## Scripts

| Script                                            | What it does                                     |
| ------------------------------------------------- | ------------------------------------------------ |
| `npm test`                                        | Run every spec on Chromium and Firefox           |
| `npm run test:chrome` / `test:firefox`            | Run on one browser                               |
| `npm run test:smoke` / `test:regression`          | Run tests tagged `@smoke` / `@regression`        |
| `npm run test:dev` / `test:staging` / `test:prod` | Run against an environment from `config/`        |
| `npm run pw:ui`                                   | Open Playwright UI mode                          |
| `npm run report`                                  | Open the last HTML report                        |
| `npm run verify`                                  | Prettier check, ESLint and type-check            |
| `npm run tc:report`                               | Print automation coverage of the test cases      |
| `npm run tc:sync`                                 | Write the automation status back to the workbook |

## Test case traceability

Every test carries its manual test case ID as a tag, e.g. `{ tag: ['@TC-AUTH-001', '@smoke'] }`.
`npm run tc:report` matches those tags against `test-cases/test-cases.xlsx` and fails on tags with no
matching test case or duplicate IDs in the workbook.

## Conventions

- Locators use `data-test` attributes through `page.getByTestId` (`testIdAttribute` is set in the config).
- Tests that need a logged-in user use `test.use({ storageState: authFile('standard') })`.
- Tests that don't cover adding items pre-load the cart with `cartPage.visit({ cart: [ids] })`.
