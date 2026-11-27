import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir: string, extension: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      files.push(...getFilesRecursively(fullPath, extension));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files;
}

test('Architecture: All src, server, and test files must adhere to the 205-line ceiling', () => {
  const dirs = ['src', 'server', 'tests'];
  const violations: string[] = [];

  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const tsFiles = getFilesRecursively(d, '.ts').concat(getFilesRecursively(d, '.tsx'));
    for (const f of tsFiles) {
      const content = fs.readFileSync(f, 'utf-8');
      const lines = content.split('\n').length;
      if (lines > 205) {
        violations.push(`${f} (${lines} lines > 205 ceiling)`);
      }
    }
  }

  assert.deepEqual(violations, [], `Files exceeding 205 lines: ${violations.join(', ')}`);
});

test('Architecture: Server code must not contain explicit any types', () => {
  const serverFiles = getFilesRecursively('server', '.ts');
  const anyViolations: string[] = [];

  const anyPattern = /:\s*any\b|\bas\s+any\b|<any>/;

  for (const f of serverFiles) {
    const lines = fs.readFileSync(f, 'utf-8').split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      if (anyPattern.test(line)) {
        anyViolations.push(`${f}:${idx + 1} -> ${trimmed}`);
      }
    });
  }

  assert.deepEqual(anyViolations, [], `Found explicit any types:\n${anyViolations.join('\n')}`);
});

test('Architecture: Project contains essential repository governance and CI files', () => {
  assert.ok(fs.existsSync('.github/workflows/ci.yml'), 'Missing .github/workflows/ci.yml');
  assert.ok(fs.existsSync('SECURITY.md'), 'Missing SECURITY.md');
  assert.ok(fs.existsSync('LICENSE'), 'Missing LICENSE');
  assert.ok(fs.existsSync('.editorconfig'), 'Missing .editorconfig');
});
