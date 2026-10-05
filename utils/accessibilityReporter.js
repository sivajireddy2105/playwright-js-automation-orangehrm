import { createHtmlReport } from 'axe-html-reporter'

import { recordAccessibilitySummary } from './accessibilitySummary'

export function generateAccessibilityReport(results, reportName) {
    createHtmlReport({
        results,
        options: {
            outputDir: 'reports/accessibility',
            reportFileName: reportName,
            projectKey: 'OrangeHRM Accessibility'
        }
    })

    recordAccessibilitySummary(results, reportName)
}


export function logAccessibilityResults(results, pageName) {
    const violations = results.violations

    console.log(`\n${pageName} - Accessibility violations found: ${violations.length}`)

    for (const violation of violations) {
        console.log(`\n[${violation.impact?.toUpperCase()}] ${violation.id}`)
        console.log(`Description: ${violation.description}`)
        console.log(`Help: ${violation.help}`)
        console.log(`Help URL: ${violation.helpUrl}`)
        console.log(`Affected elements: ${violation.nodes.length}`)
    }

    const criticalViolations = violations.filter(
        violation => violation.impact === 'critical'
    )

    console.log(
        `\n${pageName} - Critical accessibility violations: ${criticalViolations.length}`
    )

    if (criticalViolations.length > 0) {
        console.warn(
            `\nKnown critical accessibility violations detected on the ${pageName}. ` +
            'Test will continue, but please review the accessibility report for details.'
        )
    }
}