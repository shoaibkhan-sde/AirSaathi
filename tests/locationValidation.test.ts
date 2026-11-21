import test from 'node:test';
import assert from 'node:assert/strict';
import { roundCoordinate, isValidCoordinate } from '../server/geocodingService.ts';

test('Location Validation: Valid coordinates with Number.isFinite()', () => {
  assert.equal(isValidCoordinate(20.83, 76.46), true);
  assert.equal(isValidCoordinate(0, 0), true);
  assert.equal(isValidCoordinate(-90, -180), true);
  assert.equal(isValidCoordinate(90, 180), true);
});

test('Location Validation: Latitude out of range (> 90 or < -90)', () => {
  assert.equal(isValidCoordinate(90.1, 76.46), false);
  assert.equal(isValidCoordinate(-90.1, 76.46), false);
});

test('Location Validation: Longitude out of range (> 180 or < -180)', () => {
  assert.equal(isValidCoordinate(20.83, 180.1), false);
  assert.equal(isValidCoordinate(20.83, -180.1), false);
});

test('Location Validation: Malformed coordinates (NaN / Infinity / Non-numeric)', () => {
  assert.equal(isValidCoordinate(NaN, 76.46), false);
  assert.equal(isValidCoordinate(20.83, Infinity), false);
  assert.equal(isValidCoordinate(-Infinity, 76.46), false);
  assert.equal(isValidCoordinate('20.83' as unknown as number, 76.46), false);
  assert.equal(isValidCoordinate(undefined as unknown as number, 76.46), false);
  assert.equal(isValidCoordinate(null as unknown as number, 76.46), false);
});

test('Location Validation: Rounding coordinates to 2 decimal places for approximate privacy', () => {
  assert.equal(roundCoordinate(20.8342), 20.83);
  assert.equal(roundCoordinate(76.4592), 76.46);
  assert.equal(roundCoordinate(-33.8688), -33.87);
  assert.equal(roundCoordinate(18.523456), 18.52);
});
