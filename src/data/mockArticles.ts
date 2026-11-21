import type { AssistantStructuredResponse } from '../types';

export const PREDEFINED_ASSISTANT_ANSWERS: Record<string, AssistantStructuredResponse> = {
  indoor_air: {
    directAnswer:
      'To significantly improve indoor air quality today, prioritize source control first, mechanical filtration second, and timed ventilation third.',
    recommendedActions: [
      'Seal window and door perimeters during peak morning pollution spikes (6:00 – 10:00 AM).',
      'Run an air purifier with a True HEPA filter continuously in primary occupied rooms.',
      'Always operate high-efficiency exhaust hoods while cooking with gas or oils.',
      'Use damp micro-fiber cloths for surface dusting instead of dry brooms.',
    ],
    whyThisHelps:
      'Indoor air is a combination of infiltrated outdoor smog and domestic aerosols (cooking, dust, cleaning sprays). Without active management, indoor PM2.5 can reach 70–80% of outdoor levels.',
    localContext:
      'Current outdoor AQI in your selected city is elevated at 162 (Poor). Natural open-window ventilation should be restricted until late afternoon dispersion.',
    evidence: [
      'CPCB / WHO Air Quality Guidelines (2021) regarding indoor particulate infiltration.',
      'EPA Indoor Air Quality Building Guidance: mechanical HEPA filtration removes >99.97% of particles down to 0.3 microns.',
    ],
    limitations:
      'Air purifiers do not reduce gaseous carbon dioxide (CO₂) or volatile chemicals unless fitted with heavy granular activated carbon stages.',
    actionProposal: {
      routineTitle: 'Activate HEPA Living Room Purifier on Medium',
      timeOfDay: 'morning',
      details: 'Keep running for 3 hours during morning peak outdoor smog',
    },
  },
  exercise: {
    directAnswer:
      'You should avoid vigorous outdoor aerobic workouts today. Instead, shift your cardio or strength training indoors in a filtered environment.',
    recommendedActions: [
      'Exercise indoors at home or in a ventilated gym with active mechanical air filtration.',
      'If you must walk outdoors, schedule it between 1:30 PM and 3:30 PM when surface inversion breaks.',
      'Wear an N95 respirator if commuting by foot alongside busy roadways.',
    ],
    whyThisHelps:
      'During strenuous cardio, your breathing rate increases by 300% to 500%, and you switch from nasal breathing to oral breathing. This bypasses your nasal filtration and deposits fine toxic particulates deep into the alveolar sacs of your lungs.',
    localContext:
      'With ambient AQI at 162 (Poor category, dominant PM2.5), prolonged intense outdoor exertion triggers pulmonary inflammation even in healthy adults.',
    evidence: [
      'American College of Sports Medicine (ACSM) Environmental Guidance on Exercise in Particulate Air Pollution.',
      'Lancet Planetary Health Study on cardiovascular strain during heavy exertion in elevated ambient PM2.5.',
    ],
    limitations:
      'Light walking for short intervals under 15 minutes presents substantially lower risk than sustained running or cycling.',
    actionProposal: {
      routineTitle: 'Shift Cardio to Indoor Circuit / Mat Routine',
      timeOfDay: 'morning',
      details: 'Preserves cardiovascular fitness without deep lung pollutant deposition',
    },
  },
  exposure: {
    directAnswer:
      'Reducing personal exposure is about reducing your time-weighted exposure in high-concentration micro-environments: traffic corridors, roadside stops, and unventilated kitchens.',
    recommendedActions: [
      'Reroute daily commutes away from heavily congested arterial roads.',
      'Equip yourself with a properly fitted N95 / FFP2 mask for unavoidable outdoor periods.',
      'Create a "clean air sanctuary" in your home bedroom with sealed windows and a dedicated purifier.',
      'Avoid standing near idling vehicles, generators, and street-side frying stalls.',
    ],
    whyThisHelps:
      'Over 60% of an urban resident’s daily inhaled toxic dose occurs during short transit peaks in traffic corridors where pollutant concentration is 3x to 5x higher than citywide background stations.',
    localContext:
      'Urban rush hours between 8:00–10:30 AM and 6:30–9:00 PM currently show the sharpest micro-peaks in your region.',
    evidence: [
      'CPCB National Clean Air Programme (NCAP) Commuter Exposure Assessments.',
      'Health Effects Institute (HEI) Urban Transit Micro-environment Studies.',
    ],
    limitations:
      'Masks only protect against particulate matter (PM2.5/PM10); they do not stop gaseous toxic pollutants without chemical sorbents.',
    actionProposal: {
      routineTitle: 'Use Metro & N95 Mask for Daily Commute',
      timeOfDay: 'morning',
      details: 'Avoids roadway exhaust plumes in stop-and-go traffic',
    },
  },
  affordable_home: {
    directAnswer:
      'You do not need expensive smart home installations to dramatically lower domestic pollution. The most potent interventions are behavioral and low-cost.',
    recommendedActions: [
      'Use weather-stripping foam or door draft-stoppers ($3–$5) to seal leaky window frames.',
      'Wet-mop floors daily with plain water instead of synthetic fragrant aerosols.',
      'Cook with pot lids on and turn on your kitchen exhaust 2 minutes prior to frying.',
      'Consider assembling a proven DIY box fan filter (Corsi-Rosenthal Box) using a standard box fan and a MERV 13 furnace filter.',
    ],
    whyThisHelps:
      'Eliminating indoor pollution generation at the source prevents toxic particles from ever entering your air, while basic weather-stripping cuts draft infiltration by 40–60%.',
    localContext:
      'Many households spend large sums on decorative indoor plants while ignoring kitchen exhaust vents that expel the largest domestic PM2.5 volume.',
    evidence: [
      'UC Davis Air Quality Research Center studies on Corsi-Rosenthal box efficacy.',
      'World Health Organization Household Air Pollution Guidelines.',
    ],
    limitations:
      'DIY box fan filters must be assembled with tight duct-tape seals to prevent air bypass around filter margins.',
    actionProposal: {
      routineTitle: 'Apply Weather-strip Draft Seals on Windows',
      timeOfDay: 'afternoon',
      details: 'Budget-friendly method to cut drafty smog infiltration',
    },
  },
  commute: {
    directAnswer:
      'Making your commute sustainable means reducing your own emissions while minimizing your inhalation of surrounding tailpipe exhaust.',
    recommendedActions: [
      'Shift trips to electric metro rail or dedicated bus rapid transit wherever routes exist.',
      'If using personal transport, carpool or combine errands to eliminate cold-engine starts.',
      'Avoid heavy acceleration and aggressive braking; maintain proper tire pressure to reduce brake/tire dust generation.',
      'Keep vehicle windows rolled up and switch internal cabin ventilation to "Recirculation" mode with a fresh cabin air filter.',
    ],
    whyThisHelps:
      'Electrified mass transit emits up to 85% less greenhouse gas per passenger-kilometer than single-occupant cars, while cabin recirculation cuts in-vehicle particulate exposure by 70%.',
    localContext:
      'In your metropolitan area, vehicular exhaust contributes 28% to 42% of ground-level PM2.5 and the majority of toxic nitrogen oxides.',
    evidence: [
      'International Council on Clean Transportation (ICCT) Urban Transit Benchmark.',
      'CPCB Comprehensive Source Apportionment Study for Metropolitan Areas.',
    ],
    limitations:
      'Public transit access depends on municipal network density in your specific neighborhood.',
    actionProposal: {
      routineTitle: 'Switch Cabin AC to Recirculation Mode',
      timeOfDay: 'evening',
      details: 'Blocks direct intrusion of roadway diesel fumes into vehicle interior',
    },
  },
};
