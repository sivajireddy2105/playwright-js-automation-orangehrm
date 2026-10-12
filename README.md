# OrangeHRM UI Automation Framework

A JavaScript UI automation project for the OrangeHRM demo application,
built with **Playwright Test**, the **Page Object Model (POM)**, and
**axe-core** accessibility scanning. It includes detailed accessibility
reports, run summaries, triage output, baseline-based regression
validation, and GitHub Actions CI.

> \*\*Scope note:\*\* Automated axe scans identify potential accessibility
> issues; they do not establish full WCAG conformance on their own.
> Baseline acceptance means no regression was detected by the configured
> comparison, not that existing findings are fixed.

## Contents

* [Overview](#overview)
* [Technology stack](#technology-stack)
* [Project structure](#project-structure)
* [Automated test coverage](#automated-test-coverage)
* [Getting started](#getting-started)
* [Running tests](#running-tests)
* [Accessibility reporting](#accessibility-reporting)
* [Baseline regression validation](#baseline-regression-validation)
* [GitHub Actions CI](#github-actions-ci)
* [Troubleshooting](#troubleshooting)
* [Current scope and limitations](#current-scope-and-limitations)

## Overview

The framework demonstrates maintainable browser automation for common
OrangeHRM workflows and the integration of automated accessibility scans
into a Playwright suite. Page-specific locators and interactions are
organized in page objects; scenario logic is maintained in `tests/`;
accessibility report generation and validation utilities are kept in
`utils/`.

### Key capabilities

* JavaScript browser automation with Playwright Test.
* Page Object Model organization and reusable page interactions.
* Functional scenarios for authentication, employee management, leave,
user validation, and employee/user/vacancy workflows.
* axe-based accessibility scans across selected pages and Chromium,
Firefox, and WebKit.
* Detailed per-scan HTML reports and a JSON summary.
* Markdown and JSON triage reports grouped by accessibility rule and
impact.
* Comparison of current findings with a versioned accessibility
baseline.
* GitHub Actions test execution and artifact uploads.

## Technology stack

\---

Technology                          Purpose

\---

JavaScript / Node.js                Test and utility implementation

Playwright Test                     Browser automation, test runner,
assertions, execution

Page Object Model                   Separation of page interactions
from test scenarios

`@axe-core/playwright`              Automated axe accessibility
analysis

`axe-html-reporter`                 Detailed HTML accessibility reports

Git and GitHub                      Version control and source hosting

GitHub Actions                      CI execution and accessibility
regression gate
---

## Project structure

``` text
playwright-js-framework-orangehrm/
├── .github/workflows/playwright.yml
├── config/
│   └── accessibility-baseline.json
├── fixtures/
│   └── testResumeFile.txt
├── pages/
│   ├── CandidatePage.js
│   ├── DashboardPage.js
│   ├── LeavePage.js
│   ├── LoginPage.js
│   ├── PIMPage.js
│   ├── RecruitmentPage.js
│   └── UserManagementPage.js
├── reports/
│   └── accessibility/              # Generated reports and findings
├── test-cases/
│   └── OrangeHRM\_Test\_Scenarios\_and\_Test\_Cases...
├── tests/
│   ├── accessibility.spec.js
│   ├── authentication-authorization.spec.js
│   ├── duplicate-username-validation.spec.js
│   ├── employee-login-validation.spec.js
│   ├── employee-user-vacancy-lifecycle.spec.js
│   ├── invalid-login.spec.js
│   ├── leave.spec.js
│   ├── login.spec.js
│   └── pim-add-employee.spec.js
├── utils/
│   ├── accessibilityGlobalSetup.js
│   ├── accessibilityReporter.js
│   ├── accessibilitySummary.js
│   ├── createAccessibilityBaseline.js
│   ├── triageAccessibilityFindings.js
│   └── validateAccessibility.js
├── .gitignore
├── package.json
├── package-lock.json
└── playwright.config.js
```

Generated directories such as `playwright-report/` and `test-results/`
are created during test execution. Files under `reports/accessibility/`
depend on which scans and utility commands have been run.

### Directory responsibilities

* **`tests/`** --- Playwright scenarios and accessibility scans.
* **`pages/`** --- Page objects containing page-specific locators and
reusable interactions.
* **`fixtures/`** --- Supporting assets, including a resume file used
by applicable workflows.
* **`test-cases/`** --- Scenario and test-case reference document.
* **`utils/`** --- Accessibility report generation, summary
collection, triage, baseline creation, and regression validation.
* **`config/`** --- Versioned accessibility baseline.
* **`.github/workflows/`** --- GitHub Actions workflow.
* **`reports/accessibility/`** --- Generated accessibility reports and
structured findings.
* **`playwright-report/` and `test-results/`** --- Playwright
execution report and test evidence.

## Automated test coverage

The repository currently contains these test files. The descriptions
below reflect their names and the known project scope; consult each test
and the scenario document for exact steps, assertions, and
preconditions.

\---

Test file                                   Main area

\---

`login.spec.js`                             Successful login and logout

`invalid-login.spec.js`                     Invalid-credentials validation

`pim-add-employee.spec.js`                  PIM employee CRUD: create, retrieve, update, and delete

`leave.spec.js`                             Leave application when balance is available; overlap detection, date adjustment, retry, and a five-attempt limit

`employee-user-vacancy-lifecycle.spec.js`   Employee, system-user, vacancy, and
candidate workflow

`authentication-authorization.spec.js`      Authentication, authorization, and
protected-access checks

`duplicate-username-validation.spec.js`     Duplicate system-username
validation

`employee-login-validation.spec.js`         Employee login validation

`accessibility.spec.js`                     Automated accessibility scans on
selected pages
---

### Accessibility scan matrix

The accessibility suite covers five page scenarios across Chromium,
Firefox, and WebKit:

Scenario   Page/area

\---

TC09       Login page
TC10       Dashboard
TC11       Employee List
TC12       System Users
TC13       Add User

When every scenario completes in all three browser projects, this
represents 15 page/browser scan combinations. Actual completion can
differ if a test fails or is skipped.

**Important distinction:** A page being scanned by axe does not mean all
interactive states, keyboard flows, screen-reader behavior, or WCAG
requirements have been tested.

## Getting started

### Prerequisites

* Node.js compatible with the project's Playwright dependencies.
* npm.
* Git, if cloning the repository.
* Playwright browser binaries for the configured browser projects.

### Install

``` bash
git clone https://github.com/sivajireddy2105/playwright-js-automation-orangehrm.git
cd playwright-js-framework-orangehrm
npm ci
npx playwright install
```

If the cloned directory has a different name, enter that actual
directory before running the commands.

For Linux CI environments, install browser system dependencies with:

``` bash
npx playwright install --with-deps
```

## Running tests

Run the configured Playwright suite:

``` bash
npm test
```

The `test` script runs `playwright test --workers=1`, limiting execution
to one worker.

Run the accessibility test file:

``` bash
npm run test:accessibility
```

Generate accessibility triage reports from current findings:

``` bash
npm run triage:accessibility
```

Validate current findings against the baseline:

``` bash
npm run validate:accessibility
```

\---

Command                             Purpose

\---

`npm test`                          Runs the configured suite with one
worker

`npm run test:accessibility`        Runs `tests/accessibility.spec.js`

`npm run triage:accessibility`      Produces Markdown and JSON triage
output

`npm run validate:accessibility`    Compares current findings with the
baseline and exits unsuccessfully
if a regression or validation
problem is detected
---

Suggested review order after execution: inspect Playwright results,
review the accessibility summary and detailed reports, run triage for
grouped findings, then run baseline validation.

## Accessibility reporting

### Reporting flow

1. Accessibility tests run axe through `@axe-core/playwright`.
2. The reporting utility creates a detailed HTML report for each scan
and records summary metrics.
3. The summary utility writes run-level counts and per-scan
information.
4. The triage utility groups findings for investigation.
5. The validator compares current findings with the baseline.

### Generated outputs

\---

Output                                                Purpose

\---

`reports/accessibility/<scan-report>.html`            Detailed report for one
page/browser scan, including axe
findings and node details

`reports/accessibility/accessibility-summary.json`    Run-level and per-scan counts for
violations, passes, and incomplete
checks

`reports/accessibility/accessibility-findings.json`   Structured findings consumed by
triage and baseline comparison

`reports/accessibility/accessibility-triage.md`       Human-readable findings grouped by
rule and impact

`reports/accessibility/accessibility-triage.json`     Machine-readable triage data

`playwright-report/`                                  Playwright HTML report for test
execution

`test-results/`                                       Playwright test-result evidence,
depending on configuration and
execution
---

The report directory is generated output. Its contents depend on which
commands ran and whether previous outputs have been retained.

### Understanding the metrics

* **Scans** --- Number of accessibility scans recorded.
* **Violations** --- Axe rule violations across scans; not necessarily
the number of unique root-cause defects.
* **Affected-element occurrences** --- Individual nodes associated
with violations. One rule can affect many elements and appear in
multiple scans.
* **Passes** --- Checks axe evaluated as passing.
* **Incomplete** --- Checks requiring manual review or additional
investigation; do not count them as confirmed passes.

Triage groups are prioritization aids. Review the rule details and
affected DOM before estimating the number of distinct defects.

## Baseline regression validation

`config/accessibility-baseline.json` stores the accepted baseline used
by `npm run validate:accessibility`.

The validator checks scan coverage and compares findings using the rule
identifier, impact, and normalized target selector, while tracking
occurrences.

### Interpreting the result

* **No new findings:** No additional matched finding occurrences were
detected by the configured comparison for the validated scans.
* **New findings or occurrences:** The validator reports a regression
and exits with a non-zero status.
* **Resolved occurrences:** Some baseline occurrences are no longer
present in the current findings.
* **Coverage or data errors:** Validation can fail when expected files
are missing, malformed, or do not cover the expected scans.

A passing comparison means **no regression was detected by the
configured matching logic**. It does not mean the application has zero
accessibility violations; existing baseline findings may still require
remediation.

### Updating the baseline responsibly

Do not replace the baseline simply to make a failing validation pass.
Review the detailed report and triage output, confirm whether the
difference is expected, and investigate new findings first. Update the
baseline only when the change has been reviewed and intentionally
accepted.

The repository includes `utils/createAccessibilityBaseline.js` for
baseline creation. Review the script before using it and preserve the
previous baseline in version control so changes remain auditable.

## GitHub Actions CI

The workflow is `.github/workflows/playwright.yml`.

### Triggers

* Push to `main` or `master`.
* Pull request targeting `main` or `master`.

### Workflow sequence

1. Check out the repository.
2. Set up Node.js using the current LTS release.
3. Install dependencies using `npm ci`.
4. Install Playwright browsers and Linux dependencies.
5. Run `npm test`.
6. Upload the Playwright report and accessibility report directory as
artifacts.
7. Run the accessibility baseline gate if the Playwright test command
succeeded.
8. Finalize the job as failed if the tests or accessibility gate
failed.

The test step is configured to continue long enough for report uploads
to occur. The final step then fails the job if the test command failed.
The accessibility gate is skipped when the test command did not succeed.

### Download CI reports

Open the completed workflow run in GitHub and download the available
artifacts:

* **`playwright-report`** --- Playwright execution report.
* **`accessibility-reports`** --- Files present in
`reports/accessibility/` at artifact-upload time.

Artifact retention is set to 30 days.

**Current workflow detail:** The workflow does not explicitly run
`npm run triage:accessibility`. Fresh triage files will be included in
the CI artifact only if they exist in the report directory when the
upload step runs. Add a triage step before artifact upload if every CI
run must generate fresh triage reports.

## Troubleshooting

### The validator reports a regression

1. Open the affected scan's detailed HTML report.
2. Review the rule ID, impact, affected selector, and failure summary.
3. Inspect `accessibility-triage.md` for grouped findings.
4. Compare the current finding with the baseline entry.
5. Determine whether this is a real regression, a selector change, or
an existing issue.
6. Fix the application or reporting/test issue as appropriate; do not
blindly regenerate the baseline.

### The validator cannot find its inputs

Run the accessibility tests first so the current findings and summary
are generated. Then verify the expected files under
`reports/accessibility/` and the baseline under `config/`.

### A test passes locally but fails in CI

Review the failed test in the Playwright report and inspect available
logs and traces. Check session state, test-data collisions, timing
assumptions, browser-specific behavior, and environment differences.
Prefer state-based Playwright waits and stable locators over arbitrary
fixed delays.

### Axe reports incomplete checks

An incomplete result is neither automatically a confirmed violation nor
a pass. Review the rule details and perform manual verification where
needed.

## Current scope and limitations

* Axe-based scans do not verify every WCAG success criterion.
* Baseline findings are accepted for regression comparison; they are
not necessarily fixed or compliant.
* Selector-based matching can interpret a selector change as a
resolved finding plus a new finding. Review meaningful DOM changes
and detailed reports when results differ.
* Test totals and outcomes depend on the current test implementation,
browser configuration, and application state.
* The current GitHub Actions workflow does not explicitly generate
triage reports.
* Keep this documentation aligned with changes to scenarios, scripts,
reporting, and CI behavior.

## Maintainer workflow

When adding or changing a test:

1. Keep the scenario intent and expected result clear.
2. Reuse or update the relevant page object instead of duplicating page
interactions.
3. Run the affected test first, then the full suite when appropriate.
4. Investigate failures and review generated reports before changing
timeouts or baselines.
5. When accessibility results change, review detailed findings and
triage before accepting a baseline update.
6. Commit the code, scenario documentation, and any intentional
baseline changes together when appropriate.