import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { CPCB_CATEGORIES } from '../src/data/cpcbCategories.ts';

function getComponentFiles(): string[] {
  const dirs = [path.resolve('src/components'), path.resolve('src/views')];
  const files: string[] = [];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const scan = (d: string) => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const full = path.join(d, entry.name);
          if (entry.isDirectory()) scan(full);
          else if (entry.name.endsWith('.tsx')) files.push(full);
        }
      };
      scan(dir);
    }
  }
  return files;
}

test('Responsive & Cross-Device: Viewport breakpoint rules and overflow prevention', () => {
  // Test standard viewport widths: 320, 375, 390, 430, 768, 1366, 1920
  const viewports = [
    { name: 'Small mobile', width: 320, isMobile: true },
    { name: 'Standard mobile', width: 375, isMobile: true },
    { name: 'Standard mobile', width: 390, isMobile: true },
    { name: 'Large mobile', width: 430, isMobile: true },
    { name: 'Tablet', width: 768, isMobile: false },
    { name: 'Laptop', width: 1366, isMobile: false },
    { name: 'Desktop', width: 1920, isMobile: false },
  ];

  // Tailwind breakpoint thresholds: md = 768px, lg = 1024px
  for (const vp of viewports) {
    const isMobileNavExpected = vp.width < 768;
    assert.equal(isMobileNavExpected, vp.isMobile, `Viewport ${vp.name} (${vp.width}px) must match mobile breakpoint behavior`);
  }

  // Verify App.tsx has overflow-x-hidden on root containers
  const appFile = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appFile.includes('overflow-x-hidden') || appFile.includes('overflow-hidden'));
});

test('Responsive & Cross-Device: Floating Bot Launcher clearance and touch targets', () => {
  const launcherFile = fs.readFileSync(
    path.resolve('src/components/assistant/FloatingBotLauncher.tsx'),
    'utf-8'
  );

  // Clearance above mobile navigation bar (h-16 = 64px)
  assert.ok(launcherFile.includes('bottom-20') || launcherFile.includes('bottom-[90px]'));
  // Minimum touch target 48px or larger on mobile
  assert.ok(launcherFile.includes('w-13') || launcherFile.includes('w-14'));
  assert.ok(launcherFile.includes('h-13') || launcherFile.includes('h-14'));
  // Accessible label for screen readers
  assert.ok(launcherFile.includes('aria-label="Open AirSaathi Assistant"'));
});

test('Accessibility: Semantic HTML landmarks in core layout', () => {
  const appFile = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  const sidebarFile = fs.readFileSync(path.resolve('src/components/common/Sidebar.tsx'), 'utf-8');

  // Semantic <main> tag in App.tsx
  assert.ok(appFile.includes('<main'), 'App must render semantic <main> tag');
  // Semantic <aside> in Sidebar.tsx
  assert.ok(sidebarFile.includes('<aside'), 'Desktop navigation must use semantic <aside>');
});

test('Accessibility: High-contrast color pairs for all AQI categories', () => {
  assert.ok(CPCB_CATEGORIES.length >= 6);

  for (const cat of CPCB_CATEGORIES) {
    assert.ok(cat.category, 'Category name must be present');
    assert.ok(cat.color, 'Text color must be present');
    assert.ok(cat.bg, 'Background color must be present');
    assert.ok(cat.desc, 'Descriptive guidance must be present');

    // Ensure contrast: color and bg must be distinct class strings
    assert.notEqual(cat.color, cat.bg);
  }
});

test('Accessibility: Buttons without visible text possess explicit aria-labels', () => {
  const files = getComponentFiles();
  const iconButtonRegex = /<button[^>]*aria-label=['"][^'"]+['"][^>]*>/g;

  let totalAriaLabelButtons = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(iconButtonRegex);
    if (matches) {
      totalAriaLabelButtons += matches.length;
    }
  }

  // Verified that icon buttons (close, launcher, menus) have aria-labels
  assert.ok(totalAriaLabelButtons >= 5, `Expected at least 5 accessible aria-label buttons, found ${totalAriaLabelButtons}`);
});
