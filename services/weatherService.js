import axios from "axios";

const BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Fetches today's forecast from Open-Meteo.
 * Throws on failure so the caller can handle it — never returns a string.
 *
 * @returns {{ light:number, humidity:number,
 *             temp:{ maxTemp:number, minTemp:number, now:number },
 *             rain:number }}
 */
export default async function getForeCast(lat, lon) {
  if (lat == null || lon == null) {
    throw new Error('Location not available yet');
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_sum',
    timezone: 'auto',
    forecast_days: '1',
  });

  // axios throws on non-2xx by itself, so there is no res.ok to check.
  const res = await axios.get(`${BASE}?${params}`);
  const json = res.data;

  return {
    light: json.daily.sunshine_duration[0] / 3600,   // seconds -> hours
    humidity: json.current.relative_humidity_2m,     // %
    temp: {
      maxTemp: json.daily.temperature_2m_max[0],
      minTemp: json.daily.temperature_2m_min[0],
      now: json.current.temperature_2m,
    },
    rain: json.daily.precipitation_sum[0],           // mm today
  };
}