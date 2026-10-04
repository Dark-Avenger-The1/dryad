import PlantNet from "../services/plantNetService";
import * as ImagePicker from 'expo-image-picker';
import cameraHelper from "../helper/CameraHelper";
import Treffle from "../services/treffleService";
import buildTipsInterpreter from "../logic/BuildPlantFieldInterpreter";
import { resolveGrowth,toGrowthShape } from "../helper/PlantDefaults";

const identifyPlantScanner = async (choice) => {
  const image = await cameraHelper(choice);
  if (!image) return null;

  const plantnet = new PlantNet();
  const raw = await plantnet.identifyPlant(image);
  const normalized = plantnet.normalize(raw);

  if (!normalized.candidates.length) {
    throw new Error('Could not identify the plant. Try another photo.');
  }

  const scientificName = normalized.candidates[0].scientificName;
  const treffle = new Treffle();
  await treffle.fetchPlantInfo(scientificName);
  const plantDetails = treffle.getPlantDetails();
  console.log('trefle result:', JSON.stringify(plantDetails));
  const resolved = resolveGrowth(plantDetails, scientificName);
  try {
    
    console.log('resolved:', JSON.stringify(resolved.values));
    console.log("Nigga: ",toGrowthShape(resolved.values));
    } catch (e) {
    console.log('RESOLVE FAILED:', e.message, e.stack);
    }
    
  const care = buildTipsInterpreter(toGrowthShape(resolved.values));

  return {
    image,                               // ← for the preview
    candidates: normalized.candidates,   // ← for name + alternatives
    info: plantDetails,
    care,
    confidence: resolved.confidence,
  };
};

// const identifyPlantScanner = async (choice) => {
//   try {
//     const image = await cameraHelper(choice);
//     if (!image) return null;

//     const plantnet = new PlantNet();
//     const raw = await plantnet.identifyPlant(image);
//     console.log('STEP 1 ok');

//     const normalized = plantnet.normalize(raw);
//     console.log('STEP 2 ok', normalized);

//     const sciName = normalized.candidates[0].scientificName;
//     console.log('STEP 3 ok', sciName);

//     const treffle = new Treffle();
//     const details = await treffle.fetchPlantInfo(sciName);
//     console.log('STEP 4 ok', details);

//     const care = buildTipsInterpreter(details);;
//     console.log('STEP 5 ok');

//     return { info: details, care };
//   } catch (e) {
//     console.log('FAILED:', e.message, e.stack);
//     throw e;
//   }
// };

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