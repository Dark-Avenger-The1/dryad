import axios from "axios";

const BASE = 'https://api.open-meteo.com/v1/forecast'

export default async function getForeCast(lat,lon){
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation',
        daily: 'temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_sum',
        timezone: 'auto',
        forecast_days: '1',
    });

    const response = axios.get(`${BASE}?${params}`)
    if (!res.ok) throw new Error(`Weather failed: ${res.status}`);
    const json = await res.data;

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