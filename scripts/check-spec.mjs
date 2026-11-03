#!/usr/bin/env node
// Spec check — the Definition of Ready as code. See specs/README.md.
// Usage: node scripts/check-spec.mjs [specs/<NN-feature> ...]   (no args = every feature in specs/)
// Exit code 1 when any spec has errors. With status: draft, ready-only problems are warnings.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const REQUIRED_SECTIONS = [
  'Goal', 'Users and roles', 'User stories', 'Scope', 'Screens and flow',
  'Data', 'States', 'Business rules', 'Acceptance criteria', 'Open questions',
];
const REQUIRED_FRONT = ['feature', 'status', 'owner', 'jira', 'mira'];
const REQUIRED_STATES = ['default', 'loading', 'empty', 'error', 'no permission'];
const LABELS = ['Confirmed', 'Assumption', 'Open question'];

function tableRows(text, idPrefix) {
  return text.split('\n')
    .filter((l) => l.trim().startsWith(`| ${idPrefix}`))
    .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
}

function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z]+):\s*(.*?)\s*(#.*)?$/);
    if (kv) out[kv[1]] = kv[2];
  }
  return out;
}

function checkFeature(dir) {
  const errors = [];
  const readyBlockers = [];
  const specPath = join(dir, 'spec.md');
  const rulesPath = join(dir, 'business-rules.md');
  if (!existsSync(specPath)) return { errors: ['spec.md is missing'], readyBlockers, status: '?' };
  if (!existsSync(rulesPath)) errors.push('business-rules.md is missing');
  const spec = readFileSync(specPath, 'utf8');
  const rules = existsSync(rulesPath) ? readFileSync(rulesPath, 'utf8') : '';

  // Front matter
  const fm = frontMatter(spec);
  if (!fm) errors.push('front matter (--- ... ---) is missing');
  const status = fm?.status ?? '?';
  for (const k of REQUIRED_FRONT) {
    if (!fm?.[k] || fm[k].startsWith('<')) errors.push(`front matter: "${k}" is empty`);
  }
  if (fm && !['draft', 'ready'].includes(status)) errors.push(`front matter: status must be draft or ready (got "${status}")`);

  // Sections
  const headings = [...spec.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  for (const s of REQUIRED_SECTIONS) if (!headings.includes(s)) errors.push(`section "## ${s}" is missing`);

  // States
  const states = tableRows(spec, 'ST-');
  const stateIds = states.map((r) => r[0]);
  for (const name of REQUIRED_STATES) {
    if (!states.some((r) => (r[1] || '').toLowerCase().includes(name))) {
      errors.push(`state "${name}" is missing (add it, or mark it "N/A — <reason>")`);
    }
  }

  // Business rules
  const brRows = tableRows(rules, 'BR-');
  const brIds = brRows.map((r) => r[0]);
  if (brRows.length === 0) errors.push('business-rules.md has no BR- rules');
  for (const [id, , label, , acceptedBy] of brRows) {
    if (!LABELS.includes(label)) errors.push(`${id}: label must be one of ${LABELS.join(' / ')} (got "${label}")`);
    if (label === 'Open question') readyBlockers.push(`${id} is still an Open question`);
    if (label === 'Assumption' && !acceptedBy) readyBlockers.push(`${id} is an Assumption without "Accepted by"`);
  }

  // Duplicates
  for (const [kind, ids] of [['BR', brIds], ['ST', stateIds]]) {
    const seen = new Set();
    for (const id of ids) { if (seen.has(id)) errors.push(`duplicate ${kind} id ${id}`); seen.add(id); }
  }

  // Acceptance criteria
  const acBlocks = spec.split(/^### /m).slice(1).filter((b) => b.startsWith('AC-'));
  const acIds = [];
  const covered = new Set();
  const known = new Set([...brIds, ...stateIds]);
  if (acBlocks.length === 0) errors.push('no acceptance criteria (### AC-...)');
  for (const block of acBlocks) {
    const body = block.split(/^## /m)[0];
    const id = body.match(/^(AC-[A-Z]+-\d+)/)?.[1] ?? body.split('\n')[0];
    if (acIds.includes(id)) errors.push(`duplicate AC id ${id}`);
    acIds.push(id);
    const cov = body.match(/^Covers:\s*(.+)$/m);
    if (!cov) errors.push(`${id}: "Covers:" line is missing`);
    else for (const ref of cov[1].split(',').map((s) => s.trim()).filter(Boolean)) {
      if (!known.has(ref)) errors.push(`${id}: covers ${ref}, which does not exist`);
      covered.add(ref);
    }
    for (const word of ['Given', 'When', 'Then']) {
      if (!new RegExp(`\\*\\*${word}\\*\\*`).test(body)) errors.push(`${id}: "**${word}**" is missing`);
    }
  }
  for (const id of [...brIds, ...stateIds]) if (!covered.has(id)) errors.push(`${id} is not covered by any acceptance criterion`);

  // Open questions
  for (const [id, , , answer] of tableRows(spec, 'OQ-')) {
    if (!answer) readyBlockers.push(`${id} has no answer`);
  }
  const todos = spec.split('\n').filter((l) => /\bTODO\b/.test(l)).length;
  if (todos) readyBlockers.push(`${todos} line(s) with TODO in spec.md`);

  return { errors, readyBlockers, status, counts: { BR: brIds.length, ST: stateIds.length, AC: acIds.length } };
}

const root = 'specs';
let targets = process.argv.slice(2);
if (targets.length === 0) {
  targets = readdirSync(root).filter((d) => !d.startsWith('_') && statSync(join(root, d)).isDirectory()).map((d) => join(root, d));
}

let failed = false;
for (const dir of targets) {
  const { errors, readyBlockers, status, counts } = checkFeature(dir);
  const isReady = status === 'ready';
  const allErrors = isReady ? [...errors, ...readyBlockers] : errors;
  const ok = allErrors.length === 0;
  if (!ok) failed = true;
  const c = counts ? ` · ${counts.BR} rules, ${counts.ST} states, ${counts.AC} criteria` : '';
  console.log(`\n${ok ? 'PASS' : 'FAIL'}  ${basename(dir)}  (status: ${status})${c}`);
  for (const e of allErrors) console.log(`  ✗ ${e}`);
  if (!isReady && readyBlockers.length) {
    console.log(`  Blocks "status: ready" (${readyBlockers.length}):`);
    for (const w of readyBlockers) console.log(`  · ${w}`);
  }
}
process.exit(failed ? 1 : 0);
