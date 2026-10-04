import axios from "axios";
import {PLANTNET_KEY} from '@env';
export default class PlantNet {
  #key;
  #scientificName;
  #identifiedPlantData;
  constructor() {
    this.#key = PLANTNET_KEY;
  }

  async identifyPlant(selectedImage) {
    if (!this.#key) throw new Error('Missing Pl@ntNet API key');

    const formData = new FormData();
    formData.append('images', {
      uri: selectedImage.uri,
      name: selectedImage.fileName || 'plant.jpg',
      type: selectedImage.mimeType || 'image/jpeg',
    });
    formData.append('organs', 'auto');

    try {
      const res = await axios.post(
        `https://my-api.plantnet.org/v2/identify/all?api-key=${this.#key}`,
        formData,
        { timeout: 20000 }
      );
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || 'Request failed'
      );
    }
  }

    normalize(raw) {
      const data ={
        bestMatch: raw.bestMatch,
        organ: raw.predictedOrgans?.[0]?.organ ?? null,
        remaining: raw.remainingIdentificationRequests,
        candidates: (raw.results ?? []).slice(0, 3).map(r => ({
          scientificName: r.species.scientificNameWithoutAuthor,
          commonName: r.species.commonNames?.[0] ?? null,
          family: r.species.family.scientificNameWithoutAuthor,
          score: Math.round(r.score * 100),
          gbifId: r.gbif?.id ?? null,
        })),
      }
      this.#scientificName=data.candidates[0];
      this.#identifiedPlantData=data;
    }

    getScientificName(){
      return this.#scientificName;
    }
}