import axios from "axios";

export default class Treffle{
    #key;
    #plantDetail;
    constructor(){
        this.#key=process.env.TREFFLE_KEY;
        this.#plantDetail={
            phLevel:{
                phMax:null,
                phMin:null
            },
            light:null,
            humidity:null,
            temp:{
                maxTemp:null,
                minTemp:null
            },
            soil:null
        };
    }

    async getPlantInfo(plantName){
        const response = await axios.get(`https://trefle.io/api/v1/species/${plantName}?token=${this.#key}`)
        const data = await response.data.growth;
        this.#plantDetail={
            phLevel:{
                phMax:data.ph_maximum,
                phMin:data.ph_minimum
            },
            light:data.light,
            humidity:data.atmospheric_humidity,
            temp:{
                maxTemp:data.maxinum_temperature,
                minTemp:data.minimum_temperature
            },
            soil:data.soil_nutriments
        }
    }


    getPlantDetails(){
        return this.#plantDetail;
    }
}