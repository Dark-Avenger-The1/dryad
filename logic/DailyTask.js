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