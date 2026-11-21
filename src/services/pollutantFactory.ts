import type { PollutantDetail } from '../types';

export function createPollutants(
  pm25: number,
  pm10: number,
  no2: number,
  co: number,
  o3: number,
  so2: number
): PollutantDetail[] {
  return [
    {
      code: 'PM2.5',
      name: 'Fine Particulate Matter',
      value: pm25,
      unit: 'µg/m³',
      status: pm25 > 60 ? 'Poor' : 'Satisfactory',
      standardLimit: '60 µg/m³ (24h)',
      healthImpact: 'Penetrates deep into alveolar tissues',
      sources: 'Vehicular exhaust, dust resuspension',
    },
    {
      code: 'PM10',
      name: 'Coarse Particulates',
      value: pm10,
      unit: 'µg/m³',
      status: pm10 > 100 ? 'Moderate' : 'Good',
      standardLimit: '100 µg/m³ (24h)',
      healthImpact: 'Nasal and upper airway irritation',
      sources: 'Road dust, construction',
    },
    {
      code: 'NO₂',
      name: 'Nitrogen Dioxide',
      value: no2,
      unit: 'µg/m³',
      status: 'Good',
      standardLimit: '80 µg/m³ (24h)',
      healthImpact: 'Airway inflammation in asthmatics',
      sources: 'Diesel engine combustion',
    },
    {
      code: 'CO',
      name: 'Carbon Monoxide',
      value: co,
      unit: 'mg/m³',
      status: 'Good',
      standardLimit: '4 mg/m³ (8h)',
      healthImpact: 'Reduces oxygen delivery to organs',
      sources: 'Incomplete petrol/gas burning',
    },
    {
      code: 'O₃',
      name: 'Surface Ozone',
      value: o3,
      unit: 'µg/m³',
      status: 'Good',
      standardLimit: '100 µg/m³ (8h)',
      healthImpact: 'Deep lung lining irritation',
      sources: 'Photochemical smog reactions',
    },
    {
      code: 'SO₂',
      name: 'Sulphur Dioxide',
      value: so2,
      unit: 'µg/m³',
      status: 'Good',
      standardLimit: '80 µg/m³ (24h)',
      healthImpact: 'Bronchial constriction',
      sources: 'Industrial furnaces, diesel fuel',
    },
  ];
}
