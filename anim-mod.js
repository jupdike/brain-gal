#!/usr/bin/env node
// Regroup the direct children of "Films, Animated" by 4-digit year prefix:
// for each child named "YYYY <Title>", ensure a year thought "YYYY" exists
// under the parent, rename the child to strip the year, link it under the
// year, and unlink it from the parent. Dry-run unless --apply is passed.

const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8001';
const BRAIN_ID = '0d18cb9f-43d2-4ca6-992e-6089a226eaf8';
const PARENT_ID = 'b837287a-a52b-54fe-add0-f925d9b850a0'; // Films, Animated

const APPLY = process.argv.includes('--apply');

const apiKeyPath = path.join(__dirname, 'build', 'api-key.txt');
let apiKey;
try {
  apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
} catch (e) {
  console.error(`Could not read ${apiKeyPath}: ${e.message}`);
  process.exit(1);
}
if (!apiKey) {
  console.error(`${apiKeyPath} is empty`);
  process.exit(1);
}

const authHeaders = { Authorization: `Bearer ${apiKey}` };
const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json' };
const patchHeaders = { ...authHeaders, 'Content-Type': 'application/json-patch+json' };

async function req(method, urlPath, { body, headers } = {}) {
  const res = await fetch(BASE + urlPath, {
    method,
    headers: headers || (body ? jsonHeaders : authHeaders),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${urlPath} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function checkAppRunning() {
  try {
    const res = await fetch(BASE + '/api/app/state', { headers: authHeaders });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();
  } catch (e) {
    console.error(
      `TheBrain app does not appear to be running (GET /api/app/state failed: ${e.message})`
    );
    process.exit(1);
  }
}

const tag = APPLY ? '   ' : 'DRY';
const log = (s) => console.log(`${tag} ${s}`);

async function createYearThought(year) {
  if (!APPLY) return `<new-${year}>`;
  const res = await req('POST', `/api/thoughts/${BRAIN_ID}`, {
    body: {
      name: year,
      kind: 1,
      sourceThoughtId: PARENT_ID,
      relation: 1,
    },
  });
  return res.id;
}

async function renameThought(thoughtId, newName) {
  if (!APPLY) return;
  await req('PATCH', `/api/thoughts/${BRAIN_ID}/${thoughtId}`, {
    body: [{ op: 'replace', path: '/name', value: newName }],
    headers: patchHeaders,
  });
}

async function linkChild(parentId, childId) {
  if (!APPLY) return;
  await req('POST', `/api/links/${BRAIN_ID}`, {
    body: { thoughtIdA: parentId, thoughtIdB: childId, relation: 1 },
  });
}

async function unlink(thoughtA, thoughtB) {
  if (!APPLY) return;
  const link = await req('GET', `/api/links/${BRAIN_ID}/${thoughtA}/${thoughtB}`);
  if (!link || !link.id) throw new Error(`no link found between ${thoughtA} and ${thoughtB}`);
  await req('DELETE', `/api/links/${BRAIN_ID}/${link.id}`);
}

(async () => {
  await checkAppRunning();

  const graph = await req('GET', `/api/thoughts/${BRAIN_ID}/${PARENT_ID}/graph`);
  const children = (graph.children || []).slice();
  children.sort((a, b) => a.name.localeCompare(b.name));

  // Seed year map from existing children whose names are bare 4-digit years.
  const yearToId = new Map();
  for (const c of children) {
    if (/^\d{4}$/.test(c.name)) yearToId.set(c.name, c.id);
  }

  const counts = { renamed: 0, yearsCreated: 0, linked: 0, unlinked: 0, warned: 0, skippedYears: 0 };

  for (const child of children) {
    if (/^\d{4}$/.test(child.name)) {
      counts.skippedYears++;
      continue;
    }

    const m = /^(\d{4})\s+(.+)$/.exec(child.name);
    if (!m) {
      console.warn(`WARN: no year prefix: "${child.name}" (id ${child.id})`);
      counts.warned++;
      continue;
    }

    const year = m[1];
    const newName = m[2].trim();

    log(`${child.name}`);
    log(`  rename -> "${newName}"`);

    let yearId = yearToId.get(year);
    if (!yearId) {
      yearId = await createYearThought(year);
      yearToId.set(year, yearId);
      counts.yearsCreated++;
      log(`  year   -> ${year} (created id=${yearId})`);
    } else {
      log(`  year   -> ${year} (existing id=${yearId})`);
    }

    await renameThought(child.id, newName);
    counts.renamed++;

    log(`  link   -> ${year} / ${newName} (child)`);
    await linkChild(yearId, child.id);
    counts.linked++;

    log(`  unlink -> Films, Animated / ${newName}`);
    await unlink(PARENT_ID, child.id);
    counts.unlinked++;
  }

  console.log('');
  console.log(`Mode:           ${APPLY ? 'APPLY' : 'DRY RUN (pass --apply to mutate)'}`);
  console.log(`Children seen:  ${children.length}`);
  console.log(`Years skipped:  ${counts.skippedYears}`);
  console.log(`Years created:  ${counts.yearsCreated}`);
  console.log(`Renamed:        ${counts.renamed}`);
  console.log(`Links added:    ${counts.linked}`);
  console.log(`Links removed:  ${counts.unlinked}`);
  console.log(`Warnings:       ${counts.warned}`);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
