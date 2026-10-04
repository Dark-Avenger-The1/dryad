// ---------------------------------------------------------------------------
// 2. WATERING INTERVAL  (derived, since Trefle has no watering field)
// ---------------------------------------------------------------------------

/**
 * Trefle has no "watering" field, so derive a base interval from
 * soil_humidity (1 xerophile .. 12 submerged) and light band.
 */
export function deriveWateringDays({ soilHumidity, lightBand }) {
  let days;
  if (soilHumidity == null) {
    days = 3;                       // safe default
  } else if (soilHumidity <= 3) {
    days = 10;                      // dry-habitat plant
  } else if (soilHumidity <= 6) {
    days = 4;
  } else if (soilHumidity <= 9) {
    days = 2;
  } else {
    days = 1;                       // aquatic / bog plant
  }

  // full-sun plants dry out faster
  if (lightBand === 'full') days = Math.max(1, days - 1);
  if (lightBand === 'shade') days = days + 1;

  return days;
}