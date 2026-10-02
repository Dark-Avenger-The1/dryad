import PlantNet from "../services/plantNetService";
import * as ImagePicker from 'expo-image-picker';
import cameraHelper from "../helper/CameraHelper";
import Treffle from "../services/treffleService";
import buildTipsInterpreter from "../logic/BuildPlantFieldInterpreter";

const identifyPlantScanner =async (choice)=>{
    const plantnet = new PlantNet();
    const treffle = new Treffle();
    const image= await cameraHelper(choice);
    const identifiedPlant = await plantnet.identifyPlant(image);
    plantnet.normalize(identifiedPlant);
    const scientificName = plantnet.getScientificName();
    await treffle.fetchPlantInfo(scientificName);
    const plantDetails = treffle.getPlantDetails();
    const plantInterpreter =  buildTipsInterpreter(plantDetails);

    return {
        info:plantDetails,
        care:plantInterpreter
    }

}

const handleScan= async ()=>{
    try{
        const plantnet = new PlantNet();
        let image = null;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
        throw new Error('Permission needed', 'Camera access is required to scan a plant.');
      }
    
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
    
      if (!result.canceled) {
        image=result.assets[0];
      }else{
        return;
      }

      return await plantnet.identifyPlant(image);
    }catch(error){
        return error.message+' error';
    }
      
}

const handlePickImage = async ()=>{
    try{
        const plantnet = new PlantNet();
        let image = null;
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            throw new Error('Permission needed', 'Media library access is required to upload a photo.');
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });
        
        if (!result.canceled) {
            image =result.assets[0];
        }else{
            return;
        }

        return await plantnet.identifyPlant(image);
    }catch(error){
        return error.message+' error';
    }
}

export {handlePickImage,handleScan,identifyPlantScanner}