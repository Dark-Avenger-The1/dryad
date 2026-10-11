import * as Location from 'expo-location';
export default async function getCurrentLocation() {
    // 1. Ask for permission
    let { status } = await Location.requestForegroundPermissionsAsync(); //
    if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
    }

    // 2. Get the current position
    let currentLocation = await Location.getCurrentPositionAsync({});
    return currentLocation.coords;
}