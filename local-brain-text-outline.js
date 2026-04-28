#!/usr/bin/env node
// Walk a TheBrain subtree via the Local API (TheBrain 15+) and print a
// tab-indented text outline to stdout, matching the format that
// outline2jsx.js consumes.

const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8001';

function usage() {
  console.error('Usage: node local-brain-text-outline.js <brainId> <rootThoughtId>');
  process.exit(1);
}

const brainId = process.argv[2];
const rootId = process.argv[3];
if (!brainId || !rootId) usage();

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

const headers = { Authorization: `Bearer ${apiKey}` };

async function getJson(urlPath) {
  const res = await fetch(BASE + urlPath, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET ${urlPath} -> HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function checkAppRunning() {
  try {
    const res = await fetch(BASE + '/api/app/state', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();
  } catch (e) {
    console.error(
      `TheBrain app does not appear to be running (GET /api/app/state failed: ${e.message})`
    );
    process.exit(1);
  }
}

const visited = new Set();
const writeLine = (s) => process.stdout.write(s + '\n');
const indent = (n) => '\t'.repeat(n);

async function getNotesText(thoughtId) {
  try {
    const j = await getJson(`/api/notes/${brainId}/${thoughtId}/text`);
    return typeof j?.text === 'string' ? j.text : '';
  } catch {
    return '';
  }
}

async function emit(thought, depth, prefetchedGraph) {
  if (visited.has(thought.id)) {
    writeLine(indent(depth) + '# ' + thought.name);
    return;
  }
  visited.add(thought.id);
  writeLine(indent(depth) + thought.name);

  const graph =
    prefetchedGraph ||
    (await getJson(`/api/thoughts/${brainId}/${thought.id}/graph`));

  const noteText = await getNotesText(thought.id);
  if (noteText) {
    for (const line of noteText.split('\n')) {
      writeLine(indent(depth + 1) + '- ' + line);
    }
  }

  for (const att of graph.attachments || []) {
    if (att.isNotes) continue;
    writeLine(indent(depth + 1) + '+ ' + (att.location || att.name || ''));
  }

  const children = (graph.children || []).slice();
  children.sort((a, b) => a.name.localeCompare(b.name));
  for (const child of children) {
    await emit({ id: child.id, name: child.name }, depth + 1);
  }
}

(async () => {
  await checkAppRunning();
  const rootGraph = await getJson(`/api/thoughts/${brainId}/${rootId}/graph`);
  const root = rootGraph.activeThought;
  await emit({ id: root.id, name: root.name }, 0, rootGraph);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
