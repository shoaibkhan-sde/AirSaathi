import type { LocationDirectoryItem } from './locationDirectoryTypes';
import { createPollutants } from './pollutantFactory.ts';

export const INTERNATIONAL_LOCATIONS: LocationDirectoryItem[] = [
  {
    id: 'toronto',
    name: 'Toronto',
    region: 'ON',
    country: 'Canada',
    pinCodes: ['M5V', 'M5H', 'M4Y', 'M6J', 'M5R'],
    lat: 43.6532,
    lon: -79.3832,
    stationName: 'Downtown Toronto Central Station #4',
    baselineAQI: 42,
    dominantPollutant: 'PM2.5',
    temp: '14°C',
    humidity: '68%',
    wind: '9 km/h NW',
    pollutants: createPollutants(10.2, 22.0, 18.0, 0.4, 36.0, 4.2),
  },
];
