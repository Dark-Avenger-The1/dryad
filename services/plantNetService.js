import axios from "axios";

export default class PlantNet {
  #key;
  constructor() {
    this.#key = process.env.PLANTNET_KEY;
  }

  async identifyPlant(selectedImage) {
    return this.#key ?? 'No key';
    // if (!this.#key) throw new Error('Missing Pl@ntNet API key');

    // const formData = new FormData();
    // formData.append('images', {
    //   uri: selectedImage.uri,
    //   name: selectedImage.fileName || 'plant.jpg',
    //   type: selectedImage.mimeType || 'image/jpeg',
    // });
    // formData.append('organs', 'auto');

    // try {
    //   const res = await axios.post(
    //     `https://my-api.plantnet.org/v2/identify/all?api-key=${this.#key}`,
    //     formData,
    //     { timeout: 20000 }
    //   );
    //   return res.data;
    // } catch (error) {
    //   throw new Error(
    //     error.response?.data?.message || error.message || 'Request failed'
    //   );
    // }
  }
}