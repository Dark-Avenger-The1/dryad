import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import getForeCast from '../services/weatherService';
import { LocationContext } from '../context/LocationContext';

const CACHE_KEY = 'dryad:weather';
// Re-fetch if the cached reading is older than this, even on the same day.
const MAX_AGE_MS = 3 * 60 * 60 * 1000;   // 3 hours

/** "2026-10-12" in the device's local timezone. */
function todayKey() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Round coords so tiny GPS drift doesn't invalidate the cache. */
function coordKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

/**
 * Returns today's forecast, fetched at most once per 3 hours per location.
 * Refreshes automatically when the screen regains focus, when the app
 * returns from the background, and when the calendar day changes.
 *
 * @returns { weather, loading, error, refresh, lastUpdated }
 */
export function useDailyWeather() {
  const { getLocation } = useContext(LocationContext);

  const [weather, setWeather] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guards against setting state after unmount and against overlapping fetches.
  const aliveRef = useRef(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const load = useCallback(async ({ force = false } = {}) => {
    const lat = getLocation?.latitude;
    const lon = getLocation?.longitude;
    if (lat == null || lon == null) return;      // location not ready yet
    if (fetchingRef.current) return;             // a fetch is already running

    const key = `${CACHE_KEY}:${coordKey(lat, lon)}`;
    const today = todayKey();

    // 1. try the cache first
    if (!force) {
      try {
        const rawCache = await AsyncStorage.getItem(key);
        if (rawCache) {
          const cached = JSON.parse(rawCache);
          const fresh =
            cached.day === today &&
            Date.now() - cached.fetchedAt < MAX_AGE_MS;

          if (fresh) {
            if (aliveRef.current) {
              setWeather(cached.data);
              setLastUpdated(cached.fetchedAt);
              setError(null);
            }
            return;
          }
          // stale but same location — show it while the new one loads
          if (aliveRef.current && !weather) setWeather(cached.data);
        }
      } catch {
        // cache unreadable — fall through to the network
      }
    }

    // 2. fetch
    fetchingRef.current = true;
    if (aliveRef.current) setLoading(true);

    try {
      const data = await getForeCast(lat, lon);
      const fetchedAt = Date.now();

      if (aliveRef.current) {
        setWeather(data);
        setLastUpdated(fetchedAt);
        setError(null);
      }

      await AsyncStorage.setItem(
        key,
        JSON.stringify({ day: today, fetchedAt, data })
      );
    } catch (e) {
      if (aliveRef.current) setError(e);
      // keep whatever cached weather is on screen rather than blanking it
    } finally {
      fetchingRef.current = false;
      if (aliveRef.current) setLoading(false);
    }
  }, [getLocation?.latitude, getLocation?.longitude, weather]);

  // --- trigger 1: location becomes available, or changes ------------------
  useEffect(() => {
    load();
  }, [getLocation?.latitude, getLocation?.longitude]);   // eslint-disable-line

  // --- trigger 2: screen regains focus ------------------------------------
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // --- trigger 3: app returns from background -----------------------------
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => sub.remove();
  }, [load]);

  // --- trigger 4: the calendar day rolls over while the app is open -------
  useEffect(() => {
    const dayAtMount = todayKey();
    const timer = setInterval(() => {
      if (todayKey() !== dayAtMount) {
        load({ force: true });
      }
    }, 60 * 1000);   // check every minute
    return () => clearInterval(timer);
  }, [load]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  return { weather, loading, error, refresh, lastUpdated };
}