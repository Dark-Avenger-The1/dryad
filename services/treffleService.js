export default class Perenual{
    #key;
    #plantDetail;
    #plantName;
    #plantID;
    #plantGuide;
    constructor(plantName){
        this.#key=process.env.TREFFLE_KEY;
        this.#plantDetail={
            hardness:null,
            watering:null,
            sun:null,
            droughtTolerance:null,
            maintenace:null,
            careLevel:null,
            soil:null,
            saltTolerance:null
        };
        
        this.#plantName=plantName;
    }

    extractPlantID(){

    }
}