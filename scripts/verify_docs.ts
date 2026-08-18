import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = resolve(process.env.ATLAS_PROJECT_ROOT ?? process.cwd());
const DOCS_ROOT = join(ROOT, "docs");
const GENERATED_ROOT = join(DOCS_ROOT, "generated");
const SCRIPT_PATH = join(ROOT, "scripts/verify_docs.ts");
const REPORT_JSON = join(GENERATED_ROOT, "document-consistency.json");
const REPORT_MD = join(GENERATED_ROOT, "document-consistency.md");
const COMMAND = "npm run verify:docs";
const GENERATOR_VERSION = "1.0.0";

const REQUIRED_TOP_LEVEL_FILES = [
  "memoized-riding-giraffe.md",
  "README.md",
  "PRODUCT_BLUEPRINT.md",
  "CORPUS_AND_EDITORIAL_POLICY.md",
  "CONTENT_COVERAGE_MATRIX.md",
  "ENTITY_AND_DATA_DICTIONARY.md",
  "TAXONOMY.md",
  "GEOGRAPHY_AND_MAPS.md",
  "REFERENCE_MAP_AUDIT.md",
  "CHRONOLOGY_MODEL.md",
  "VISUAL_DESIGN_SYSTEM.md",
  "MEDIA_ICON_ILLUSTRATION_POLICY.md",
  "SOUND_RECONSTRUCTION_POLICY.md",
  "ARCHITECTURE.md",
  "API_CONTRACT.md",
  "ASSET_MANIFEST_SPEC.md",
  "PERFORMANCE_BUDGETS.md",
  "TEST_AND_VERIFICATION_PLAN.md",
  "HANDOFF.md",
  "HANDOFF_TEMPLATE.md",
  "DECISION_LOG.md",
  "RISK_REGISTER.md",
  "EXPERT_REVIEW_QUESTIONS.md",
  "RELEASE_CHECKLIST.md",
  "REVIEWER_ASSIGNMENTS_2026-08-15.md",
  "MAP_IMPLEMENTATION_STRATEGY_2026-08-15.md",
  "FANTASY_COMPOSITE_MAP_ART_DIRECTION_2026-08-15.md",
  "FANTASY_COMPOSITE_MAP_GENERATION_STATUS.md",
] as const;
const REQUIRED_SUPPORT_FILES = [
  "generated/README.md",
  "prompts/fantasy-composite-map-v1.txt",
] as const;

const METADATA_FILES = REQUIRED_TOP_LEVEL_FILES.filter(
  (file) => !["memoized-riding-giraffe.md", "README.md", "HANDOFF_TEMPLATE.md"].includes(file),
);
const DOCUMENT_STATUSES = new Set(["draft", "review_ready", "frozen", "blocked", "superseded"]);
const EVIDENCE_LEVELS = new Set([
  "local_candidate",
  "isolated_database",
  "built_static_artifact",
  "staging",
  "production",
]);

type Severity = "error" | "warning" | "info";

type Finding = {
  checkId: string;
  severity: Severity;
  file?: string;
  line?: number;
  message: string;
};

type InputRecord = {
  path: string;
  bytes: number;
  sha256: string;
};

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function lineNumber(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function addFinding(findings: Finding[], finding: Finding): void {
  findings.push(finding);
}

function uniqueIds(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => match[1]).filter((value): value is string => Boolean(value));
}

function expectedSequence(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(3, "0")}`);
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path);
    }
  }
  return files.sort();
}

function markdownReport(report: {
  generatedAt: string;
  generatorSha256: string;
  result: "pass" | "fail";
  counts: { inputs: number; checks: number; errors: number; warnings: number; info: number };
  findings: Finding[];
  inputs: InputRecord[];
}): string {
  const findingRows =
    report.findings.length === 0
      ? "| — | info | — | — | 未发现问题 |"
      : report.findings
          .map(
            (finding) =>
              `| ${finding.checkId} | ${finding.severity} | ${finding.file ?? "—"} | ${
                finding.line ?? "—"
              } | ${finding.message.replaceAll("|", "\\|")} |`,
          )
          .join("\n");
  const inputRows = report.inputs
    .map((input) => `| ${input.path} | ${input.bytes} | \`${input.sha256}\` |`)
    .join("\n");

  return `# 《山海经 Atlas》文档一致性报告

- 生成命令：\`${COMMAND}\`
- 生成器版本：\`${GENERATOR_VERSION}\`
- 生成器 SHA-256：\`${report.generatorSha256}\`
- 生成时间：\`${report.generatedAt}\`
- 证据层级：\`local_candidate\`
- 检查结果：\`${report.result}\`
- 输入文件：${report.counts.inputs}
- 检查数：${report.counts.checks}
- errors / warnings / info：${report.counts.errors} / ${report.counts.warnings} / ${report.counts.info}
- Gate 结论：\`blocked\`；本报告只证明机械一致性，不替代专家评审、输入冻结或 Gate 0 授权。

## 检查范围

- 必备文档 inventory；
- Markdown 本地链接；
- 文档状态、证据层级与核心蓝图元数据；
- 文档状态和五层 evidence 枚举；
- concept / occurrence / corpus coverage 三项独立统计术语；
- 四个独立证据维度；
- decision、risk 与 expert question ID 连续性；
- README 清单与真实文件一致性；
- 禁止用旧枚举 \`static_artifact\` 代替 \`built_static_artifact\`。

## Findings

| Check | Severity | File | Line | Message |
|---|---|---|---:|---|
${findingRows}

## 输入与 checksum

| Path | Bytes | SHA-256 |
|---|---:|---|
${inputRows}

## 解释边界

\`pass\` 只表示以上机械检查在声明输入上通过。底本、段落切分、Pilot scope、枚举语义、学术结论、版权、声学、双语、无障碍和性能 reviewer 仍未由本报告批准；不得据此开始 schema、seed、API、UI、资产生成、staging 或 production。
`;
}

async function main(): Promise<void> {
  const findings: Finding[] = [];
  let checks = 0;

  const requiredPaths = REQUIRED_TOP_LEVEL_FILES.map((file) => join(DOCS_ROOT, file));
  const supportPaths = REQUIRED_SUPPORT_FILES.map((file) => join(DOCS_ROOT, file));
  const inputPaths = [...requiredPaths, ...supportPaths];
  const texts = new Map<string, string>();
  const inputs: InputRecord[] = [];

  for (const path of inputPaths) {
    checks += 1;
    if (!(await isFile(path))) {
      addFinding(findings, {
        checkId: "required-file",
        severity: "error",
        file: relative(ROOT, path),
        message: "必备文件缺失",
      });
      continue;
    }
    const text = await readFile(path, "utf8");
    texts.set(path, text);
    inputs.push({
      path: relative(ROOT, path),
      bytes: Buffer.byteLength(text),
      sha256: sha256(text),
    });
  }

  const markdownFiles = await listMarkdownFiles(DOCS_ROOT);
  const reportPaths = new Set([REPORT_JSON, REPORT_MD]);
  const sourceMarkdownFiles = markdownFiles.filter((path) => !reportPaths.has(path));

  for (const path of sourceMarkdownFiles) {
    const text = texts.get(path) ?? (await readFile(path, "utf8"));
    texts.set(path, text);
    const linkPattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/gu;
    for (const match of text.matchAll(linkPattern)) {
      checks += 1;
      const target = match[1]?.trim() ?? "";
      if (!target || /^(?:https?:|mailto:|#)/u.test(target)) continue;
      const fileTarget = target.split("#", 1)[0];
      if (!fileTarget) continue;
      const resolvedTarget = resolve(dirname(path), decodeURIComponent(fileTarget));
      if (!(await isFile(resolvedTarget))) {
        addFinding(findings, {
          checkId: "markdown-link",
          severity: "error",
          file: relative(ROOT, path),
          line: lineNumber(text, match.index ?? 0),
          message: `本地链接不存在：${target}`,
        });
      }
    }
  }

  for (const file of METADATA_FILES) {
    const path = join(DOCS_ROOT, file);
    const text = texts.get(path);
    if (!text) continue;
    const header = text.split("\n").slice(0, 14).join("\n");

    checks += 1;
    const statusMatch = header.match(/^- (?:文档状态|状态)：`([^`]+)`/mu);
    if (!statusMatch) {
      addFinding(findings, {
        checkId: "document-status",
        severity: "error",
        file: relative(ROOT, path),
        message: "文件首部缺少文档状态",
      });
    } else if (!DOCUMENT_STATUSES.has(statusMatch[1] ?? "")) {
      addFinding(findings, {
        checkId: "document-status",
        severity: "error",
        file: relative(ROOT, path),
        line: lineNumber(text, statusMatch.index ?? 0),
        message: `非法文档状态：${statusMatch[1]}`,
      });
    }

    checks += 1;
    const evidenceMatch = header.match(/^- 证据层级：`([^`]+)`/mu);
    if (!evidenceMatch) {
      addFinding(findings, {
        checkId: "evidence-level",
        severity: "error",
        file: relative(ROOT, path),
        message: "文件首部缺少证据层级",
      });
    } else if (!EVIDENCE_LEVELS.has(evidenceMatch[1] ?? "")) {
      addFinding(findings, {
        checkId: "evidence-level",
        severity: "error",
        file: relative(ROOT, path),
        line: lineNumber(text, evidenceMatch.index ?? 0),
        message: `非法证据层级：${evidenceMatch[1]}`,
      });
    }

    checks += 1;
    if (!header.includes("[memoized-riding-giraffe.md](memoized-riding-giraffe.md)")) {
      addFinding(findings, {
        checkId: "blueprint-link",
        severity: "error",
        file: relative(ROOT, path),
        message: "文件首部缺少核心蓝图链接",
      });
    }
  }

  for (const path of sourceMarkdownFiles) {
    const text = texts.get(path) ?? "";
    for (const match of text.matchAll(/`static_artifact`/gu)) {
      checks += 1;
      addFinding(findings, {
        checkId: "canonical-evidence-enum",
        severity: "error",
        file: relative(ROOT, path),
        line: lineNumber(text, match.index ?? 0),
        message: "使用旧证据层级 static_artifact；应为 built_static_artifact",
      });
    }
  }

  const handoffTemplate = texts.get(join(DOCS_ROOT, "HANDOFF_TEMPLATE.md")) ?? "";
  checks += 1;
  if (!handoffTemplate.includes("`draft` / `review_ready` / `frozen`")) {
    addFinding(findings, {
      checkId: "canonical-document-status",
      severity: "error",
      file: "docs/HANDOFF_TEMPLATE.md",
      message: "交接模板未使用 canonical 文档状态 draft/review_ready/frozen",
    });
  }

  const coverageDocuments = [
    "memoized-riding-giraffe.md",
    "PRODUCT_BLUEPRINT.md",
    "CONTENT_COVERAGE_MATRIX.md",
    "HANDOFF.md",
  ];
  for (const file of coverageDocuments) {
    const text = texts.get(join(DOCS_ROOT, file)) ?? "";
    checks += 1;
    const requiredTerms = ["unique creature concepts", "textual occurrences", "corpus coverage"];
    const missing = requiredTerms.filter((term) => !text.includes(term));
    if (missing.length > 0) {
      addFinding(findings, {
        checkId: "coverage-terms",
        severity: "error",
        file: `docs/${file}`,
        message: `缺少独立统计术语：${missing.join(", ")}`,
      });
    }
  }

  const evidenceDimensionDocuments = [
    "README.md",
    "CORPUS_AND_EDITORIAL_POLICY.md",
    "ARCHITECTURE.md",
    "HANDOFF.md",
    "TEST_AND_VERIFICATION_PLAN.md",
  ];
  const evidenceDimensions = [
    "source_attestation",
    "interpretation_class",
    "geographic_confidence",
    "rights_status",
  ];
  for (const file of evidenceDimensionDocuments) {
    const text = texts.get(join(DOCS_ROOT, file)) ?? "";
    checks += 1;
    const missing = evidenceDimensions.filter((term) => !text.includes(term));
    if (missing.length > 0) {
      addFinding(findings, {
        checkId: "evidence-dimensions",
        severity: "error",
        file: `docs/${file}`,
        message: `缺少独立证据维度：${missing.join(", ")}`,
      });
    }
  }

  // Governance IDs must start at 001 and stay contiguous. New entries may be
  // appended (the log is append-only), but the historical minimum may never
  // shrink and no gaps may appear.
  const idChecks = [
    { file: "DECISION_LOG.md", pattern: /^### (SJ-D\d{3})：/gmu, prefix: "SJ-D", minimum: 9 },
    { file: "RISK_REGISTER.md", pattern: /^\| (SJ-R\d{3}) \|/gmu, prefix: "SJ-R", minimum: 16 },
    { file: "EXPERT_REVIEW_QUESTIONS.md", pattern: /^\| (SJ-E\d{3}) \|/gmu, prefix: "SJ-E", minimum: 14 },
  ];
  for (const check of idChecks) {
    checks += 1;
    const text = texts.get(join(DOCS_ROOT, check.file)) ?? "";
    const actual = uniqueIds(text, check.pattern);
    const expected = expectedSequence(check.prefix, Math.max(actual.length, check.minimum));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      addFinding(findings, {
        checkId: "governance-id-sequence",
        severity: "error",
        file: `docs/${check.file}`,
        message: `ID 序列不连续或低于历史下限；expected=${expected.join(",")} actual=${actual.join(",")}`,
      });
    }
  }

  const readme = texts.get(join(DOCS_ROOT, "README.md")) ?? "";
  for (const file of REQUIRED_TOP_LEVEL_FILES) {
    if (file === "README.md") continue;
    checks += 1;
    if (!readme.includes(file)) {
      addFinding(findings, {
        checkId: "readme-inventory",
        severity: "error",
        file: "docs/README.md",
        message: `README 清单缺少 ${file}`,
      });
    }
  }

  checks += 1;
  const expertQuestions = texts.get(join(DOCS_ROOT, "EXPERT_REVIEW_QUESTIONS.md")) ?? "";
  const reviewerAssignments = texts.get(join(DOCS_ROOT, "REVIEWER_ASSIGNMENTS_2026-08-15.md")) ?? "";
  if (expertQuestions.includes("| 未指定 | unassigned |")) {
    addFinding(findings, {
      checkId: "gate-blocker-reviewers",
      severity: "info",
      file: "docs/EXPERT_REVIEW_QUESTIONS.md",
      message: "专家 reviewer 尚未指定；Gate 0 必须继续 blocked",
    });
  } else if (reviewerAssignments.includes("external_human_signoff_pending")) {
    addFinding(findings, {
      checkId: "gate-blocker-external-signoff",
      severity: "info",
      file: "docs/REVIEWER_ASSIGNMENTS_2026-08-15.md",
      message: "项目责任 reviewer 已指定，但外部人工签署仍待完成；Gate 0 必须继续 blocked",
    });
  }

  const errors = findings.filter((finding) => finding.severity === "error").length;
  const warnings = findings.filter((finding) => finding.severity === "warning").length;
  const info = findings.filter((finding) => finding.severity === "info").length;
  const generatedAt = new Date().toISOString();
  const generatorBytes = await readFile(SCRIPT_PATH);
  const report = {
    schemaVersion: "1.0.0",
    reportId: "shanhaijing-document-consistency",
    command: COMMAND,
    generatorVersion: GENERATOR_VERSION,
    generatorSha256: sha256(generatorBytes),
    generatedAt,
    evidenceLevel: "local_candidate",
    result: errors === 0 ? ("pass" as const) : ("fail" as const),
    gateTransitionAuthorized: false,
    gateStatus: "blocked",
    counts: {
      inputs: inputs.length,
      checks,
      errors,
      warnings,
      info,
    },
    findings,
    inputs,
  };

  await writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(REPORT_MD, markdownReport(report), "utf8");

  console.log(
    `Shanhaijing document consistency ${report.result}: ${report.counts.inputs} inputs, ${checks} checks, ${errors} errors, ${warnings} warnings, ${info} info`,
  );
  console.log(`Reports: ${relative(ROOT, REPORT_JSON)}, ${relative(ROOT, REPORT_MD)}`);
  if (errors > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
