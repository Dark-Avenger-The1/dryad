import axios from "axios";
import { TREFFLE_KEY } from '@env';

export default class Treffle {
  #key;
  #plantDetail;

  constructor() {
    this.#key = TREFFLE_KEY;
    this.#plantDetail = null;
  }

  async fetchPlantInfo(scientificName) {
    // clean the name: drop hybrid markers, collapse spaces
    const query = scientificName.replace(/×/g, '').replace(/\s+/g, ' ').trim();

    // 1. search for the record
    const search = await axios.get('https://trefle.io/api/v1/plants/search', {
      params: { token: this.#key, q: query },
    });

    const first = search.data?.data?.[0];
    if (!first) {
      this.#plantDetail = null;
      return null;                       // nothing found — caller uses defaults
    }

    // 2. follow the link the API gave us
    const detail = await axios.get(`https://trefle.io${first.links.self}`, {
      params: { token: this.#key },
    });

    const g = detail.data?.data?.growth ?? {};

    this.#plantDetail = {
      slug: first.slug,
      commonName: first.common_name ?? null,
      phLevel: {
        phMax: g.ph_maximum ?? null,
        phMin: g.ph_minimum ?? null,
      },
      light: g.light ?? null,
      humidity: g.atmospheric_humidity ?? null,
      temp: {
        maxTemp: g.maximum_temperature?.deg_c ?? null,
        minTemp: g.minimum_temperature?.deg_c ?? null,
      },
      soilNutriments: g.soil_nutriments ?? null,
      soilHumidity: g.soil_humidity ?? null
    };

    return this.#plantDetail;
  }

  getPlantDetails() {
    return this.#plantDetail;
  }
}