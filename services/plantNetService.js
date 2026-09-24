import axios from "axios";

export default class PlantNet{
    #key;
    #currentPlant;
    constructor(){
        this.#key=process.env.PLANTNET_KEY;
        this.#currentPlant={
            scientificName:null,
            commonName:null
        }
    }

    async identifyPlant(selectedImage){

        const formData = FormData();

        formData.append('images',{
            uri:selectedImage.uri,
            name:selectedImage.fileName,
            type:selectedImage.type ||'image/jpeg'
        })
        try {
            const response = await axios.post(`https://my-api.plantnet.org/v2/identify/all?api-key=${this.#key}`,formData,{
                headers:{
                    'Content-Type': 'multipart/form-data',
                }
            });
            return (await response).data;
        } catch (error) {
            throw new Error(error.message);
        };
    }

    getScientificName(){
        return this.#currentPlant.scientificName;
    }
    getCommonName(){
        return this.#currentPlant.commonName;
    }
}