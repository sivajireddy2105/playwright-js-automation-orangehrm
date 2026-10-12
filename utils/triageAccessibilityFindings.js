const fs = require('fs')
const path = require('path')

const findingsFile =
    'reports/accessibility/accessibility-findings.json'

const outputDirectory = 'reports/accessibility'
const jsonOutput = path.join(
    outputDirectory,
    'accessibility-triage.json'
)
const markdownOutput = path.join(
    outputDirectory,
    'accessibility-triage.md'
)

const impactRank = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
    unknown: 4
}

function readJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`)
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function normalizeTarget(target) {
    const parts = Array.isArray(target)
        ? target
        : [String(target ?? '<unknown-target>')]

    return parts
        .map(part =>
            String(part)
                .replace(/\[data-v-[^\]]+\]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        )
        .join(' >> ')
}

function escapeMarkdown(value) {
    return String(value ?? '').replace(/\|/g, '\\|')
}

function main() {
    const report = readJsonFile(findingsFile)

    if (!Array.isArray(report.scans) || report.scans.length === 0) {
        throw new Error(
            'The findings report must contain a non-empty scans array.'
        )
    }

    const ruleGroups = new Map()
    const scanSummaries = []
    let totalRuleViolations = 0
    let totalAffectedElements = 0

    for (const scan of report.scans) {
        if (
            !scan.testCase ||
            !scan.browser ||
            !Array.isArray(scan.violations)
        ) {
            throw new Error(
                'Every scan must contain testCase, browser and violations.'
            )
        }

        let scanAffectedElements = 0

        for (const violation of scan.violations) {
            const ruleId = violation.id
            const impact = violation.impact ?? 'unknown'
            const elements = violation.affectedElements ?? []
            const groupKey = JSON.stringify([ruleId, impact])

            totalRuleViolations++
            scanAffectedElements += elements.length
            totalAffectedElements += elements.length

            if (!ruleGroups.has(groupKey)) {
                ruleGroups.set(groupKey, {
                    ruleId,
                    impact,
                    description: violation.description ?? '',
                    help: violation.help ?? '',
                    helpUrl: violation.helpUrl ?? '',
                    ruleOccurrences: 0,
                    affectedElements: 0,
                    scans: new Set(),
                    selectors: new Set()
                })
            }

            const group = ruleGroups.get(groupKey)
            group.ruleOccurrences++
            group.affectedElements += elements.length
            group.scans.add(`${scan.testCase} | ${scan.browser}`)

            for (const element of elements) {
                const selector = normalizeTarget(element.target)
                if (selector) {
                    group.selectors.add(selector)
                }
            }
        }

        scanSummaries.push({
            testCase: scan.testCase,
            browser: scan.browser,
            ruleViolations: scan.violations.length,
            affectedElements: scanAffectedElements
        })
    }

    const rules = [...ruleGroups.values()]
        .map(group => ({
            ruleId: group.ruleId,
            impact: group.impact,
            description: group.description,
            help: group.help,
            helpUrl: group.helpUrl,
            ruleOccurrences: group.ruleOccurrences,
            affectedElements: group.affectedElements,
            scanCount: group.scans.size,
            scans: [...group.scans].sort(),
            selectorExamples: [...group.selectors].sort().slice(0, 5),
            uniqueSelectorCount: group.selectors.size
        }))
        .sort((a, b) =>
            (impactRank[a.impact] ?? 4) -
            (impactRank[b.impact] ?? 4) ||
            b.affectedElements - a.affectedElements ||
            a.ruleId.localeCompare(b.ruleId)
        )

    const triage = {
        generatedAt: new Date().toISOString(),
        source: findingsFile,
        scanCount: report.scans.length,
        totalRuleViolations,
        totalAffectedElements,
        ruleGroupCount: rules.length,
        rules,
        scans: scanSummaries.sort((a, b) =>
            `${a.testCase}|${a.browser}`.localeCompare(
                `${b.testCase}|${b.browser}`
            )
        )
    }

    fs.mkdirSync(outputDirectory, { recursive: true })
    fs.writeFileSync(jsonOutput, JSON.stringify(triage, null, 2))

    const markdown = [
        '# Accessibility Triage Report',
        '',
        `- Scans: ${triage.scanCount}`,
        `- Rule violations across scans: ${totalRuleViolations}`,
        `- Affected-element occurrences: ${totalAffectedElements}`,
        `- Rule/impact groups: ${rules.length}`,
        '',
        '> This report prioritizes findings. It does not determine whether an issue is a false positive or confirm that an issue has been fixed.',
        '',
        '## Findings grouped by impact and rule',
        '',
        '| Impact | Rule | Scan occurrences | Affected elements | Scans affected |',
        '|---|---|---:|---:|---:|',
        ...rules.map(rule =>
            `| ${escapeMarkdown(rule.impact)} | ` +
            `${escapeMarkdown(rule.ruleId)} | ` +
            `${rule.ruleOccurrences} | ${rule.affectedElements} | ` +
            `${rule.scanCount} |`
        ),
        '',
        '## Prioritized details',
        '',
        ...rules.map(rule => [
            `### ${rule.impact.toUpperCase()} — ${rule.ruleId}`,
            '',
            rule.description,
            '',
            `- Rule occurrences: ${rule.ruleOccurrences}`,
            `- Affected-element occurrences: ${rule.affectedElements}`,
            `- Scans affected: ${rule.scanCount}`,
            rule.helpUrl ? `- Guidance: ${rule.helpUrl}` : '',
            '- Example selectors:',
            ...(rule.selectorExamples.length
                ? rule.selectorExamples.map(selector => `  - \`${selector}\``)
                : ['  - No affected-element selectors recorded']),
            '',
            'Affected scans:',
            ...rule.scans.map(scan => `- ${scan}`),
            ''
        ].filter(Boolean).join('\n'))
    ].join('\n')

    fs.writeFileSync(markdownOutput, markdown)

    console.log('\nAccessibility triage report generated.')
    console.log(`Scans: ${triage.scanCount}`)
    console.log(`Rule violations: ${totalRuleViolations}`)
    console.log(`Affected-element occurrences: ${totalAffectedElements}`)
    console.log(`Rule/impact groups: ${rules.length}`)
    console.log(`Markdown report: ${markdownOutput}`)
    console.log(`JSON report: ${jsonOutput}`)

    console.log('\nHighest-priority groups:')
    for (const rule of rules.slice(0, 10)) {
        console.log(
            `[${rule.impact.toUpperCase()}] ${rule.ruleId} | ` +
            `${rule.affectedElements} affected-element occurrences | ` +
            `${rule.scanCount} scans`
        )
    }
}

try {
    main()
} catch (error) {
    console.error(`Accessibility triage failed: ${error.message}`)
    process.exit(1)
}