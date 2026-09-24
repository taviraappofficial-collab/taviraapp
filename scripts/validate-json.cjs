const fs = require('node:fs');
const path = require('node:path');

const ignored = new Set(['.git', '.pnpm-store', 'node_modules']);
let count = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.json')) {
      JSON.parse(fs.readFileSync(target, 'utf8'));
      count += 1;
    }
  }
}

walk(process.cwd());
console.log(`Validated ${count} JSON files.`);
