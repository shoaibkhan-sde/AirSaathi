// server/constants.ts
var MIN_LATITUDE = -90;
var MAX_LATITUDE = 90;
var MIN_LONGITUDE = -180;
var MAX_LONGITUDE = 180;
var COORDINATE_ROUND_FACTOR = 100;
var DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
var NOMINATIM_RATE_LIMIT_MS = 1050;
var HTTP_TIMEOUT_MS = 6e3;
var OPEN_METEO_TIMEOUT_MS = 7e3;
var DEFAULT_COUNTRY = "India";

// server/rateLimiter.ts
var SerializedRateLimiter = class {
  queue = [];
  isProcessing = false;
  minIntervalMs;
  lastExecutionTime = 0;
  constructor(intervalMs = NOMINATIM_RATE_LIMIT_MS) {
    this.minIntervalMs = intervalMs;
  }
  /**
   * Enqueues an asynchronous task to run sequentially after the required interval.
   */
  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }
  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const elapsed = Date.now() - this.lastExecutionTime;
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed));
    }
    const currentTask = this.queue.shift();
    if (currentTask) {
      this.lastExecutionTime = Date.now();
      try {
        await currentTask();
      } catch {
      }
    }
    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processNext();
    }
  }
  getQueueLength() {
    return this.queue.length;
  }
};
var nominatimRateLimiter = new SerializedRateLimiter(NOMINATIM_RATE_LIMIT_MS);

// server/config.ts
import { z } from "zod";
var ServerConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  OPEN_METEO_API_KEY: z.string().min(1).optional(),
  OPEN_METEO_API_BASE_URL: z.string().url().default("https://air-quality-api.open-meteo.com"),
  NOMINATIM_USER_AGENT: z.string().min(1).default("AirSaathi-Web/1.0"),
  REDIS_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.array(z.string()).default([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
  ]),
  RATE_LIMIT_SALT: z.string().default("airsaathi-secure-salt-2025"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});
function parseAllowedOrigins(raw) {
  if (!raw) {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3001",
      "http://127.0.0.1:3001"
    ];
  }
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}
function loadServerConfig() {
  const parsed = ServerConfigSchema.safeParse({
    PORT: process.env.PORT,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || void 0,
    GEMINI_MODEL: process.env.GEMINI_MODEL?.trim() || void 0,
    OPEN_METEO_API_KEY: process.env.OPEN_METEO_API_KEY?.trim() || void 0,
    OPEN_METEO_API_BASE_URL: process.env.OPEN_METEO_API_BASE_URL?.trim() || void 0,
    NOMINATIM_USER_AGENT: process.env.NOMINATIM_USER_AGENT?.trim() || void 0,
    REDIS_URL: process.env.REDIS_URL?.trim() || void 0,
    ALLOWED_ORIGINS: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
    RATE_LIMIT_SALT: process.env.RATE_LIMIT_SALT?.trim() || void 0,
    NODE_ENV: process.env.NODE_ENV || "development"
  });
  if (!parsed.success) {
    console.error("[ServerConfig] Invalid server environment config:", parsed.error.format());
    throw new Error("Server environment configuration failed validation.");
  }
  return Object.freeze(parsed.data);
}
var serverConfig = loadServerConfig();

// server/httpClient.ts
var ALLOWED_UPSTREAM_HOSTS = /* @__PURE__ */ new Set([
  "generativelanguage.googleapis.com",
  "air-quality-api.open-meteo.com",
  "geocoding-api.open-meteo.com",
  "customer-api.open-meteo.com",
  "nominatim.openstreetmap.org"
]);
function validateUpstreamUrl(urlStr) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid upstream URL format: ${urlStr}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`Upstream request blocked: only HTTPS is permitted (got ${parsed.protocol})`);
  }
  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_UPSTREAM_HOSTS.has(host)) {
    throw new Error(`Upstream request blocked: host "${host}" is not in the security allowlist.`);
  }
  return parsed;
}
async function safeFetch(urlStr, options = {}) {
  validateUpstreamUrl(urlStr);
  const timeoutMs = options.timeoutMs ?? 8e3;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const cleanHeaders = {};
  if (options.headers) {
    for (const [key, val] of Object.entries(options.headers)) {
      const lower = key.toLowerCase();
      if (lower === "cookie" || lower === "authorization" || lower === "proxy-authorization" || lower === "x-forwarded-for") {
        continue;
      }
      cleanHeaders[key] = val;
    }
  }
  try {
    const response = await fetch(urlStr, {
      method: options.method || "GET",
      headers: cleanHeaders,
      body: options.body,
      signal: controller.signal,
      redirect: "error"
      // Disallow redirects to prevent SSRF
    });
    return response;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw {
        code: "UPSTREAM_TIMEOUT",
        message: `Upstream request timed out after ${timeoutMs}ms.`
      };
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// server/reverseGeocoding.ts
var NominatimReverseProvider = class {
  name = "OpenStreetMap Nominatim";
  async reverseGeocode(lat, lon) {
    const userAgent = serverConfig.NOMINATIM_USER_AGENT;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&zoom=14&layer=address&accept-language=en`;
    return nominatimRateLimiter.enqueue(async () => {
      try {
        const res = await safeFetch(url, {
          timeoutMs: HTTP_TIMEOUT_MS,
          headers: { "User-Agent": userAgent, Accept: "application/json" }
        });
        if (!res.ok) return null;
        const json = await res.json();
        const addr = json.address || {};
        return {
          city: addr.city || addr.town || addr.village || addr.municipality || void 0,
          locality: addr.suburb || addr.neighbourhood || addr.city_district || void 0,
          district: addr.state_district || addr.county || void 0,
          state: addr.state || void 0,
          country: addr.country || void 0,
          countryCode: addr.country_code ? addr.country_code.toUpperCase() : void 0,
          postcode: addr.postcode || void 0,
          attribution: json.licence || "Data \xA9 OpenStreetMap contributors"
        };
      } catch {
        return null;
      }
    });
  }
};
var activeReverseProvider = new NominatimReverseProvider();

// server/staticLocations.ts
var STATIC_KNOWN_LOCATIONS = [
  {
    city: "Nandura",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    lat: 20.8342,
    lon: 76.4592,
    pinCodes: ["443404"]
  },
  {
    city: "Pune",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    lat: 18.5204,
    lon: 73.8567,
    pinCodes: [
      "411001",
      "411002",
      "411004",
      "411005",
      "411007",
      "411014",
      "411038",
      "411045",
      "411057"
    ]
  },
  {
    city: "Delhi",
    region: "Delhi",
    country: "India",
    countryCode: "IN",
    lat: 28.6139,
    lon: 77.209,
    pinCodes: ["110001", "110002", "110003", "110006", "110016", "110020", "110029", "110092"]
  },
  {
    city: "Mumbai",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    lat: 19.076,
    lon: 72.8777,
    pinCodes: ["400001", "400002", "400020", "400050", "400051", "400076", "400099"]
  },
  {
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    countryCode: "IN",
    lat: 12.9716,
    lon: 77.5946,
    pinCodes: ["560001", "560002", "560025", "560034", "560068", "560100"]
  },
  {
    city: "Hyderabad",
    region: "Telangana",
    country: "India",
    countryCode: "IN",
    lat: 17.385,
    lon: 78.4867,
    pinCodes: ["500001", "500003", "500032", "500081", "500084"]
  },
  {
    city: "Chennai",
    region: "Tamil Nadu",
    country: "India",
    countryCode: "IN",
    lat: 13.0827,
    lon: 80.2707,
    pinCodes: ["600001", "600002", "600018", "600028", "600036"]
  },
  {
    city: "Jaipur",
    region: "Rajasthan",
    country: "India",
    countryCode: "IN",
    lat: 26.9124,
    lon: 75.7873,
    pinCodes: ["302001", "302004", "302015", "302020"]
  },
  {
    city: "Lucknow",
    region: "Uttar Pradesh",
    country: "India",
    countryCode: "IN",
    lat: 26.8467,
    lon: 80.9462,
    pinCodes: ["226001", "226010", "226016", "226024"]
  }
];
function findStaticLocation(query) {
  const normalized = query.trim().toLowerCase();
  return STATIC_KNOWN_LOCATIONS.find(
    (loc) => loc.pinCodes.includes(normalized) || loc.city.toLowerCase() === normalized || normalized.includes(loc.city.toLowerCase())
  );
}

// server/forwardGeocoding.ts
function roundCoord(val) {
  return Math.round(val * COORDINATE_ROUND_FACTOR) / COORDINATE_ROUND_FACTOR;
}
async function forwardGeocodePin(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(query)}&country=India&format=jsonv2&addressdetails=1&accept-language=en`;
    const pinResult = await nominatimRateLimiter.enqueue(async () => {
      try {
        const res = await safeFetch(url, {
          timeoutMs: HTTP_TIMEOUT_MS,
          headers: {
            "User-Agent": serverConfig.NOMINATIM_USER_AGENT,
            Accept: "application/json"
          }
        });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    });
    if (!Array.isArray(pinResult) || pinResult.length === 0) return null;
    const first = pinResult[0];
    const addr = first.address || {};
    const settlement = addr.city || addr.town || addr.village || addr.municipality || addr.county || "Local Area";
    const state = addr.state || "Maharashtra";
    return {
      id: `pin_${query}`,
      name: settlement,
      city: settlement,
      district: addr.state_district || addr.county,
      region: state,
      state,
      country: addr.country || "India",
      countryCode: (addr.country_code || "in").toUpperCase(),
      latitude: roundCoord(parseFloat(first.lat)),
      longitude: roundCoord(parseFloat(first.lon)),
      postcode: addr.postcode || query,
      source: "pin",
      precision: "postal_code",
      attribution: first.licence || "Data \xA9 OpenStreetMap contributors"
    };
  } catch {
    return null;
  }
}
async function forwardGeocodeOpenMeteo(query, countryCode) {
  const apiKey = serverConfig.OPEN_METEO_API_KEY;
  const baseUrl = serverConfig.OPEN_METEO_API_BASE_URL.replace("air-quality-api", "geocoding-api");
  const params = new URLSearchParams({ name: query, count: "6", language: "en" });
  if (countryCode && countryCode.length === 2) params.set("countryCode", countryCode);
  if (apiKey) params.set("apikey", apiKey);
  let json = null;
  try {
    const res = await safeFetch(`${baseUrl}/v1/search?${params.toString()}`, {
      timeoutMs: OPEN_METEO_TIMEOUT_MS,
      headers: { Accept: "application/json" }
    });
    if (res.ok) json = await res.json();
  } catch {
    return null;
  }
  if (!json?.results || json.results.length === 0) return null;
  const primary = json.results[0];
  const candidates = json.results.map((r) => ({
    id: `geo_${r.id}`,
    name: r.name,
    region: r.admin1 || "",
    country: r.country || "Unknown",
    countryCode: (r.country_code || countryCode || "").toUpperCase(),
    latitude: roundCoord(r.latitude),
    longitude: roundCoord(r.longitude),
    postcode: r.postcodes?.[0]
  }));
  return {
    id: `geo_${primary.id}`,
    name: primary.name,
    city: primary.name,
    region: primary.admin1 || "",
    state: primary.admin1 || "",
    country: primary.country || "Unknown",
    countryCode: (primary.country_code || countryCode || "").toUpperCase(),
    latitude: roundCoord(primary.latitude),
    longitude: roundCoord(primary.longitude),
    postcode: primary.postcodes?.[0],
    source: /^\d{4,6}$/.test(query) ? "pin" : "manual",
    precision: /^\d{4,6}$/.test(query) ? "postal_code" : "city",
    candidates: candidates.length > 1 ? candidates : void 0
  };
}
async function forwardGeocodeNominatim(query, countryCode = "in") {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=${countryCode.toLowerCase()}&format=jsonv2&addressdetails=1&accept-language=en`;
    const searchResult = await nominatimRateLimiter.enqueue(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": process.env.NOMINATIM_USER_AGENT?.trim() || "AirSaathi-Web/1.0",
            Accept: "application/json"
          }
        });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    });
    if (!Array.isArray(searchResult) || searchResult.length === 0) return null;
    const first = searchResult[0];
    const addr = first.address || {};
    const settlement = addr.city || addr.town || addr.village || addr.municipality || first.name || query;
    const state = addr.state || "Maharashtra";
    return {
      id: `osm_${first.place_id || query}`,
      name: settlement,
      city: settlement,
      district: addr.state_district || addr.county,
      region: state,
      state,
      country: addr.country || "India",
      countryCode: (addr.country_code || "in").toUpperCase(),
      latitude: roundCoord(parseFloat(first.lat)),
      longitude: roundCoord(parseFloat(first.lon)),
      postcode: addr.postcode,
      source: "manual",
      precision: "city",
      attribution: first.licence || "Data \xA9 OpenStreetMap contributors"
    };
  } catch {
    return null;
  }
}

// server/geocodingService.ts
var cache = /* @__PURE__ */ new Map();
function roundCoordinate(val) {
  return Math.round(val * COORDINATE_ROUND_FACTOR) / COORDINATE_ROUND_FACTOR;
}
function isValidCoordinate(lat, lon) {
  return typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon) && lat >= MIN_LATITUDE && lat <= MAX_LATITUDE && lon >= MIN_LONGITUDE && lon <= MAX_LONGITUDE;
}
function checkCache(cacheKey) {
  const cached = cache.get(cacheKey);
  return cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS ? cached.data : null;
}
function saveCache(cacheKey, data) {
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
function buildStaticResolved(query, match) {
  const isPin = /^\d{4,6}$/.test(query);
  return {
    id: `loc_${match.city.toLowerCase()}`,
    name: match.city,
    city: match.city,
    region: match.region,
    state: match.region,
    country: match.country,
    countryCode: match.countryCode,
    latitude: roundCoordinate(match.lat),
    longitude: roundCoordinate(match.lon),
    postcode: isPin ? query : match.pinCodes[0],
    source: isPin ? "pin" : "manual",
    precision: isPin ? "postal_code" : "city"
  };
}
async function queryExternalGeocoders(query, code) {
  if (/^\d{4,6}$/.test(query)) {
    const pinRes = await forwardGeocodePin(query);
    if (pinRes) return pinRes;
  }
  const openMeteoRes = await forwardGeocodeOpenMeteo(query, code);
  if (openMeteoRes) return openMeteoRes;
  return forwardGeocodeNominatim(query, code);
}
async function resolveForwardQuery(query, countryCode) {
  const code = countryCode ? countryCode.trim().toUpperCase() : "IN";
  const cacheKey = `query_${code}_${query.toLowerCase()}`;
  const cached = checkCache(cacheKey);
  if (cached) return cached;
  const staticMatch = findStaticLocation(query);
  if (staticMatch) {
    return saveCache(cacheKey, buildStaticResolved(query, staticMatch));
  }
  const externalRes = await queryExternalGeocoders(query, code);
  if (externalRes) return saveCache(cacheKey, externalRes);
  throw {
    code: "LOCATION_NOT_FOUND",
    message: `No matching places found for "${query}" in ${code}. Please check spelling or postal code.`
  };
}
function formatReverseDisplayName(settlement, rev) {
  if (settlement === "Current Location") {
    return rev?.district ? `Current Location (${rev.district})` : "Current Location";
  }
  return rev?.state && settlement !== rev.state ? `${settlement}, ${rev.state}` : settlement;
}
async function resolveReverseCoords(req) {
  if (!isValidCoordinate(req.latitude, req.longitude) || req.latitude === void 0 || req.longitude === void 0) {
    throw {
      code: "INVALID_INPUT",
      message: "Coordinates must be valid finite numbers within [-90, 90] and [-180, 180]."
    };
  }
  const roundedLat = roundCoordinate(req.latitude);
  const roundedLon = roundCoordinate(req.longitude);
  const cacheKey = `coords_${roundedLat}_${roundedLon}`;
  const cached = checkCache(cacheKey);
  if (cached) return cached;
  const rev = await activeReverseProvider.reverseGeocode(roundedLat, roundedLon);
  const settlement = rev?.city || "Current Location";
  const resolvedCountry = rev?.country || req.previousCountry || (req.countryCode === "IN" ? DEFAULT_COUNTRY : void 0);
  const resolvedCountryCode = rev?.countryCode || req.countryCode?.toUpperCase();
  return saveCache(cacheKey, {
    id: `loc_${roundedLat}_${roundedLon}`,
    name: formatReverseDisplayName(settlement, rev),
    city: settlement,
    locality: rev?.locality,
    district: rev?.district,
    state: rev?.state,
    region: rev?.state || rev?.district || "Local Region",
    country: resolvedCountry || "Unknown",
    countryCode: resolvedCountryCode || "",
    postcode: rev?.postcode,
    latitude: roundedLat,
    longitude: roundedLon,
    source: "geolocation",
    precision: "coordinates",
    attribution: rev?.attribution || "Data \xA9 OpenStreetMap contributors"
  });
}
async function resolveLocation(req) {
  const query = req.query?.trim();
  const isExplicit = Boolean(
    query && query !== "Your location" && !query.toLowerCase().includes("device location") && !query.toLowerCase().includes("current location")
  );
  if (isExplicit && query) return resolveForwardQuery(query, req.countryCode);
  if (req.latitude !== void 0 && req.longitude !== void 0) return resolveReverseCoords(req);
  throw {
    code: "INVALID_INPUT",
    message: "Please provide either a valid city name, postal code, or device location."
  };
}

// server/airQualityService.ts
var aqiCache = /* @__PURE__ */ new Map();
var AQI_CACHE_TTL_MS = 30 * 60 * 1e3;
function mapUSAQICategory(aqi) {
  const rounded = Math.round(aqi);
  if (rounded <= 50) return "Good";
  if (rounded <= 100) return "Moderate";
  if (rounded <= 150) return "Unhealthy for Sensitive Groups";
  if (rounded <= 200) return "Unhealthy";
  if (rounded <= 300) return "Very Unhealthy";
  return "Hazardous";
}
async function fetchCurrentAirQuality(latitude, longitude, countryCode) {
  if (!isValidCoordinate(latitude, longitude)) {
    throw {
      code: "INVALID_INPUT",
      message: "Invalid coordinate parameters for air quality lookup."
    };
  }
  const roundedLat = roundCoordinate(latitude);
  const roundedLon = roundCoordinate(longitude);
  const cacheKey = `aqi_${roundedLat}_${roundedLon}`;
  const cached = aqiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < AQI_CACHE_TTL_MS) {
    return cached.data;
  }
  const apiKey = serverConfig.OPEN_METEO_API_KEY;
  const baseUrl = serverConfig.OPEN_METEO_API_BASE_URL;
  const params = new URLSearchParams({
    latitude: roundedLat.toString(),
    longitude: roundedLon.toString(),
    current: "us_aqi,pm2_5,pm10",
    timezone: "auto"
  });
  const isIndia = countryCode && countryCode.toUpperCase() === "IN" || roundedLat >= 6 && roundedLat <= 37 && roundedLon >= 68 && roundedLon <= 98;
  if (isIndia) {
    params.set("domains", "cams_global");
  }
  if (apiKey) {
    params.set("apikey", apiKey);
  }
  const apiUrl = `${baseUrl}/v1/air-quality?${params.toString()}`;
  let response;
  try {
    response = await safeFetch(apiUrl, {
      timeoutMs: 8e3,
      headers: { Accept: "application/json" }
    });
  } catch (err) {
    const isTimeout = typeof err === "object" && err !== null && "code" in err && err.code === "UPSTREAM_TIMEOUT" || err instanceof Error && err.name === "AbortError";
    throw {
      code: isTimeout ? "UPSTREAM_TIMEOUT" : "AIR_QUALITY_UNAVAILABLE",
      message: isTimeout ? "Open-Meteo Air Quality service timed out. Please try again." : "Open-Meteo Air Quality service is currently unreachable."
    };
  }
  if (!response.ok) {
    throw {
      code: "AIR_QUALITY_UNAVAILABLE",
      message: `Open-Meteo Air Quality provider returned HTTP ${response.status}.`
    };
  }
  let json;
  try {
    json = await response.json();
  } catch {
    throw {
      code: "INVALID_UPSTREAM_RESPONSE",
      message: "Failed to parse air quality service response."
    };
  }
  if (!json.current || json.current.us_aqi === void 0 || json.current.us_aqi === null) {
    throw {
      code: "AIR_QUALITY_UNAVAILABLE",
      message: "Air quality index value is temporarily unavailable for these coordinates."
    };
  }
  const aqiValue = Math.max(0, Math.round(json.current.us_aqi));
  const category = mapUSAQICategory(aqiValue);
  const pm2_5 = typeof json.current.pm2_5 === "number" ? Math.round(json.current.pm2_5 * 10) / 10 : null;
  const pm10 = typeof json.current.pm10 === "number" ? Math.round(json.current.pm10 * 10) / 10 : null;
  let dominantPollutant = "PM2.5";
  if (pm10 !== null && pm2_5 !== null && pm10 > pm2_5 * 2.5) {
    dominantPollutant = "PM10";
  }
  const result = {
    value: aqiValue,
    scale: "US AQI",
    category,
    dataType: "model_estimate",
    source: "Open-Meteo CAMS Global",
    observedAt: json.current.time || (/* @__PURE__ */ new Date()).toISOString(),
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    spatialResolutionKm: 45,
    timezone: json.timezone || "Asia/Kolkata",
    dominantPollutant,
    pollutants: {
      pm2_5,
      pm10,
      unit: "\xB5g/m\xB3"
    },
    modelNotice: "Local air-quality estimate \u2022 Modelled data (Global CAMS ~45km spatial resolution). Not a street sensor."
  };
  aqiCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

// server/outdoorRecommendationBuilders.ts
var HIGH_AQI_THRESHOLD = 100;
var SEVERE_AQI_THRESHOLD = 200;
function buildOutdoorRec(aqi, isVulnerable, affected, commute) {
  if (aqi > SEVERE_AQI_THRESHOLD) {
    return {
      id: "rec-outdoor-severe",
      title: "Postpone strenuous outdoor exercise",
      description: "Shift intense cardiovascular activities and children\u2019s outdoor play indoors until ambient pollution clears.",
      whyItMatters: "Heavy physical exertion significantly increases minute ventilation and fine particulate delivery into deeper pulmonary alveoli.",
      alternative: "Indoor bodyweight workouts, gentle stretching, or yoga in a filtered room.",
      effort: "Low",
      priority: "High",
      relevantProfileFactors: affected.length > 0 ? [`High ambient AQI (${aqi})`, `Household includes: ${affected.join(", ")}`] : [`Hazardous ambient AQI (${aqi})`],
      sourceCategory: "Health Precaution",
      saved: false,
      completed: false
    };
  }
  if (aqi > HIGH_AQI_THRESHOLD) {
    return {
      id: "rec-outdoor-moderate-high",
      title: "Time outdoor workouts around midday solar clearing",
      description: "Morning temperature inversions trap surface soot; if exercising outdoors, target late morning or early afternoon.",
      whyItMatters: "Ground-level temperature inversions break as midday sunlight warms the surface, diluting local pollutants.",
      alternative: "Light evening walking on quiet residential routes rather than near arterial avenues.",
      effort: "Low",
      priority: isVulnerable ? "High" : "Medium",
      relevantProfileFactors: [`Current ambient US AQI: ${aqi}`, commute],
      sourceCategory: "Atmospheric Guidance",
      saved: false,
      completed: false
    };
  }
  return {
    id: "rec-outdoor-good",
    title: "Favorable ambient conditions for outdoor activities",
    description: "Local air quality currently supports normal outdoor routines, walking, and natural park recreation.",
    whyItMatters: "Outdoor physical movement provides vital cardiovascular and mental wellness benefits when ambient air is clean.",
    effort: "Low",
    priority: "Low",
    relevantProfileFactors: [`Good/Moderate ambient AQI (${aqi})`],
    sourceCategory: "General Wellness",
    saved: false,
    completed: false
  };
}
function buildActiveCommuteRec(isHigh, aqi) {
  return {
    id: isHigh ? "rec-commute-active-smog" : "rec-commute-active-clean",
    title: isHigh ? "Choose tree-lined corridors or certified barrier for active commute" : "Active commuting keeps community emissions low",
    description: isHigh ? "Take secondary streets with dense roadside canopy, and consider an N95 respirator." : "Your walking or cycling avoids fossil combustion, directly benefiting neighborhood air.",
    whyItMatters: isHigh ? "Active breathing near diesel transit directly exposes airways to freshly combusted soot." : "Zero-emission commutes reduce localized street-canyon NO\u2082 and particulate concentrations.",
    alternative: isHigh ? "Ride shared metro or electric transit on high smog mornings." : void 0,
    effort: isHigh ? "Medium" : "Low",
    priority: isHigh ? "High" : "Medium",
    relevantProfileFactors: isHigh ? ["Active walking/cycling commute", `Elevated AQI (${aqi})`] : ["Walking/cycling commute"],
    sourceCategory: isHigh ? "Commute Optimization" : "Community Impact",
    saved: false,
    completed: false
  };
}
function buildVehicleCommuteRec(isHigh, aqi) {
  return {
    id: "rec-commute-car-recirc",
    title: "Enable in-cabin air recirculation in congested queues",
    description: "Set your car air system to internal recirculation mode when idling near heavy diesel vehicles.",
    whyItMatters: "Without recirculation, cabin fan intakes pull tailpipe exhaust directly into the passenger cabin.",
    effort: "Low",
    priority: isHigh ? "High" : "Medium",
    relevantProfileFactors: ["Car/taxi commuter", `Ambient AQI (${aqi})`],
    sourceCategory: "In-Cabin Protection",
    saved: false,
    completed: false
  };
}
function buildGeneralTransitCommuteRec(isHigh, commute) {
  return {
    id: "rec-commute-general",
    title: isHigh ? "Wear mask during open platform transit transfers" : "Shared transit reduces per-passenger emissions",
    description: isHigh ? "Bus bays and crowded interchange platforms concentrate diesel soot." : "Shared transit carries a much lower per-passenger environmental footprint.",
    whyItMatters: "Transit hub choke points experience elevated localized soot before passengers board filtered carriages.",
    effort: "Low",
    priority: isHigh ? "High" : "Medium",
    relevantProfileFactors: [commute],
    sourceCategory: "Transit Guidance",
    saved: false,
    completed: false
  };
}
function buildCommuteRec(commute, aqi) {
  const isHigh = aqi > HIGH_AQI_THRESHOLD;
  const c = commute.toLowerCase();
  if (c.includes("walk") || c.includes("cycl") || c.includes("bicycle")) {
    return buildActiveCommuteRec(isHigh, aqi);
  }
  if (c.includes("car") || c.includes("taxi")) {
    return buildVehicleCommuteRec(isHigh, aqi);
  }
  return buildGeneralTransitCommuteRec(isHigh, commute);
}

// server/indoorRecommendationBuilders.ts
function buildIndoorRec(cooking, hasPurifier, aqi, homeType) {
  const isSolid = /wood|biomass|coal|kerosene/i.test(cooking);
  if (isSolid) {
    return {
      id: "rec-indoor-solid-fuel",
      title: "Ensure continuous kitchen ventilation during solid-fuel cooking",
      description: "Solid biomass produces intense unburned soot and carbon monoxide. Maintain dedicated outdoor airflow.",
      whyItMatters: "Trapped indoor biomass combustion smoke poses higher immediate respiratory danger than ambient air.",
      effort: "Medium",
      priority: "High",
      relevantProfileFactors: ["Biomass/solid cooking fuel", homeType],
      sourceCategory: "Indoor Hazard Control",
      saved: false,
      completed: false
    };
  }
  if (/lpg|gas/i.test(cooking)) {
    return {
      id: "rec-indoor-gas-vent",
      title: "Turn on kitchen exhaust whenever cooking with gas",
      description: "Gas burners produce nitrogen dioxide (NO\u2082). Run the range hood or crack a kitchen window outward.",
      whyItMatters: "Unvented gas combustion can raise indoor NO\u2082 above WHO health guidelines within 20 minutes.",
      effort: "Low",
      priority: "Medium",
      relevantProfileFactors: ["LPG / piped gas cooking"],
      sourceCategory: "Kitchen Air Practice",
      saved: false,
      completed: false
    };
  }
  return {
    id: hasPurifier ? "rec-indoor-purifier-opt" : "rec-indoor-no-purifier",
    title: hasPurifier ? "Run HEPA air purifier in primary bedroom on quiet mode" : "Adopt practical dust-dampening methods without an air purifier",
    description: hasPurifier ? "Keep your purifier running continuously in closed bedrooms overnight." : "Use damp microfiber cloths to wipe surfaces; place weather-stripping along drafty door thresholds.",
    whyItMatters: hasPurifier ? "Overnight clean air exposure lowers airway inflammation accumulated during the day." : "Dry sweeping resuspends settled coarse dust into the breathing zone.",
    effort: "Low",
    priority: aqi > HIGH_AQI_THRESHOLD ? "High" : "Medium",
    relevantProfileFactors: hasPurifier ? ["Air purifier available", `Ambient AQI (${aqi})`] : ["No air purifier installed", homeType],
    sourceCategory: hasPurifier ? "Filtration Optimization" : "Low-Cost Home Care",
    saved: false,
    completed: false
  };
}

// server/recommendationService.ts
var MAX_RECOMMENDATIONS_COUNT = 4;
function extractVulnerabilities(profile) {
  const affected = [];
  if (profile.householdMembers.some((m) => /children|under 12/i.test(m))) affected.push("children");
  if (profile.householdMembers.some((m) => /seniors|65/i.test(m))) affected.push("older adults");
  const sensitivities = profile.healthSensitivities || [];
  if (sensitivities.some((s) => /asthma|respiratory|lung/i.test(s)))
    affected.push("respiratory sensitivity");
  if (sensitivities.some((s) => /heart/i.test(s))) affected.push("heart conditions");
  if (sensitivities.some((s) => /pregnan/i.test(s))) affected.push("pregnancy");
  return { isVulnerable: affected.length > 0, affectedGroups: affected };
}
function buildHeatingRec(heating) {
  if (!/wood|biomass|coal|solid/i.test(heating)) return null;
  return {
    id: "rec-heating-solid",
    title: "Avoid unvented open fires inside sleeping spaces",
    description: "Open coal or wood heaters in poorly ventilated bedrooms create hazardous carbon monoxide spikes.",
    whyItMatters: "Carbon monoxide binds to hemoglobin and causes invisible, potentially fatal oxygen deprivation.",
    effort: "Medium",
    priority: "High",
    relevantProfileFactors: ["Solid heating fuel"],
    sourceCategory: "Heating Safety",
    saved: false,
    completed: false
  };
}
function generatePersonalizedRecommendations(aqiData, profile) {
  const recommendations = [];
  const { isVulnerable, affectedGroups } = extractVulnerabilities(profile);
  recommendations.push(
    buildOutdoorRec(aqiData.value, isVulnerable, affectedGroups, profile.commuteMode)
  );
  recommendations.push(buildCommuteRec(profile.commuteMode, aqiData.value));
  recommendations.push(
    buildIndoorRec(
      profile.cookingFuel,
      Boolean(profile.hasAirPurifier),
      aqiData.value,
      profile.homeType
    )
  );
  const heatingRec = buildHeatingRec(profile.heatingFuel);
  if (heatingRec) recommendations.push(heatingRec);
  return recommendations.slice(0, MAX_RECOMMENDATIONS_COUNT);
}

// server/apiUtils.ts
var MAX_BODY_SIZE_BYTES = 5e4;
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
function sendError(res, statusCode, code, message, details) {
  const errPayload = {
    error: {
      code,
      message,
      details
    }
  };
  sendJson(res, statusCode, errPayload);
}
function parsePreParsedBody(req) {
  const reqWithBody = req;
  if (reqWithBody.body === void 0 || reqWithBody.body === null) {
    return null;
  }
  if (typeof reqWithBody.body === "string") {
    if (!reqWithBody.body.trim()) return {};
    try {
      return JSON.parse(reqWithBody.body);
    } catch {
      throw {
        statusCode: 400,
        code: "INVALID_JSON",
        message: "Malformed JSON payload in request body."
      };
    }
  }
  return reqWithBody.body;
}
function validateContentType(req) {
  const method = req.method?.toUpperCase();
  if (method === "POST" || method === "PUT") {
    const rawContentType = req.headers?.["content-type"];
    const contentType = Array.isArray(rawContentType) ? rawContentType[0] || "" : rawContentType || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw {
        statusCode: 415,
        code: "INVALID_CONTENT_TYPE",
        message: "Content-Type must be application/json"
      };
    }
  }
}
function readBodyStream(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let totalBytes = 0;
    req.on("data", (chunk) => {
      totalBytes += typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.length;
      if (totalBytes > MAX_BODY_SIZE_BYTES) {
        if (typeof req.destroy === "function") req.destroy();
        reject({
          statusCode: 413,
          code: "PAYLOAD_TOO_LARGE",
          message: `Request payload exceeds strict limit of ${MAX_BODY_SIZE_BYTES} bytes.`
        });
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject({
          statusCode: 400,
          code: "INVALID_JSON",
          message: "Malformed JSON payload in request body."
        });
      }
    });
    req.on("error", (err) => reject(err));
  });
}
async function parseBody(req) {
  const preParsed = parsePreParsedBody(req);
  if (preParsed !== null) {
    return preParsed;
  }
  validateContentType(req);
  return readBodyStream(req);
}
function mapErrorStatus(err) {
  if (err.statusCode) return err.statusCode;
  if (err.code === "INVALID_INPUT" || err.code === "INVALID_JSON") return 400;
  if (err.code === "FORBIDDEN_ORIGIN") return 403;
  if (err.code === "LOCATION_NOT_FOUND") return 404;
  if (err.code === "PAYLOAD_TOO_LARGE") return 413;
  if (err.code === "INVALID_CONTENT_TYPE") return 415;
  if (err.code === "RATE_LIMIT_EXCEEDED") return 429;
  if (err.code === "UPSTREAM_TIMEOUT") return 504;
  return 502;
}

// server/validationSchemas.ts
import { z as z2 } from "zod";
var LocationResolveSchema = z2.object({
  query: z2.string().trim().min(1).max(100).optional(),
  countryCode: z2.string().trim().length(2).optional(),
  previousCountry: z2.string().trim().min(1).max(50).optional(),
  latitude: z2.number().min(-90).max(90).optional(),
  longitude: z2.number().min(-180).max(180).optional(),
  accuracy: z2.number().positive().max(1e5).optional()
}).strict();
var AirQualityCurrentSchema = z2.object({
  latitude: z2.number().min(-90).max(90),
  longitude: z2.number().min(-180).max(180),
  countryCode: z2.string().trim().length(2).optional()
}).strict();
var HouseholdOptionEnum = z2.enum([
  "adults_only",
  "children",
  "seniors",
  "pregnant",
  "pets"
]);
var CommuteModeEnum = z2.enum([
  "walking",
  "cycling",
  "public_transit",
  "car",
  "motorbike",
  "work_from_home"
]);
var HomeTypeEnum = z2.enum([
  "apartment",
  "independent_house",
  "shared_accommodation",
  "villa",
  "rural_dwelling"
]);
var CookingFuelEnum = z2.enum([
  "lpg_piped_gas",
  "electric_induction",
  "biomass_wood_coal",
  "kerosene",
  "mixed"
]);
var HeatingFuelEnum = z2.enum([
  "electric_heat_pump",
  "gas_heater",
  "wood_coal_burning",
  "kerosene_heater",
  "none"
]);
var VentilationTypeEnum = z2.enum([
  "open_windows_regularly",
  "occasional_windows",
  "sealed_ac_only",
  "exhaust_fans_kitchen_bath"
]);
var IndoorSmokingEnum = z2.enum([
  "none",
  "smoking_only",
  "vaping_only",
  "both"
]);
var OnboardingCompleteSchema = z2.object({
  location: z2.object({
    query: z2.string().trim().max(100).optional(),
    name: z2.string().trim().max(100).optional(),
    countryCode: z2.string().trim().length(2).optional(),
    latitude: z2.number().min(-90).max(90).optional(),
    longitude: z2.number().min(-180).max(180).optional()
  }).strict(),
  householdMembers: z2.array(HouseholdOptionEnum).min(1),
  healthConsiderations: z2.array(z2.string().max(50)).optional(),
  healthOther: z2.string().max(100).optional(),
  commuteMode: CommuteModeEnum,
  homeType: HomeTypeEnum,
  cookingFuel: CookingFuelEnum,
  heatingFuel: HeatingFuelEnum,
  hasAirPurifier: z2.boolean(),
  ventilationType: VentilationTypeEnum.optional(),
  indoorSmoking: IndoorSmokingEnum.optional()
}).strict();
var ChatMessageRoleEnum = z2.enum(["user", "assistant"]);
var ChatMessageSchema = z2.object({
  role: ChatMessageRoleEnum,
  content: z2.string().trim().min(1).max(2e3)
}).strict();
var ChatRequestSchema = z2.object({
  message: z2.string().trim().min(1).max(1e3),
  history: z2.array(ChatMessageSchema).max(12).optional(),
  context: z2.record(z2.string(), z2.unknown()).optional()
}).strict();
var AIOutputSchema = z2.object({
  reply: z2.string().trim().min(1).max(1e4),
  model: z2.string().optional(),
  status: z2.enum(["success", "notice"]).default("success"),
  isFallback: z2.boolean().optional()
}).strict();

// server/promptSanitizer.ts
var CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
var INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+instructions/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /system\s*:\s*/gi,
  /\[system\]/gi,
  /<\/?instructions?>/gi,
  /jailbreak/gi,
  /reveal\s+(your\s+)?(system\s+prompt|api\s+key|secret)/gi
];
function stripControlCharacters(text) {
  if (!text) return "";
  return text.replace(CONTROL_CHARS_REGEX, "");
}
function sanitizeUserPrompt(rawMessage) {
  let cleaned = stripControlCharacters(rawMessage).trim();
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[neutralized]");
  }
  if (cleaned.length > 1e3) {
    cleaned = cleaned.slice(0, 1e3);
  }
  return cleaned;
}
function validateAndSanitizeAiOutput(rawText, modelName) {
  const fallbackReply = "AirSaathi Assistant is currently operating in safe advisory mode. Please maintain indoor ventilation and check outdoor AQI before outdoor exertion.";
  if (!rawText || typeof rawText !== "string") {
    return { reply: fallbackReply, model: modelName, isFallback: true };
  }
  const cleaned = stripControlCharacters(rawText).trim();
  const parsed = AIOutputSchema.safeParse({
    reply: cleaned,
    model: modelName,
    status: "success"
  });
  if (!parsed.success || !parsed.data.reply) {
    return { reply: fallbackReply, model: modelName, isFallback: true };
  }
  return { reply: parsed.data.reply, model: modelName };
}

// server/geminiModelProvider.ts
var cachedWorkingModel = null;
var PREFERRED_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
function parseModelListResponse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}
function selectBestModel(genModels, userModel) {
  if (userModel && genModels.includes(userModel)) {
    return userModel;
  }
  for (const preferred of PREFERRED_MODELS) {
    if (genModels.includes(preferred)) return preferred;
  }
  return genModels[0];
}
async function getActiveGeminiModel(apiKey) {
  if (cachedWorkingModel) return cachedWorkingModel;
  const userModel = serverConfig.GEMINI_MODEL;
  for (const version of ["v1beta", "v1"]) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
      const res = await safeFetch(url, {
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" }
      });
      const rawText = await res.text();
      const json = parseModelListResponse(rawText);
      if (res.ok && json?.models && Array.isArray(json.models)) {
        const genModels = json.models.filter((m) => m.supportedGenerationMethods?.includes("generateContent")).map((m) => m.name.replace(/^models\//, ""));
        if (genModels.length > 0) {
          cachedWorkingModel = { model: selectBestModel(genModels, userModel), version };
          return cachedWorkingModel;
        }
      } else if (!res.ok) {
        return { model: "", version, error: json?.error?.message || rawText };
      }
    } catch {
    }
  }
  return { model: userModel || "gemini-1.5-flash", version: "v1beta" };
}
async function attemptGeminiRequest(url, apiKey, payload, modelName) {
  try {
    const response = await safeFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      if (response.status === 503 || response.status === 429 || response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      let parsedMsg = errorText;
      try {
        const errObj = JSON.parse(errorText);
        if (errObj?.error?.message) parsedMsg = errObj.error.message;
      } catch {
      }
      return { success: false, errorStatus: response.status, errorMessage: parsedMsg };
    }
    const data = await response.json();
    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const sanitized = validateAndSanitizeAiOutput(rawReply, modelName);
    return {
      success: true,
      reply: sanitized.reply,
      model: sanitized.model,
      isFallback: sanitized.isFallback
    };
  } catch {
    return null;
  }
}
async function queryGeminiCandidateModels(apiKey, modelInfo, payload) {
  const candidateModels = [
    modelInfo.model,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);
  for (const model of candidateModels) {
    const cleanModel = model.replace(/^models\//, "");
    const url = `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${encodeURIComponent(cleanModel)}:generateContent?key=${apiKey}`;
    const result = await attemptGeminiRequest(url, apiKey, payload, cleanModel);
    if (result) return result;
  }
  return null;
}

// server/geminiChatService.ts
var aiResponseCache = /* @__PURE__ */ new Map();
var AI_FAQ_CACHE_TTL_MS = 60 * 60 * 1e3;
function formatContextDescription(context) {
  const city = context?.city;
  const profile = context?.profile;
  const page = context?.activePage || "home";
  const loc = city?.name ? `Location: ${city.name} | US AQI: ${city.aqi ?? "N/A"} (${city.category ?? "Unknown"}) | PM2.5: ${city.pm2_5 ?? "N/A"} \xB5g/m\xB3` : "Location: Not selected";
  const prof = profile ? `Profile: Home: ${profile.homeType || "standard"}, Cooking: ${profile.cookingFuel || "standard"}, Purifier: ${profile.hasAirPurifier ? "Yes" : "No"}` : "Profile: Standard default";
  return { loc, prof, page };
}
function buildSystemInstruction(context) {
  const { loc, prof, page } = formatContextDescription(context);
  return `You are "AirSaathi Assistant", an intelligent air-quality companion for the AirSaathi web app.
App sections: Home, Smart Tips, Indoor Air (never fabricate indoor AQI), Sustainability, Settings.
Context: Tab: ${page} | ${loc} | ${prof}
Guidance: Friendly, clear, concise English with bullet points using the bullet character (\u2022). Do not use raw asterisks (*) or asterisk-wrapped bolding (**). General exposure reduction only, no medical prescribing.`;
}
function buildChatPayload(systemPrompt, sanitizedUserMessage, history) {
  const contents = [];
  if (Array.isArray(history)) {
    for (const item of history.slice(-8)) {
      if (item.content?.trim()) {
        contents.push({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: sanitizeUserPrompt(item.content) }]
        });
      }
    }
  }
  contents.push({ role: "user", parts: [{ text: sanitizedUserMessage }] });
  return {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1e3 }
  };
}
function resolveApiKey() {
  const envKey = process.env.GEMINI_API_KEY;
  return (envKey !== void 0 ? envKey.trim() : serverConfig.GEMINI_API_KEY) || void 0;
}
function checkFaqCache(key, canCache) {
  if (!canCache) return null;
  const cached = aiResponseCache.get(key);
  if (cached && Date.now() - cached.timestamp < AI_FAQ_CACHE_TTL_MS) {
    return { reply: cached.reply, model: cached.model };
  }
  return null;
}
function sendStandardFallback(res) {
  sendJson(res, 200, {
    status: "notice",
    reply: "\u2022 Keep windows closed during peak morning inversion hours (6 AM - 10 AM).\n\u2022 Run bedroom HEPA air purifiers continuously when ambient AQI is elevated.\n\u2022 Wear an N95 mask when commuting on two-wheelers or walking outdoors.\n\n*(Notice: Live Gemini models are currently experiencing peak demand. Providing verified clean-air advisory.)*",
    model: "fallback-advisor",
    isFallback: true
  });
}
function sendChatOutcome(res, outcome, cleanModel, cacheKey, canCache) {
  if (outcome?.success && outcome.reply) {
    if (canCache && !outcome.isFallback) {
      aiResponseCache.set(cacheKey, {
        reply: outcome.reply,
        model: outcome.model || cleanModel,
        timestamp: Date.now()
      });
    }
    sendJson(res, 200, {
      status: "success",
      reply: outcome.reply,
      model: outcome.model,
      isFallback: outcome.isFallback
    });
    return;
  }
  if (outcome?.errorStatus && outcome.errorMessage) {
    sendError(res, outcome.errorStatus, "UPSTREAM_GEMINI_ERROR", outcome.errorMessage);
    return;
  }
  sendStandardFallback(res);
}
async function handleChatRequest(req, res) {
  const rawBody = await parseBody(req);
  const parsed = ChatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    sendError(res, 400, "INVALID_INPUT", parsed.error.issues[0]?.message || "Invalid chat request structure.");
    return;
  }
  const { message, history, context } = parsed.data;
  const sanitizedUserMessage = sanitizeUserPrompt(message);
  const apiKey = resolveApiKey();
  if (!apiKey) {
    sendJson(res, 200, {
      status: "notice",
      reply: "Please add `GEMINI_API_KEY=your_key` to your `.env` file to enable live Gemini AI answers.",
      isFallback: true
    });
    return;
  }
  const modelInfo = await getActiveGeminiModel(apiKey);
  if (modelInfo.error) {
    sendError(res, 400, "UPSTREAM_GEMINI_ERROR", `Google Gemini setup required: ${modelInfo.error}`);
    return;
  }
  const cleanModel = modelInfo.model.replace(/^models\//, "");
  const canCache = (!history || history.length === 0) && !context?.profile;
  const cacheKey = `ai_faq_${cleanModel}_${sanitizedUserMessage.toLowerCase()}`;
  const cached = checkFaqCache(cacheKey, canCache);
  if (cached) {
    sendJson(res, 200, { status: "success", reply: cached.reply, model: cached.model });
    return;
  }
  const payload = buildChatPayload(buildSystemInstruction(context), sanitizedUserMessage, history);
  const outcome = await queryGeminiCandidateModels(apiKey, modelInfo, payload);
  sendChatOutcome(res, outcome, cleanModel, cacheKey, canCache);
}

// server/securityHeaders.ts
var CSP_HEADER_VALUE = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://generativelanguage.googleapis.com https://air-quality-api.open-meteo.com https://geocoding-api.open-meteo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ");
var SECURITY_HEADERS = {
  "Content-Security-Policy": CSP_HEADER_VALUE,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(self), camera=(), microphone=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
};
function isAllowedOrigin(origin, host) {
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;
    if (host && originHost.toLowerCase() === host.toLowerCase()) {
      return true;
    }
    const normalized = `${originUrl.protocol}//${originHost}`.toLowerCase();
    return serverConfig.ALLOWED_ORIGINS.some(
      (allowed) => allowed.toLowerCase() === normalized
    );
  } catch {
    return false;
  }
}
function applySecurityHeaders(req, res) {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
  const rawOrigin = req.headers.origin;
  const rawHost = req.headers.host;
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  const host = Array.isArray(rawHost) ? rawHost[0] : rawHost;
  if (origin) {
    if (!isAllowedOrigin(origin, host)) {
      return false;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  return true;
}

// server/clientRateLimiter.ts
import crypto from "crypto";
import Redis from "ioredis";
var memoryStore = /* @__PURE__ */ new Map();
var redisClient = null;
var isRedisAvailable = false;
if (serverConfig.REDIS_URL) {
  try {
    redisClient = new Redis(serverConfig.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false
    });
    redisClient.on("connect", () => {
      isRedisAvailable = true;
    });
    redisClient.on("error", () => {
      isRedisAvailable = false;
    });
    redisClient.connect().catch(() => {
      isRedisAvailable = false;
    });
  } catch {
    isRedisAvailable = false;
  }
}
function hashClientIdentifier(ip) {
  return crypto.createHmac("sha256", serverConfig.RATE_LIMIT_SALT).update(ip || "127.0.0.1").digest("hex");
}
function extractClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && typeof forwarded[0] === "string") {
    return forwarded[0].split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}
async function checkRateLimit(clientId, keyPrefix, limit, windowSec = 60) {
  const hashedId = hashClientIdentifier(clientId);
  const cacheKey = `ratelimit:${keyPrefix}:${hashedId}`;
  if (redisClient && isRedisAvailable) {
    try {
      const current = await redisClient.incr(cacheKey);
      if (current === 1) {
        await redisClient.expire(cacheKey, windowSec);
      }
      const ttl = await redisClient.ttl(cacheKey);
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetSec: Math.max(1, ttl)
      };
    } catch {
    }
  }
  const now = Date.now();
  const entry = memoryStore.get(cacheKey);
  if (!entry || now > entry.resetTime) {
    memoryStore.set(cacheKey, { count: 1, resetTime: now + windowSec * 1e3 });
    return { allowed: true, remaining: limit - 1, resetSec: windowSec };
  }
  entry.count += 1;
  const resetSec = Math.ceil((entry.resetTime - now) / 1e3);
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetSec: Math.max(1, resetSec)
  };
}

// server/apiHandler.ts
async function handleLocationResolve(req, res) {
  const body = await parseBody(req);
  const parsed = LocationResolveSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, "INVALID_INPUT", parsed.error.issues[0]?.message || "Invalid location request");
    return;
  }
  const location = await resolveLocation(parsed.data);
  sendJson(res, 200, { status: "success", location });
}
async function handleAirQualityCurrent(req, res) {
  const body = await parseBody(req);
  const parsed = AirQualityCurrentSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, "INVALID_INPUT", "latitude and longitude are required coordinates.");
    return;
  }
  const airQuality = await fetchCurrentAirQuality(
    parsed.data.latitude,
    parsed.data.longitude,
    parsed.data.countryCode
  );
  sendJson(res, 200, { status: "success", airQuality });
}
async function handleOnboardingComplete(req, res) {
  const body = await parseBody(req);
  const parsed = OnboardingCompleteSchema.safeParse(body);
  if (!parsed.success) {
    sendError(res, 400, "INVALID_INPUT", parsed.error.issues[0]?.message || "Invalid onboarding fields.");
    return;
  }
  const { location, ...profileFields } = parsed.data;
  const resolvedLocation = await resolveLocation({
    query: location.query || location.name,
    countryCode: location.countryCode,
    latitude: location.latitude,
    longitude: location.longitude
  });
  const airQuality = await fetchCurrentAirQuality(
    resolvedLocation.latitude,
    resolvedLocation.longitude,
    resolvedLocation.countryCode
  );
  const recommendations = generatePersonalizedRecommendations(airQuality, {
    location,
    ...profileFields
  });
  sendJson(res, 200, {
    status: "success",
    location: resolvedLocation,
    airQuality,
    recommendations
  });
}
async function handleApiRequest(req, res) {
  const url = req.url?.split("?")[0] || "";
  if (!url.startsWith("/api/")) return false;
  const isOriginAllowed = applySecurityHeaders(req, res);
  if (!isOriginAllowed) {
    sendError(res, 403, "FORBIDDEN_ORIGIN", "Cross-origin request rejected.");
    return true;
  }
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.end();
    return true;
  }
  const clientIp = extractClientIp(req);
  const apiLimit = await checkRateLimit(clientIp, "api", 60);
  if (!apiLimit.allowed) {
    res.setHeader("Retry-After", apiLimit.resetSec.toString());
    sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.");
    return true;
  }
  if (url === "/api/chat") {
    const chatLimit = await checkRateLimit(clientIp, "chat", 20);
    if (!chatLimit.allowed) {
      res.setHeader("Retry-After", chatLimit.resetSec.toString());
      sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Chat rate limit exceeded. Please wait a moment.");
      return true;
    }
  }
  try {
    if (url === "/api/location/resolve" && req.method === "POST") {
      await handleLocationResolve(req, res);
      return true;
    }
    if (url === "/api/air-quality/current" && req.method === "POST") {
      await handleAirQualityCurrent(req, res);
      return true;
    }
    if (url === "/api/onboarding/complete" && req.method === "POST") {
      await handleOnboardingComplete(req, res);
      return true;
    }
    if (url === "/api/chat" && req.method === "POST") {
      await handleChatRequest(req, res);
      return true;
    }
    sendError(res, 404, "INVALID_INPUT", `API endpoint ${req.method} ${url} does not exist.`);
    return true;
  } catch (err) {
    const errorObj = typeof err === "object" && err !== null ? err : {};
    const status = mapErrorStatus(errorObj);
    sendError(
      res,
      status,
      errorObj.code || "INTERNAL_ERROR",
      errorObj.message || "An unexpected backend processing error occurred."
    );
    return true;
  }
}

// server/serverlessHandler.ts
async function handler(req, res) {
  const reqWithQuery = req;
  let url = req.url || "";
  if (url === "/api" || url === "/api/" || url.startsWith("/api?")) {
    const route = reqWithQuery.query?.__route || reqWithQuery.query?.route;
    if (typeof route === "string") {
      req.url = `/api/${route}`;
    } else if (req.headers["x-matched-path"]) {
      req.url = req.headers["x-matched-path"];
    } else if (req.headers["x-forwarded-uri"]) {
      req.url = req.headers["x-forwarded-uri"].split("?")[0];
    }
  }
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint Not Found", url: req.url }));
  }
}
export {
  handler as default
};
