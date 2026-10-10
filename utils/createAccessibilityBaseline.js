const fs = require('fs')

const summaryFile = 'reports/accessibility/accessibility-summary.json'
const baselineDirectory = 'config'
const baselineFile = `${baselineDirectory}/accessibility-baseline.json`

if (!fs.existsSync(summaryFile)) {
    console.error(
        `Accessibility summary not found: ${summaryFile}`
    )

    process.exit(1)
}

const summary = JSON.parse(
    fs.readFileSync(summaryFile, 'utf-8')
)

fs.mkdirSync(baselineDirectory, { recursive: true })

const baseline = {
    version: 1,
    results: summary.results.map(result => ({
        testCase: result.testCase,
        browser: result.browser,
        violations: result.violations
    }))
}

fs.writeFileSync(
    baselineFile,
    JSON.stringify(baseline, null, 2)
)

console.log(
    `Accessibility baseline created successfully: ${baselineFile}`
)

console.log(
    `Baseline entries: ${baseline.results.length}`
)

console.log(
    `Total baseline violations: ${baseline.results.reduce(
        (total, result) => total + result.violations,
        0
    )
    }`
)