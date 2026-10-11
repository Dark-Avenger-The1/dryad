import {  createContext,useEffect, useState} from "react";
import getCurrentLocation from "../services/GeoLocation";
export const LocationContext = createContext(null);

export default function LocationProvider({children}){
    const [getLocation,setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        let alive = true;
        (async () => {
        try {
            const coords = await getCurrentLocation();
            if (alive) setLocation(coords);
        } catch (e) {
            if (alive) setLocationError(e.message);
        }
        })();
        return () => { alive = false; };
    }, []);
    return(
        <LocationContext.Provider value={{getLocation,setLocation,locationError,setLocationError}}>
            {children}
        </LocationContext.Provider>
    );
}