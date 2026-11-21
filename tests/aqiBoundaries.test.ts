import test from 'node:test';
import assert from 'node:assert/strict';
import { mapUSAQICategory } from '../server/airQualityService.ts';

test('AQI Boundary: 0 is Good', () => {
  assert.equal(mapUSAQICategory(0), 'Good');
});

test('AQI Boundary: 50 is Good', () => {
  assert.equal(mapUSAQICategory(50), 'Good');
});

test('AQI Boundary: 51 is Moderate', () => {
  assert.equal(mapUSAQICategory(51), 'Moderate');
});

test('AQI Boundary: 100 is Moderate', () => {
  assert.equal(mapUSAQICategory(100), 'Moderate');
});

test('AQI Boundary: 101 is Unhealthy for Sensitive Groups', () => {
  assert.equal(mapUSAQICategory(101), 'Unhealthy for Sensitive Groups');
});

test('AQI Boundary: 150 is Unhealthy for Sensitive Groups', () => {
  assert.equal(mapUSAQICategory(150), 'Unhealthy for Sensitive Groups');
});

test('AQI Boundary: 151 is Unhealthy', () => {
  assert.equal(mapUSAQICategory(151), 'Unhealthy');
});

test('AQI Boundary: 200 is Unhealthy', () => {
  assert.equal(mapUSAQICategory(200), 'Unhealthy');
});

test('AQI Boundary: 201 is Very Unhealthy', () => {
  assert.equal(mapUSAQICategory(201), 'Very Unhealthy');
});

test('AQI Boundary: 300 is Very Unhealthy', () => {
  assert.equal(mapUSAQICategory(300), 'Very Unhealthy');
});

test('AQI Boundary: 301 is Hazardous', () => {
  assert.equal(mapUSAQICategory(301), 'Hazardous');
});

test('AQI Boundary: Extreme 500 is Hazardous', () => {
  assert.equal(mapUSAQICategory(500), 'Hazardous');
});
