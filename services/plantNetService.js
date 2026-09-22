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

    async identifyPlant(){
        const query = `

        `;
    }

    getScientificName(){
        return this.#currentPlant.scientificName;
    }
    getCommonName(){
        return this.#currentPlant.commonName;
    }
}