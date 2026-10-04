import { interpretPh,interpretTemp,interpretLight,interpretSoil,interpretHumidity } from "./FieldInterpreter";
import { deriveWateringDays } from "./WateringInterval";
import { buildPlantingSteps } from "./PlantStep";

export default function buildTipsInterpreter(growthRaw = {}){
    const g = growthRaw;
    const light = interpretLight(g.light);
    const humidity = interpretHumidity(g.humidity);
    const soil = interpretSoil(g.soilNutriments);
    const ph = interpretPh(g.phLevel.phMin, g.phLevel.phMax);
    const temp = interpretTemp(
        g.temp.minTemp?.deg_c ?? null,
        g.temp.maxTemp?.deg_c ?? null
    );

    const wateringDays = deriveWateringDays({
        soilHumidity: g.soilHumidity,
        lightBand: light?.band,
    });

    const care = { light, humidity, soil, ph, temp, wateringDays };

    care.tips = [
        light?.tip,
        humidity?.tip,
        soil?.tip,
        ph?.tip,
        ...(temp?.tips ?? []),
        `Water about every ${wateringDays} day${wateringDays === 1 ? '' : 's'}.`,
    ].filter(Boolean);

    care.plantingSteps = buildPlantingSteps(care);

    // How much of this came from real data vs defaults — useful to show the user.
    const known = [light, humidity, soil, ph, temp].filter(Boolean).length;
    care.dataCompleteness = Math.round((known / 5) * 100);

    return care;
}