import fs from 'fs'
import path from 'path'

const summaryDirectory = 'reports/accessibility'
const summaryFile = path.join(
    summaryDirectory,
    'accessibility-summary.json'
)

export function recordAccessibilitySummary(results, reportName) {
    fs.mkdirSync(summaryDirectory, { recursive: true })

    let summary = {
        totalScans: 0,
        totalViolations: 0,
        totalPasses: 0,
        totalIncomplete: 0,
        results: []
    }

    if (fs.existsSync(summaryFile)) {
        summary = JSON.parse(
            fs.readFileSync(summaryFile, 'utf-8')
        )
    }

    const violations = results.violations?.length ?? 0
    const passes = results.passes?.length ?? 0
    const incomplete = results.incomplete?.length ?? 0

    const browser = reportName
        .replace('.html', '')
        .split('-')
        .pop()

    const testCase = reportName.match(/TC\d+/)?.[0] ?? 'Unknown'

    summary.totalScans += 1
    summary.totalViolations += violations
    summary.totalPasses += passes
    summary.totalIncomplete += incomplete

    summary.results.push({
        testCase,
        browser,
        violations,
        passes,
        incomplete
    })

    fs.writeFileSync(
        summaryFile,
        JSON.stringify(summary, null, 2)
    )
}