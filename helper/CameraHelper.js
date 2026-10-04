import * as ImagePicker from 'expo-image-picker';

export default async function cameraHelper(choice) {
  let permission;
  let result;

  switch (choice) {
    case 'capture':
      permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Camera access is required to scan a plant.');
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      break;

    case 'pick-gallery':
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Media library access is required to upload a photo.');
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      break;

    default:
      throw new Error(`Unknown choice: ${choice}`);
  }

  if (result.canceled) return null;   // user cancelled — not an error
  return result.assets[0];
}