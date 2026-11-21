import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { getAQICategory, mapUSAQICategory } from '../src/services/airQualityService.ts';

test('Accessibility: Viewport allows pinch-zoom and text resizing up to 200%', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
  assert.ok(
    !indexHtml.includes('user-scalable=no'),
    'index.html must not disable user-scalable (WCAG 1.4.4)'
  );
  assert.ok(
    !indexHtml.includes('maximum-scale=1.0'),
    'index.html must not lock maximum-scale to 1.0 (WCAG 1.4.4)'
  );
  assert.match(indexHtml, /<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*"/);
});

test('Accessibility: Global CSS contains focus-visible and reduced-motion rules', () => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
  assert.ok(
    css.includes(':focus-visible'),
    'index.css must define high-contrast :focus-visible rules (WCAG 2.4.7)'
  );
  assert.ok(
    css.includes('@media (prefers-reduced-motion: reduce)'),
    'index.css must provide reduced motion overrides (WCAG 2.3.3)'
  );
});

test('Accessibility: App layout provides Skip-to-Content link and main-content anchor', () => {
  const appSrc = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(
    appSrc.includes('Skip to main content'),
    'App.tsx must provide a bypass blocks link (WCAG 2.4.1)'
  );
  assert.ok(
    appSrc.includes('id="main-content"'),
    'App.tsx must target id="main-content" (WCAG 2.4.1)'
  );
});

test('Accessibility: Screen reader live regions are defined for dynamic status updates', () => {
  const toastSrc = fs.readFileSync(path.resolve('src/components/common/Toast.tsx'), 'utf-8');
  assert.ok(toastSrc.includes('aria-live="polite"'), 'Toast must have polite aria-live region');
  assert.ok(toastSrc.includes('role="region"'), 'ToastContainer must have region role');

  const chatSrc = fs.readFileSync(
    path.resolve('src/components/assistant/ChatWindow.tsx'),
    'utf-8'
  );
  assert.ok(chatSrc.includes('role="log"'), 'Chat window must use role="log" for message stream');
  assert.ok(chatSrc.includes('aria-live="polite"'), 'Chat window must announce updates politely');
});

test('Accessibility: Dialogs and drawers support Escape key and focus return', () => {
  const chatSrc = fs.readFileSync(
    path.resolve('src/components/assistant/ChatWindow.tsx'),
    'utf-8'
  );
  assert.ok(chatSrc.includes("'Escape'"), 'Chat window must dismiss on Escape key');
  assert.ok(
    chatSrc.includes('floating-bot-launcher'),
    'Chat window must restore focus to launcher on dismiss'
  );

  const mobileNavSrc = fs.readFileSync(
    path.resolve('src/components/common/MobileNav.tsx'),
    'utf-8'
  );
  assert.ok(mobileNavSrc.includes("'Escape'"), 'MobileNav drawer must dismiss on Escape key');
});

test('Accessibility: Onboarding form controls have unambiguous accessible names', () => {
  const locSrc = fs.readFileSync(
    path.resolve('src/components/onboarding/LocationSelectorCard.tsx'),
    'utf-8'
  );
  assert.ok(
    locSrc.includes('htmlFor="onboarding-country"') && locSrc.includes('id="onboarding-country"'),
    'Country selector must have htmlFor/id association'
  );
  assert.ok(
    locSrc.includes('htmlFor="onboarding-city"') && locSrc.includes('id="onboarding-city"'),
    'City input must have htmlFor/id association'
  );
  assert.ok(
    locSrc.includes('aria-busy={isLocating}'),
    'Locating button must expose aria-busy state'
  );

  const lifestyleSrc = fs.readFileSync(
    path.resolve('src/components/onboarding/lifestyle/PrimaryHomeLifestyleFields.tsx'),
    'utf-8'
  );
  assert.ok(
    lifestyleSrc.includes('aria-label="Main commute"'),
    'Commute select must have accessible label'
  );
  assert.ok(
    lifestyleSrc.includes('aria-label="Home type"'),
    'Home type select must have accessible label'
  );
  assert.ok(
    lifestyleSrc.includes('aria-label="Cooking fuel"'),
    'Cooking fuel select must have accessible label'
  );
});

test('Accessibility: Checkboxes and radio groups expose semantic ARIA states', () => {
  const householdSrc = fs.readFileSync(
    path.resolve('src/components/onboarding/HouseholdCard.tsx'),
    'utf-8'
  );
  assert.ok(
    householdSrc.includes('role="checkbox"') && householdSrc.includes('aria-checked='),
    'Household chips must expose role="checkbox" and aria-checked'
  );

  const purifierSrc = fs.readFileSync(
    path.resolve('src/components/onboarding/lifestyle/LifestyleAdditionalDetails.tsx'),
    'utf-8'
  );
  assert.ok(
    purifierSrc.includes('role="radiogroup"') && purifierSrc.includes('role="radio"'),
    'Air purifier choice must expose radiogroup and radio semantics'
  );

  const actionsSrc = fs.readFileSync(
    path.resolve('src/components/sustainability/SustainableActionsSection.tsx'),
    'utf-8'
  );
  assert.ok(
    actionsSrc.includes('role="checkbox"') && actionsSrc.includes('aria-checked='),
    'Sustainable actions must expose role="checkbox" and aria-checked'
  );
});

test('Accessibility: Air quality information never relies on color alone', () => {
  const testAqiValues = [25, 75, 125, 175, 250, 400];
  for (const aqi of testAqiValues) {
    const epaCategory = mapUSAQICategory(aqi);
    assert.ok(typeof epaCategory === 'string' && epaCategory.length > 0);
    const cpcbCategory = getAQICategory(aqi);
    assert.ok(typeof cpcbCategory === 'string' && cpcbCategory.length > 0);
  }

  const aqiHeroSrc = fs.readFileSync(
    path.resolve('src/components/dashboard/AQIHeroCard.tsx'),
    'utf-8'
  );
  assert.ok(
    aqiHeroSrc.includes('className="sr-only"'),
    'AQIHeroCard must include an explicit text summary for screen readers'
  );
  assert.ok(
    aqiHeroSrc.includes('{category}') && aqiHeroSrc.includes('{aqi}'),
    'AQIHeroCard must render category and numeric value textually'
  );
});

test('Accessibility: Progress bars expose aria-valuenow, valuemin, and valuemax', () => {
  const progressSrc = fs.readFileSync(
    path.resolve('src/components/sustainability/MyProgressSection.tsx'),
    'utf-8'
  );
  assert.ok(progressSrc.includes('role="progressbar"'));
  assert.ok(progressSrc.includes('aria-valuenow='));
  assert.ok(progressSrc.includes('aria-valuemin={0}'));
  assert.ok(progressSrc.includes('aria-valuemax={100}'));
});
