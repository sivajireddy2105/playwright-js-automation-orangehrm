const fs = require('fs')

const findingsFile =
    'reports/accessibility/accessibility-findings.json'
const summaryFile =
    'reports/accessibility/accessibility-summary.json'
const baselineFile =
    'config/accessibility-baseline.json'

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`)
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch (error) {
        throw new Error(
            `Unable to read valid JSON from ${filePath}: ${error.message}`
        )
    }
}

function normalizeTarget(target) {
    const targetParts = Array.isArray(target)
        ? target
        : [String(target ?? '')]

    return targetParts
        .map(part =>
            String(part)
                .replace(/\[data-v-[^\]]+\]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        )
        .join(' >> ')
}

function extractFindings(scan) {
    const findings = []

    for (const violation of scan.violations) {
        const elements = violation.affectedElements ?? []

        if (!Array.isArray(elements)) {
            throw new Error(
                `Invalid affectedElements array in ${scan.testCase} | ${scan.browser} | ${violation.id}`
            )
        }

        if (elements.length === 0) {
            findings.push({
                ruleId: violation.id,
                impact: violation.impact ?? 'unknown',
                target: '<rule-level>',
                normalizedTarget: '<rule-level>',
                description: violation.description ?? ''
            })

            continue
        }

        for (const element of elements) {
            const target = Array.isArray(element.target)
                ? element.target
                : [String(element.target ?? '<unknown-target>')]

            findings.push({
                ruleId: violation.id,
                impact: violation.impact ?? 'unknown',
                target,
                normalizedTarget: normalizeTarget(target),
                description: violation.description ?? ''
            })
        }
    }

    return findings
}

function scanKey(scan) {
    return `${scan.testCase}|${scan.browser}`
}

function findingKey(finding) {
    return JSON.stringify([
        finding.ruleId,
        finding.impact ?? 'unknown',
        finding.normalizedTarget ?? normalizeTarget(finding.target)
    ])
}

// Preserve duplicate occurrences instead of overwriting them in a Map.
function countFindings(findings) {
    const counts = new Map()

    for (const finding of findings) {
        const key = findingKey(finding)
        const existing = counts.get(key)

        if (existing) {
            existing.count++
        } else {
            counts.set(key, {
                count: 1,
                finding
            })
        }
    }

    return counts
}

function validateScan(scan, sourceName) {
    if (
        !scan ||
        typeof scan.testCase !== 'string' ||
        !scan.testCase ||
        typeof scan.browser !== 'string' ||
        !scan.browser ||
        !Array.isArray(scan.violations)
    ) {
        throw new Error(
            `Invalid scan in ${sourceName}: testCase, browser and violations are required.`
        )
    }

    for (const violation of scan.violations) {
        if (!violation || typeof violation.id !== 'string' || !violation.id) {
            throw new Error(
                `Invalid violation entry in ${sourceName}: each violation must have an id.`
            )
        }
    }
}

function createScanMap(scans, sourceName, useBaselineFindings = false) {
    const scanMap = new Map()

    for (const scan of scans) {
        if (useBaselineFindings) {
            if (!scan || !Array.isArray(scan.findings)) {
                throw new Error(
                    `Invalid baseline scan: each scan must contain a findings array.`
                )
            }
        } else {
            validateScan(scan, sourceName)
        }

        const key = scanKey(scan)

        if (scanMap.has(key)) {
            throw new Error(`Duplicate scan found in ${sourceName}: ${key}`)
        }

        scanMap.set(
            key,
            useBaselineFindings
                ? scan
                : {
                    ...scan,
                    findings: extractFindings(scan)
                }
        )
    }

    return scanMap
}

function validateSummaryCoverage(summary, currentScans) {
    if (!Array.isArray(summary.results)) {
        throw new Error(
            'Invalid accessibility summary: expected a results array.'
        )
    }

    const summaryKeys = summary.results.map(result => {
        if (
            !result ||
            typeof result.testCase !== 'string' ||
            typeof result.browser !== 'string'
        ) {
            throw new Error(
                'Invalid summary result: testCase and browser are required.'
            )
        }

        return scanKey(result)
    })

    if (new Set(summaryKeys).size !== summaryKeys.length) {
        throw new Error(
            'Duplicate test/browser entries found in accessibility-summary.json.'
        )
    }

    if (
        summaryKeys.length !== currentScans.size ||
        summaryKeys.some(key => !currentScans.has(key))
    ) {
        throw new Error(
            'The detailed findings and summary do not contain the same unique scans. ' +
            'Run the complete accessibility suite before validating.'
        )
    }
}

function validateFindingShape(finding, scanKeyValue) {
    if (
        !finding ||
        typeof finding.ruleId !== 'string' ||
        !finding.ruleId ||
        typeof finding.impact !== 'string' ||
        typeof finding.normalizedTarget !== 'string'
    ) {
        throw new Error(
            `Invalid baseline finding in ${scanKeyValue}. ` +
            'Recreate the version-2 baseline using the baseline script.'
        )
    }
}

try {
    const report = readJsonFile(findingsFile)
    const summary = readJsonFile(summaryFile)
    const baseline = readJsonFile(baselineFile)

    if (
        !report ||
        !Array.isArray(report.scans) ||
        report.scans.length === 0
    ) {
        throw new Error(
            'The accessibility findings report must contain a non-empty scans array.'
        )
    }

    if (
        !summary ||
        !Array.isArray(summary.results)
    ) {
        throw new Error(
            'The accessibility summary must contain a results array.'
        )
    }

    if (
        !baseline ||
        baseline.version !== 2 ||
        !Array.isArray(baseline.scans) ||
        baseline.scans.length === 0
    ) {
        throw new Error(
            'A valid version-2 baseline with a non-empty scans array is required. ' +
            'Review the findings before recreating the baseline.'
        )
    }

    const currentScans = createScanMap(
        report.scans,
        'accessibility-findings.json'
    )

    const baselineScans = createScanMap(
        baseline.scans,
        'accessibility-baseline.json',
        true
    )

    for (const [key, baselineScan] of baselineScans) {
        for (const finding of baselineScan.findings) {
            validateFindingShape(finding, key)
        }
    }

    validateSummaryCoverage(summary, currentScans)

    console.log('\n========================================')
    console.log('Accessibility Regression Validation')
    console.log('========================================')
    console.log(`Total scans      : ${summary.totalScans ?? currentScans.size}`)
    console.log(`Total violations : ${summary.totalViolations ?? 'N/A'}`)
    console.log(`Total passes     : ${summary.totalPasses ?? 'N/A'}`)
    console.log(`Total incomplete : ${summary.totalIncomplete ?? 'N/A'}`)
    console.log(`Baseline version : ${baseline.version}`)

    let regressionFound = false
    let newFindingCount = 0
    let resolvedFindingCount = 0
    let unchangedFindingCount = 0

    // Every current scan must have a matching baseline scan.
    for (const key of currentScans.keys()) {
        if (!baselineScans.has(key)) {
            console.error(`NEW SCAN WITHOUT BASELINE: ${key}`)
            regressionFound = true
        }
    }

    // Every baseline scan must still be present in the current run.
    for (const key of baselineScans.keys()) {
        if (!currentScans.has(key)) {
            console.error(`BASELINE SCAN MISSING FROM CURRENT RUN: ${key}`)
            regressionFound = true
        }
    }

    console.log('\nResults against baseline:')

    for (const [key, currentScan] of currentScans) {
        const baselineScan = baselineScans.get(key)

        // Scan coverage errors are already reported above.
        if (!baselineScan) {
            continue
        }

        const currentFindings = countFindings(currentScan.findings)
        const baselineFindings = countFindings(baselineScan.findings)

        const allFindingKeys = new Set([
            ...currentFindings.keys(),
            ...baselineFindings.keys()
        ])

        for (const findingId of allFindingKeys) {
            const currentEntry = currentFindings.get(findingId)
            const baselineEntry = baselineFindings.get(findingId)

            const currentCount = currentEntry?.count ?? 0
            const baselineCount = baselineEntry?.count ?? 0
            const difference = currentCount - baselineCount

            unchangedFindingCount += Math.min(
                currentCount,
                baselineCount
            )

            if (difference > 0) {
                regressionFound = true
                newFindingCount += difference

                const finding = currentEntry.finding
                const target =
                    finding.normalizedTarget ??
                    normalizeTarget(finding.target)

                console.error(
                    `NEW FINDING x${difference} | ${key} | ` +
                    `[${finding.impact.toUpperCase()}] ` +
                    `${finding.ruleId} | ${target}`
                )
            }

            if (difference < 0) {
                const resolvedCount = Math.abs(difference)
                resolvedFindingCount += resolvedCount

                const finding = baselineEntry.finding
                const target =
                    finding.normalizedTarget ??
                    normalizeTarget(finding.target)

                console.log(
                    `RESOLVED x${resolvedCount} | ${key} | ` +
                    `[${finding.impact.toUpperCase()}] ` +
                    `${finding.ruleId} | ${target}`
                )
            }
        }
    }

    console.log('\n========================================')
    console.log(`Unchanged occurrences : ${unchangedFindingCount}`)
    console.log(`New occurrences       : ${newFindingCount}`)
    console.log(`Resolved occurrences  : ${resolvedFindingCount}`)

    if (regressionFound) {
        console.error(
            '\nACCESSIBILITY REGRESSION FAILED: ' +
            'New findings or scan coverage problems were detected.'
        )

        process.exitCode = 1
    } else {
        console.log(
            '\nACCESSIBILITY REGRESSION PASSED: ' +
            'No new findings detected.'
        )

        process.exitCode = 0
    }
} catch (error) {
    console.error(
        `\nAccessibility validation failed: ${error.message}`
    )

    process.exitCode = 1
}