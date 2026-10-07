const fs = require('fs')

const summaryFile = 'reports/accessibility/accessibility-summary.json'

if (!fs.existsSync(summaryFile)) {
    console.error(
        `Accessibility summary not found: ${summaryFile}`
    )

    process.exit(1)
}

const summary = JSON.parse(
    fs.readFileSync(summaryFile, 'utf-8')
)

console.log('\n========================================')
console.log('Accessibility Validation')
console.log('========================================')

console.log(`Total scans      : ${summary.totalScans}`)
console.log(`Total violations : ${summary.totalViolations}`)
console.log(`Total passes     : ${summary.totalPasses}`)
console.log(`Total incomplete : ${summary.totalIncomplete}`)

console.log('\nResults by test/browser:')

for (const result of summary.results) {
    console.log(
        `${result.testCase} | ${result.browser} | ` +
        `Violations: ${result.violations} | ` +
        `Passes: ${result.passes} | ` +
        `Incomplete: ${result.incomplete}`
    )
}

console.log('\n========================================')

if (summary.totalViolations > 0) {
    console.error(
        `ACCESSIBILITY VALIDATION FAILED: ` +
        `${summary.totalViolations} accessibility violations detected.`
    )

    process.exit(1)
}

console.log(
    'ACCESSIBILITY VALIDATION PASSED: No accessibility violations detected.'
)

process.exit(0)