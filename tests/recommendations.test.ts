import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePersonalizedRecommendations } from '../server/recommendationService.ts';

test('Recommendations: Severe AQI prioritizes children and seniors precautions', () => {
  const mockAqi = {
    value: 260,
    scale: 'US AQI' as const,
    category: 'Very Unhealthy' as const,
    dataType: 'model_estimate' as const,
    source: 'Open-Meteo CAMS Global' as const,
    observedAt: '2026-11-20T12:00',
    fetchedAt: '2026-11-20T12:05',
    spatialResolutionKm: 45,
    timezone: 'Asia/Kolkata',
    dominantPollutant: 'PM2.5',
    pollutants: { pm2_5: 180, pm10: 240, unit: 'µg/m³' as const },
    modelNotice: 'Modelled data',
  };

  const recs = generatePersonalizedRecommendations(mockAqi, {
    location: { name: 'Nandura', country: 'India' },
    householdMembers: ['children', 'seniors'],
    healthSensitivities: ['Asthma or respiratory condition'],
    commuteMode: 'Walking',
    homeType: 'Apartment',
    cookingFuel: 'LPG or piped gas',
    heatingFuel: 'No heating / Not applicable',
    hasAirPurifier: false,
  });

  assert.ok(recs.length > 0);
  assert.ok(recs.some((r) => r.title.includes('outdoor') || r.title.includes('exercise')));
  assert.ok(
    recs.some((r) =>
      r.relevantProfileFactors.some((f) => f.includes('children') || f.includes('AQI'))
    )
  );
});

test('Recommendations: Biomass cooking fuel triggers unvented smoke safety advice', () => {
  const mockAqi = {
    value: 75,
    scale: 'US AQI' as const,
    category: 'Moderate' as const,
    dataType: 'model_estimate' as const,
    source: 'Open-Meteo CAMS Global' as const,
    observedAt: '2026-11-20T12:00',
    fetchedAt: '2026-11-20T12:05',
    spatialResolutionKm: 45,
    timezone: 'Asia/Kolkata',
    dominantPollutant: 'PM2.5',
    pollutants: { pm2_5: 22, pm10: 45, unit: 'µg/m³' as const },
    modelNotice: 'Modelled data',
  };

  const recs = generatePersonalizedRecommendations(mockAqi, {
    location: { name: 'Nandura', country: 'India' },
    householdMembers: ['Adults 18 to 65 only'],
    commuteMode: 'Work from home',
    homeType: 'Independent house',
    cookingFuel: 'Biomass / wood',
    heatingFuel: 'No heating / Not applicable',
    hasAirPurifier: false,
  });

  const cookingRec = recs.find((r) => r.title.includes('ventilation') || r.title.includes('fuel'));
  assert.ok(cookingRec);
  assert.equal(cookingRec?.priority, 'High');
  assert.ok(
    cookingRec?.whyItMatters.includes('biomass') ||
      cookingRec?.whyItMatters.includes('carbon monoxide')
  );
});
