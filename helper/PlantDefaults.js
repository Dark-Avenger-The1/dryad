/**
 * plantDefaults.js — fallback layer for DRYAD
 *
 * Trefle returns null for most tropical plants. This fills the gaps
 * from a local dataset so the rule engine always has something to work with.
 *
 * Resolution order (first non-null wins):
 *   1. Trefle          — real API data
 *   2. SPECIES_DEFAULTS — exact scientific name match
 *   3. GENUS_DEFAULTS   — same genus (Musa, Solanum, ...)
 *   4. BASELINE         — generic houseplant values
 *
 * Every field carries a `source` so the UI can label estimated values
 * and the user can override them.
 */

// ---------------------------------------------------------------------------
// Scales (same as Trefle, so interpreters need no changes)
//   light             1-9    (1 deep shade .. 9 full sun)
//   atmosphericHumidity 1-9  (1 very dry air .. 9 saturated)
//   soilNutriments    1-9    (1 very poor .. 9 very rich)
//   soilHumidity      1-12   (1 desert .. 12 submerged)
//   temps             Celsius
// ---------------------------------------------------------------------------

export const BASELINE = {
  light: 6,
  atmosphericHumidity: 6,
  soilNutriments: 5,
  soilHumidity: 5,
  phMin: 6.0,
  phMax: 7.0,
  minTempC: 15,
  maxTempC: 35,
};

export const GENUS_DEFAULTS = {
  Musa:        { light: 8, atmosphericHumidity: 8, soilNutriments: 8, soilHumidity: 7, phMin: 5.5, phMax: 7.0, minTempC: 15, maxTempC: 38 },
  Solanum:     { light: 9, atmosphericHumidity: 5, soilNutriments: 7, soilHumidity: 5, phMin: 6.0, phMax: 6.8, minTempC: 10, maxTempC: 35 },
  Capsicum:    { light: 9, atmosphericHumidity: 5, soilNutriments: 6, soilHumidity: 5, phMin: 6.0, phMax: 7.0, minTempC: 15, maxTempC: 38 },
  Ocimum:      { light: 8, atmosphericHumidity: 6, soilNutriments: 6, soilHumidity: 6, phMin: 6.0, phMax: 7.5, minTempC: 12, maxTempC: 35 },
  Citrus:      { light: 8, atmosphericHumidity: 6, soilNutriments: 6, soilHumidity: 5, phMin: 5.5, phMax: 7.0, minTempC: 10, maxTempC: 38 },
  Monstera:    { light: 4, atmosphericHumidity: 8, soilNutriments: 6, soilHumidity: 6, phMin: 5.5, phMax: 7.0, minTempC: 15, maxTempC: 32 },
  Sansevieria: { light: 5, atmosphericHumidity: 3, soilNutriments: 3, soilHumidity: 2, phMin: 5.5, phMax: 7.5, minTempC: 10, maxTempC: 38 },
  Dracaena:    { light: 4, atmosphericHumidity: 6, soilNutriments: 4, soilHumidity: 4, phMin: 6.0, phMax: 7.0, minTempC: 13, maxTempC: 32 },
  Epipremnum:  { light: 4, atmosphericHumidity: 7, soilNutriments: 5, soilHumidity: 5, phMin: 6.0, phMax: 7.0, minTempC: 15, maxTempC: 32 },
  Moringa:     { light: 9, atmosphericHumidity: 4, soilNutriments: 4, soilHumidity: 3, phMin: 6.0, phMax: 7.5, minTempC: 15, maxTempC: 42 },
  Brassica:    { light: 7, atmosphericHumidity: 6, soilNutriments: 7, soilHumidity: 6, phMin: 6.0, phMax: 7.5, minTempC: 5,  maxTempC: 30 },
  Carica:      { light: 9, atmosphericHumidity: 7, soilNutriments: 7, soilHumidity: 5, phMin: 5.5, phMax: 7.0, minTempC: 15, maxTempC: 38 },
  Mangifera:   { light: 9, atmosphericHumidity: 6, soilNutriments: 5, soilHumidity: 4, phMin: 5.5, phMax: 7.5, minTempC: 15, maxTempC: 42 },
  Cocos:       { light: 9, atmosphericHumidity: 8, soilNutriments: 5, soilHumidity: 6, phMin: 5.5, phMax: 7.0, minTempC: 18, maxTempC: 40 },
  Zingiber:    { light: 5, atmosphericHumidity: 8, soilNutriments: 7, soilHumidity: 7, phMin: 5.5, phMax: 6.5, minTempC: 18, maxTempC: 35 },
};

export const SPECIES_DEFAULTS = {
  'Musa acuminata':         { ...GENUS_DEFAULTS.Musa, daysToHarvest: 300 },
  'Musa paradisiaca':       { ...GENUS_DEFAULTS.Musa, daysToHarvest: 330 },
  'Solanum lycopersicum':   { ...GENUS_DEFAULTS.Solanum, daysToHarvest: 80 },
  'Solanum melongena':      { ...GENUS_DEFAULTS.Solanum, daysToHarvest: 100 },
  'Capsicum frutescens':    { ...GENUS_DEFAULTS.Capsicum, daysToHarvest: 90 },
  'Ocimum basilicum':       { ...GENUS_DEFAULTS.Ocimum, daysToHarvest: 60 },
  'Citrus microcarpa':      { ...GENUS_DEFAULTS.Citrus, daysToHarvest: 240 },
  'Moringa oleifera':       { ...GENUS_DEFAULTS.Moringa, daysToHarvest: 240 },
  'Brassica rapa':          { ...GENUS_DEFAULTS.Brassica, daysToHarvest: 45 },
  'Carica papaya':          { ...GENUS_DEFAULTS.Carica, daysToHarvest: 270 },
  'Monstera deliciosa':     { ...GENUS_DEFAULTS.Monstera },
  'Sansevieria trifasciata':{ ...GENUS_DEFAULTS.Sansevieria },
  'Epipremnum aureum':      { ...GENUS_DEFAULTS.Epipremnum },
  'Zingiber officinale':    { ...GENUS_DEFAULTS.Zingiber, daysToHarvest: 240 },
};

// ---------------------------------------------------------------------------

/** Pull the genus out of "Musa acuminata" -> "Musa" */
function getGenus(scientificName = '') {
  return scientificName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Merge Trefle data over the defaults, field by field.
 *
 * @param trefleDetails  output of Treffle.getPlantDetails() (camelCase), may be null
 * @param scientificName e.g. "Musa acuminata"
 * @returns { values, sources, completeness }
 *          values  — flat object, never null
 *          sources — same keys, each 'trefle' | 'species' | 'genus' | 'baseline'
 */
export function resolveGrowth(trefleDetails, scientificName) {
  const t = trefleDetails ?? {};

  // flatten Trefle's nested shape into the same flat keys as the defaults
  const fromTrefle = {
    light: t.light ?? null,
    atmosphericHumidity: t.humidity ?? null,
    soilNutriments: t.soilNutriments ?? null,
    soilHumidity: t.soilHumidity ?? null,
    phMin: t.phLevel?.phMin ?? null,
    phMax: t.phLevel?.phMax ?? null,
    minTempC: t.temp?.minTemp ?? null,
    maxTempC: t.temp?.maxTemp ?? null,
  };

  const species = SPECIES_DEFAULTS[scientificName] ?? null;
  const genus = GENUS_DEFAULTS[getGenus(scientificName)] ?? null;

  const values = {};
  const sources = {};

  for (const key of Object.keys(BASELINE)) {
    if (fromTrefle[key] != null) {
      values[key] = fromTrefle[key];
      sources[key] = 'trefle';
    } else if (species?.[key] != null) {
      values[key] = species[key];
      sources[key] = 'species';
    } else if (genus?.[key] != null) {
      values[key] = genus[key];
      sources[key] = 'genus';
    } else {
      values[key] = BASELINE[key];
      sources[key] = 'baseline';
    }
  }

  // extras that only exist in the local dataset
  values.daysToHarvest = species?.daysToHarvest ?? null;

  const real = Object.values(sources).filter(s => s === 'trefle').length;
  const known = Object.values(sources).filter(s => s !== 'baseline').length;

  return {
    values,
    sources,
    completeness: Math.round((known / Object.keys(BASELINE).length) * 100),
    fromApi: Math.round((real / Object.keys(BASELINE).length) * 100),
    confidence:
      real > 0 ? 'verified' : known > 0 ? 'estimated' : 'generic',
  };
}

/**
 * Convert resolved values back into the snake_case shape that
 * buildCareProfile() expects, so careRules.js needs no changes.
 */
export function toGrowthShape(values) {
  return {
    light: values.light,
    humidity: values.atmosphericHumidity,
    soilNutriments: values.soilNutriments,
    soilHumidity: values.soilHumidity,
    phLevel:{
        phMin: values.phMin,
        phMax: values.phMax,
    },
    temp:{
        minTemp: { deg_c: values.minTempC },
        maxTemp: { deg_c: values.maxTempC },
    },
    
    days_to_harvest: values.daysToHarvest,
  };
}