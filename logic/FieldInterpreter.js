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