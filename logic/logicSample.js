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
export function interpretLight(light) {
  if (light == null) return null;
  if (light <= 3) {
    return {
      band: 'shade',
      hours: '2-3',
      tip: 'This plant grows in shaded places. Keep it away from direct midday sun.',
      placement: 'Place indoors near a north window, or under taller plants outdoors.',
    };
  }
  if (light <= 6) {
    return {
      band: 'partial',
      hours: '4-6',
      tip: 'This plant prefers partial sunlight. Morning sun with afternoon shade suits it best.',
      placement: 'Place where it gets sun before 10 AM, then shade.',
    };
  }
  return {
    band: 'full',
    hours: '6-8',
    tip: 'This plant needs full sun. Give it an open spot with no overhead cover.',
    placement: 'Place in the most open part of your garden or balcony.',
  };
}

/** atmospheric_humidity: 1 (very dry air) .. 9 (saturated) */
export function interpretHumidity(humidity) {
  if (humidity == null) return null;
  if (humidity <= 3) {
    return {
      band: 'dry',
      percent: [20, 45],
      tip: 'This plant is used to dry air. Do not mist it, and make sure air moves around it.',
    };
  }
  if (humidity <= 6) {
    return {
      band: 'moderate',
      percent: [45, 70],
      tip: 'Average household humidity is fine for this plant.',
    };
  }
  return {
    band: 'humid',
    percent: [70, 95],
    tip: 'This plant likes humid air. Group it with other plants or mist it on dry days.',
  };
}

/** soil_nutriments: 1 (very poor) .. 9 (very rich) */
export function interpretSoil(soil) {
  if (soil == null) return null;
  if (soil <= 3) {
    return {
      band: 'poor',
      tip: 'This plant survives in poor soil. Too much fertilizer can harm it.',
      feedEveryDays: null,
      prepStep: 'Use plain garden soil mixed with sand for drainage. Skip the compost.',
    };
  }
  if (soil <= 6) {
    return {
      band: 'average',
      tip: 'Ordinary garden soil with some compost suits this plant.',
      feedEveryDays: 60,
      prepStep: 'Mix garden soil with compost at about 3:1.',
    };
  }
  return {
    band: 'rich',
    tip: 'This plant is a heavy feeder and needs rich soil.',
    feedEveryDays: 30,
    prepStep: 'Mix garden soil with plenty of compost or aged manure, about 2:1.',
  };
}

/** ph_minimum / ph_maximum -> acidity guidance */
export function interpretPh(phMin, phMax) {
  if (phMin == null && phMax == null) return null;
  const mid = ((phMin ?? phMax) + (phMax ?? phMin)) / 2;

  let band, tip, amendment;
  if (mid < 6.0) {
    band = 'acidic';
    tip = `This plant prefers acidic soil (pH ${phMin ?? '?'}-${phMax ?? '?'}).`;
    amendment = 'Mix in coffee grounds, pine bark, or peat to lower the pH.';
  } else if (mid <= 7.5) {
    band = 'neutral';
    tip = `This plant prefers neutral soil (pH ${phMin ?? '?'}-${phMax ?? '?'}).`;
    amendment = 'Most garden soil is already in this range. No adjustment needed.';
  } else {
    band = 'alkaline';
    tip = `This plant prefers alkaline soil (pH ${phMin ?? '?'}-${phMax ?? '?'}).`;
    amendment = 'Mix in garden lime or crushed eggshells to raise the pH.';
  }
  return { band, tip, amendment, phMin, phMax };
}

/** minimum_temperature / maximum_temperature, in Celsius */
export function interpretTemp(minTemp, maxTemp) {
  if (minTemp == null && maxTemp == null) return null;
  const tips = [];

  if (minTemp != null) {
    if (minTemp >= 15) {
      tips.push(`This is a tropical plant. It suffers below ${minTemp}C.`);
    } else if (minTemp >= 0) {
      tips.push(`This plant tolerates cool weather down to ${minTemp}C.`);
    } else {
      tips.push(`This plant is frost-hardy, down to ${minTemp}C.`);
    }
  }
  if (maxTemp != null) {
    if (maxTemp <= 30) {
      tips.push(`It struggles above ${maxTemp}C, so it needs afternoon shade in hot months.`);
    } else {
      tips.push(`It handles heat well, up to about ${maxTemp}C.`);
    }
  }
  return { minTemp, maxTemp, tips };
}





// ---------------------------------------------------------------------------
// 4. DAILY TASKS  (plant rules crossed with today's weather)
// ---------------------------------------------------------------------------

/**
 * @param care     output of buildCareProfile()
 * @param weather  { temp:{now,maxTemp,minTemp}, humidity, rain, light }
 * @param state    { daysSinceWatered, daysSinceFed }
 */
export function buildDailyTasks(care, weather, state = {}) {
  const tasks = [];
  const { light, humidity, soil, temp, wateringDays } = care;
  const daysSinceWatered = state.daysSinceWatered ?? 99;

  // --- watering ---------------------------------------------------------
  let due = daysSinceWatered >= wateringDays;

  if (weather?.rain > 5) {
    tasks.push({ type: 'info', text: 'Rain today — skip watering.' });
    due = false;
  } else if (due) {
    const hot = temp?.maxTemp != null && weather?.temp?.maxTemp > temp.maxTemp;
    tasks.push({
      type: 'water',
      text: hot
        ? 'Water twice today, early morning and late afternoon. It is hotter than this plant likes.'
        : 'Water today until the soil is damp but not soggy.',
      priority: 'high',
    });
  } else {
    const left = wateringDays - daysSinceWatered;
    tasks.push({ type: 'info', text: `Next watering in ${left} day${left === 1 ? '' : 's'}.` });
  }

  // --- heat stress ------------------------------------------------------
  if (temp?.maxTemp != null && weather?.temp?.maxTemp > temp.maxTemp) {
    tasks.push({
      type: 'shade',
      text: `Today reaches ${weather.temp.maxTemp}C, above this plant's limit of ${temp.maxTemp}C. Move it to shade or cover it.`,
      priority: 'high',
    });
  }

  // --- cold stress ------------------------------------------------------
  if (temp?.minTemp != null && weather?.temp?.minTemp < temp.minTemp) {
    tasks.push({
      type: 'protect',
      text: `Tonight drops to ${weather.temp.minTemp}C, below this plant's limit of ${temp.minTemp}C. Bring it indoors if you can.`,
      priority: 'high',
    });
  }

  // --- humidity ---------------------------------------------------------
  if (humidity?.band === 'humid' && weather?.humidity != null && weather.humidity < 50) {
    tasks.push({ type: 'mist', text: 'Air is dry today. Mist the leaves in the morning.' });
  }
  if (humidity?.band === 'dry' && weather?.humidity != null && weather.humidity > 80) {
    tasks.push({ type: 'airflow', text: 'Air is very humid. Improve airflow to prevent fungus.' });
  }

  // --- sunlight ---------------------------------------------------------
  if (light?.band === 'full' && weather?.light != null && weather.light < 3) {
    tasks.push({ type: 'info', text: 'Cloudy day with little sun. Move it to the brightest spot you have.' });
  }

  // --- feeding ----------------------------------------------------------
  if (soil?.feedEveryDays && (state.daysSinceFed ?? 99) >= soil.feedEveryDays) {
    tasks.push({ type: 'feed', text: 'Time to feed. Add compost or a balanced fertilizer.' });
  }

  return tasks;
}

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