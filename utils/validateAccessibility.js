const fs = require('fs')

const summaryFile = 'reports/accessibility/accessibility-summary.json'
const baselineFile = 'config/accessibility-baseline.json'

if (!fs.existsSync(summaryFile)) {
    console.error(
        `Accessibility summary not found: ${summaryFile}`
    )

    process.exit(1)
}

if (!fs.existsSync(baselineFile)) {
    console.error(
        `Accessibility baseline not found: ${baselineFile}`
    )

    process.exit(1)
}

const summary = JSON.parse(
    fs.readFileSync(summaryFile, 'utf-8')
)

const baseline = JSON.parse(
    fs.readFileSync(baselineFile, 'utf-8')
)

console.log('\n========================================')
console.log('Accessibility Regression Validation')
console.log('========================================')

console.log(`Total scans      : ${summary.totalScans}`)
console.log(`Total violations : ${summary.totalViolations}`)
console.log(`Total passes     : ${summary.totalPasses}`)
console.log(`Total incomplete : ${summary.totalIncomplete}`)

const baselineMap = new Map(
    baseline.results.map(result => [
        `${result.testCase}|${result.browser}`,
        result.violations
    ])
)

let regressionFound = false
let totalNewViolations = 0

console.log('\nResults against baseline:')

for (const result of summary.results) {
    const key = `${result.testCase}|${result.browser}`
    const baselineViolations = baselineMap.get(key)

    if (baselineViolations === undefined) {
        console.error(
            `${result.testCase} | ${result.browser} | ` +
            `No baseline found | ` +
            `Current violations: ${result.violations}`
        )

        regressionFound = true
        totalNewViolations += result.violations
        continue
    }

    const delta = result.violations - baselineViolations

    console.log(
        `${result.testCase} | ${result.browser} | ` +
        `Baseline: ${baselineViolations} | ` +
        `Current: ${result.violations} | ` +
        `Delta: ${delta >= 0 ? '+' : ''}${delta}`
    )

    if (delta > 0) {
        regressionFound = true
        totalNewViolations += delta
    }
}

console.log('\n========================================')

if (regressionFound) {
    console.error(
        `ACCESSIBILITY REGRESSION FAILED: ` +
        `${totalNewViolations} new accessibility violation(s) detected.`
    )

    process.exit(1)
}

console.log(
    'ACCESSIBILITY REGRESSION PASSED: ' +
    'No new accessibility violations detected.'
)

process.exit(0)