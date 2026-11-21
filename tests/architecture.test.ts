import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const MAX_FILE_LINES = 205; // Strict quality gate <= ~200 lines

function getSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getSourceFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

test('Architecture: Every source file in src/, server/, and tests/ is <= ~200 lines', () => {
  const srcFiles = getSourceFiles(path.resolve('src'));
  const serverFiles = getSourceFiles(path.resolve('server'));
  const testFiles = getSourceFiles(path.resolve('tests'));
  const allFiles = [...srcFiles, ...serverFiles, ...testFiles];

  const oversizedFiles: Array<{ file: string; lines: number }> = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n').length;
    if (lines > MAX_FILE_LINES) {
      oversizedFiles.push({ file: path.relative(path.resolve('.'), file), lines });
    }
  }

  assert.deepEqual(
    oversizedFiles,
    [],
    `Found files exceeding line limit (${MAX_FILE_LINES}): ${JSON.stringify(oversizedFiles, null, 2)}`
  );
});

test('Architecture: Browser bundle in src/ never imports from server/ or Node.js built-ins', () => {
  const srcFiles = getSourceFiles(path.resolve('src'));
  const forbiddenImports = [
    '../server',
    '../../server',
    'node:fs',
    'node:http',
    'node:child_process',
    'fs',
    'http',
    'https',
    'child_process',
  ];

  const violations: Array<{ file: string; line: string }> = [];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('export * from')) {
        for (const forbidden of forbiddenImports) {
          if (trimmed.includes(`'${forbidden}`) || trimmed.includes(`"${forbidden}`)) {
            violations.push({
              file: `${path.relative(path.resolve('.'), file)}:${idx + 1}`,
              line: trimmed,
            });
          }
        }
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    `Found browser files importing server or Node built-ins: ${JSON.stringify(violations, null, 2)}`
  );
});

test('Architecture: Server files do not import React or DOM dependencies', () => {
  const serverFiles = getSourceFiles(path.resolve('server'));
  const forbidden = ['react', 'react-dom'];

  const violations: Array<{ file: string; line: string }> = [];

  for (const file of serverFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('export * from')) {
        for (const f of forbidden) {
          if (trimmed.includes(`'${f}'`) || trimmed.includes(`"${f}"`)) {
            violations.push({
              file: `${path.relative(path.resolve('.'), file)}:${idx + 1}`,
              line: trimmed,
            });
          }
        }
      }
    });
  }

  assert.deepEqual(
    violations,
    [],
    `Found server files importing React: ${JSON.stringify(violations, null, 2)}`
  );
});
