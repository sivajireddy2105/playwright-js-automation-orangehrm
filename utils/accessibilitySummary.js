
import fs from 'fs'
import path from 'path'

const summaryDirectory = 'reports/accessibility'

const summaryFile = path.join(
    summaryDirectory,
    'accessibility-summary.json'
)

const findingsFile = path.join(
    summaryDirectory,
    'accessibility-findings.json'
)

export function resetAccessibilitySummary() {
    fs.mkdirSync(summaryDirectory, { recursive: true })

    for (const file of [summaryFile, findingsFile]) {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file)
        }
    }
}

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

    let findings = {
        scans: []
    }

    if (fs.existsSync(findingsFile)) {
        findings = JSON.parse(
            fs.readFileSync(findingsFile, 'utf-8')
        )
    }

    const violations = results.violations ?? []
    const passes = results.passes?.length ?? 0
    const incomplete = results.incomplete?.length ?? 0

    const browser = reportName
        .replace('.html', '')
        .split('-')
        .pop()

    const testCase = reportName.match(/TC\d+/)?.[0] ?? 'Unknown'

    summary.totalScans += 1
    summary.totalViolations += violations.length
    summary.totalPasses += passes
    summary.totalIncomplete += incomplete

    summary.results.push({
        testCase,
        browser,
        violations: violations.length,
        passes,
        incomplete
    })

    findings.scans.push({
        testCase,
        browser,
        reportName,
        violations: violations.map(violation => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            help: violation.help,
            helpUrl: violation.helpUrl,

            affectedElements: violation.nodes.map(node => ({
                target: node.target,
                html: node.html,
                failureSummary: node.failureSummary
            }))
        }))
    })

    fs.writeFileSync(
        summaryFile,
        JSON.stringify(summary, null, 2)
    )

    fs.writeFileSync(
        findingsFile,
        JSON.stringify(findings, null, 2)
    )
}