import { createContext, useContext, useEffect, useState } from "react";
import getForeCast from "../services/weatherService";
import { LocationContext } from "./LocationContext";

export const WeatherContext = createContext(null);

// Today's forecast, fetched once the location is ready and again each new day.
// Must sit inside LocationProvider.
export default function WeatherProvider({ children }) {
    const { getLocation, locationError } = useContext(LocationContext);

    const [weather, setWeather] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [day, setDay] = useState(new Date().toDateString());

    // Without a location there is nothing to fetch, so screens stop waiting.
    useEffect(() => {
        if (locationError) setWeatherError(locationError);
    }, [locationError]);

    useEffect(() => {
        if (!getLocation?.latitude) return;

        let alive = true;
        getForeCast(getLocation.latitude, getLocation.longitude)
            .then((w) => {
                if (!alive) return;
                setWeather(w);
                setWeatherError(null);
            })
            .catch((e) => {
                if (!alive) return;
                setWeatherError(e.message);
                console.log("weather failed:", e.message);
            });

        return () => {
            alive = false;
        };
    }, [getLocation?.latitude, getLocation?.longitude, day]);

    // Rolls the day over at midnight, which re-runs the fetch above.
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().toDateString();
            if (now !== day) setDay(now);
        }, 60 * 1000);
        return () => clearInterval(timer);
    }, [day]);

    return (
        <WeatherContext.Provider value={{ weather, weatherError, day }}>
            {children}
        </WeatherContext.Provider>
    );
}
