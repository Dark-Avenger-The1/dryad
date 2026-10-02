import * as ImagePicker from 'expo-image-picker';

export default async function cameraHelper(choice){
    try {
        const result=null;
        const permission= null;
        switch(choice){
            case "capture":
                permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    throw new Error('Permission needed', 'Camera access is required to scan a plant.');
                }
                
                result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.7,
                });
                
                if (!result.canceled) {
                    return result.assets[0];
                }else{
                    throw new Error("Cancelled","Cancelled capture of photo");
                }
                break;
            case "pick-gallery":
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!permission.granted) {
                        throw new Error('Permission needed', 'Media library access is required to upload a photo.');
                    }
                    
                    result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        quality: 0.7,
                    });
                    
                    if (!result.canceled) {
                        return result.assets[0];
                    }else{
                        throw new Error("Cancelled","Cancelled capture of photo");
                    }
                break;
                default:
                    throw new Error("Unidentified Argument",`${choice} in the argument does not identified.`)
        }
    } catch (error) {
        
    }
}