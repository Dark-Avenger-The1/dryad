/**
 * careRules.js — DRYAD rule-based care generator
 *
 * Takes normalized Trefle growth data + current weather and produces:
 *   - tips[]          : descriptive sentences about the plant's needs
 *   - plantingSteps[] : ordered steps for putting it in the ground
 *   - dailyTasks[]    : today's actions, adjusted by weather
 *
 * No machine learning. Every output comes from an explicit threshold.
 */

// ---------------------------------------------------------------------------
// 1. FIELD INTERPRETERS  (Ellenberg / Julve scales -> human meaning)
// ---------------------------------------------------------------------------

/** light: 1 (deep shade) .. 9 (full sun) */








// ---------------------------------------------------------------------------
// 5. ASSEMBLE
// ---------------------------------------------------------------------------

/** Build the full care profile from a Trefle growth object. */
export function buildCareProfile(growthRaw = {}) {
  const g = growthRaw;

  const light = interpretLight(g.light);
  const humidity = interpretHumidity(g.atmospheric_humidity);
  const soil = interpretSoil(g.soil_nutriments);
  const ph = interpretPh(g.ph_minimum, g.ph_maximum);
  const temp = interpretTemp(
    g.minimum_temperature?.deg_c ?? null,
    g.maximum_temperature?.deg_c ?? null
  );

  const growth = {
    daysToHarvest: g.days_to_harvest ?? null,
    growthMonths: g.growth_months ?? null,
    rowSpacingCm: g.row_spacing?.cm ?? null,
    minRootDepthCm: g.minimum_root_depth?.cm ?? null,
    soilHumidity: g.soil_humidity ?? null,
    sowing: g.sowing ?? null,
    description: g.description ?? null,
  };

  const wateringDays = deriveWateringDays({
    soilHumidity: growth.soilHumidity,
    lightBand: light?.band,
  });

  const care = { light, humidity, soil, ph, temp, growth, wateringDays };

  care.tips = [
    light?.tip,
    humidity?.tip,
    soil?.tip,
    ph?.tip,
    ...(temp?.tips ?? []),
    `Water about every ${wateringDays} day${wateringDays === 1 ? '' : 's'}.`,
  ].filter(Boolean);

  care.plantingSteps = buildPlantingSteps(care);

  // How much of this came from real data vs defaults — useful to show the user.
  const known = [light, humidity, soil, ph, temp].filter(Boolean).length;
  care.dataCompleteness = Math.round((known / 5) * 100);

  return care;
}