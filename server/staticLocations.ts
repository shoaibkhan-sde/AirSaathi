/**
 * Authoritative static registry of known Indian cities and PIN codes
 * used for instantaneous offline-safe resolution and fallbacks.
 */

export interface KnownLocationEntry {
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  pinCodes: string[];
}

export const STATIC_KNOWN_LOCATIONS: readonly KnownLocationEntry[] = [
  {
    city: 'Nandura',
    region: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    lat: 20.8342,
    lon: 76.4592,
    pinCodes: ['443404'],
  },
  {
    city: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    lat: 18.5204,
    lon: 73.8567,
    pinCodes: [
      '411001',
      '411002',
      '411004',
      '411005',
      '411007',
      '411014',
      '411038',
      '411045',
      '411057',
    ],
  },
  {
    city: 'Delhi',
    region: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    lat: 28.6139,
    lon: 77.209,
    pinCodes: ['110001', '110002', '110003', '110006', '110016', '110020', '110029', '110092'],
  },
  {
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    countryCode: 'IN',
    lat: 19.076,
    lon: 72.8777,
    pinCodes: ['400001', '400002', '400020', '400050', '400051', '400076', '400099'],
  },
  {
    city: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    lat: 12.9716,
    lon: 77.5946,
    pinCodes: ['560001', '560002', '560025', '560034', '560068', '560100'],
  },
  {
    city: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    countryCode: 'IN',
    lat: 17.385,
    lon: 78.4867,
    pinCodes: ['500001', '500003', '500032', '500081', '500084'],
  },
  {
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    countryCode: 'IN',
    lat: 13.0827,
    lon: 80.2707,
    pinCodes: ['600001', '600002', '600018', '600028', '600036'],
  },
  {
    city: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    lat: 26.9124,
    lon: 75.7873,
    pinCodes: ['302001', '302004', '302015', '302020'],
  },
  {
    city: 'Lucknow',
    region: 'Uttar Pradesh',
    country: 'India',
    countryCode: 'IN',
    lat: 26.8467,
    lon: 80.9462,
    pinCodes: ['226001', '226010', '226016', '226024'],
  },
];

export function findStaticLocation(query: string): KnownLocationEntry | undefined {
  const normalized = query.trim().toLowerCase();
  return STATIC_KNOWN_LOCATIONS.find(
    (loc) =>
      loc.pinCodes.includes(normalized) ||
      loc.city.toLowerCase() === normalized ||
      normalized.includes(loc.city.toLowerCase())
  );
}
