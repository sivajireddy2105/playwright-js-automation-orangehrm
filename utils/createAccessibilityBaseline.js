const fs = require('fs')
const path = require('path')

const findingsFile = 'reports/accessibility/accessibility-findings.json'
const summaryFile = 'reports/accessibility/accessibility-summary.json'
const baselineDirectory = 'config'
const baselineFile = path.join(
    baselineDirectory,
    'accessibility-baseline.json'
)

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`)
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function normalizeTarget(target) {
    const targetParts = Array.isArray(target)
        ? target
        : [String(target ?? '')]

    return targetParts
        .map(part => String(part)
            .replace(/\[data-v-[^\]]+\]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .join(' >> ')
}

function extractFindings(scan) {
    const findings = []

    for (const violation of scan.violations) {
        const affectedElements = violation.affectedElements ?? []

        // Preserve rule-level violations if no affected elements are provided.
        if (affectedElements.length === 0) {
            findings.push({
                ruleId: violation.id,
                impact: violation.impact ?? 'unknown',
                target: '<rule-level>',
                normalizedTarget: '<rule-level>',
                description: violation.description ?? '',
                helpUrl: violation.helpUrl ?? ''
            })

            continue
        }

        for (const element of affectedElements) {
            const target = Array.isArray(element.target)
                ? element.target
                : [String(element.target ?? '<unknown-target>')]

            findings.push({
                ruleId: violation.id,
                impact: violation.impact ?? 'unknown',
                target,
                normalizedTarget: normalizeTarget(target),
                description: violation.description ?? '',
                helpUrl: violation.helpUrl ?? ''
            })
        }
    }

    return findings
}

try {
    const report = readJsonFile(findingsFile)
    const summary = readJsonFile(summaryFile)

    if (!Array.isArray(report.scans) || report.scans.length === 0) {
        throw new Error(
            'findings.json must contain a non-empty scans array.'
        )
    }

    if (!Array.isArray(summary.results)) {
        throw new Error(
            'accessibility-summary.json must contain a results array.'
        )
    }

    const scanKeys = new Set()

    const scans = report.scans.map(scan => {
        if (
            !scan.testCase ||
            !scan.browser ||
            !Array.isArray(scan.violations)
        ) {
            throw new Error(
                'Each scan must contain testCase, browser and violations.'
            )
        }

        const scanKey = `${scan.testCase}|${scan.browser}`

        if (scanKeys.has(scanKey)) {
            throw new Error(`Duplicate scan found: ${scanKey}`)
        }

        scanKeys.add(scanKey)

        return {
            testCase: scan.testCase,
            browser: scan.browser,
            reportName: scan.reportName ?? '',
            findings: extractFindings(scan)
        }
    })

    const summaryKeys = new Set(
        summary.results.map(result =>
            `${result.testCase}|${result.browser}`
        )
    )

    if (
        summaryKeys.size !== summary.results.length ||
        summaryKeys.size !== scanKeys.size ||
        [...summaryKeys].some(key => !scanKeys.has(key))
    ) {
        throw new Error(
            'Findings and summary do not contain the same unique scans. ' +
            'Run the complete accessibility suite before creating a baseline.'
        )
    }

    fs.mkdirSync(baselineDirectory, { recursive: true })

    const baseline = {
        version: 2,
        generatedFrom: findingsFile,
        scans
    }

    fs.writeFileSync(
        baselineFile,
        JSON.stringify(baseline, null, 2)
    )

    const totalFindings = scans.reduce(
        (total, scan) => total + scan.findings.length,
        0
    )

    console.log('\nAccessibility baseline created successfully.')
    console.log(`File: ${baselineFile}`)
    console.log(`Scans: ${scans.length}`)
    console.log(`Affected-element findings: ${totalFindings}`)
    console.log(
        'Review the baseline changes before committing them.'
    )
} catch (error) {
    console.error(`\nBaseline creation failed: ${error.message}`)
    process.exit(1)
}