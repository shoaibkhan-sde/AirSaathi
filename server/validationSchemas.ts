import { z } from 'zod';

export const LocationResolveSchema = z
  .object({
    query: z.string().trim().min(1).max(100).optional(),
    countryCode: z.string().trim().length(2).optional(),
    previousCountry: z.string().trim().min(1).max(50).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    accuracy: z.number().positive().max(100000).optional(),
  })
  .strict();

export const AirQualityCurrentSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    countryCode: z.string().trim().length(2).optional(),
  })
  .strict();

export const HouseholdOptionEnum = z.enum([
  'adults_only',
  'children',
  'seniors',
  'pregnant',
  'pets',
]);

export const CommuteModeEnum = z.enum([
  'walking',
  'cycling',
  'public_transit',
  'car',
  'motorbike',
  'work_from_home',
]);

export const HomeTypeEnum = z.enum([
  'apartment',
  'independent_house',
  'shared_accommodation',
  'villa',
  'rural_dwelling',
]);

export const CookingFuelEnum = z.enum([
  'lpg_piped_gas',
  'electric_induction',
  'biomass_wood_coal',
  'kerosene',
  'mixed',
]);

export const HeatingFuelEnum = z.enum([
  'electric_heat_pump',
  'gas_heater',
  'wood_coal_burning',
  'kerosene_heater',
  'none',
]);

export const VentilationTypeEnum = z.enum([
  'open_windows_regularly',
  'occasional_windows',
  'sealed_ac_only',
  'exhaust_fans_kitchen_bath',
]);

export const IndoorSmokingEnum = z.enum([
  'none',
  'smoking_only',
  'vaping_only',
  'both',
]);

export const OnboardingCompleteSchema = z
  .object({
    location: z
      .object({
        query: z.string().trim().max(100).optional(),
        name: z.string().trim().max(100).optional(),
        countryCode: z.string().trim().length(2).optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
      .strict(),
    householdMembers: z.array(HouseholdOptionEnum).min(1),
    healthConsiderations: z.array(z.string().max(50)).optional(),
    healthOther: z.string().max(100).optional(),
    commuteMode: CommuteModeEnum,
    homeType: HomeTypeEnum,
    cookingFuel: CookingFuelEnum,
    heatingFuel: HeatingFuelEnum,
    hasAirPurifier: z.boolean(),
    ventilationType: VentilationTypeEnum.optional(),
    indoorSmoking: IndoorSmokingEnum.optional(),
  })
  .strict();

export const ChatMessageRoleEnum = z.enum(['user', 'assistant']);

export const ChatMessageSchema = z
  .object({
    role: ChatMessageRoleEnum,
    content: z.string().trim().min(1).max(2000),
  })
  .strict();

export const ChatRequestSchema = z
  .object({
    message: z.string().trim().min(1).max(1000),
    history: z.array(ChatMessageSchema).max(12).optional(),
    context: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const AIOutputSchema = z
  .object({
    reply: z.string().trim().min(1).max(10000),
    model: z.string().optional(),
    status: z.enum(['success', 'notice']).default('success'),
    isFallback: z.boolean().optional(),
  })
  .strict();
