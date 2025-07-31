import { plantApi, harvestApi } from "./Paths";
import { PlantEntry, HarvestEntry } from "../types";

export const fetchPlants = async (): Promise<PlantEntry[]> => {
  try {
    const response = await fetch(plantApi());
    if (!response.ok) {
      throw new Error(
        `Feilet ved henting av plantedata. Status:${response.status}`
      );
    }
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Ukjent error ved henting av plantedata");
    }
  }
};

export const fetchHarvestData = async (
  week: number | undefined,
  year: number | null
): Promise<HarvestEntry[]> => {
  try {
    if (!year || year < 2000) {
      throw new Error("Henting av høstedata trenger å få tilsendt årstall");
    }
    let url = `${harvestApi()}?year=${year}`;
    if (week && week > 0) {
      url += `&week=${week}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Feilet ved henting av høstedata for uke:${week}. Status:${response.status}`
      );
    }
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Ukjent error ved henting av høstedata");
    }
  }
};
export const updateHarvestEntry = async (
  id: number,
  updatedFields: { [key: string]: string }
) => {
  try {
    const response = await fetch(`${harvestApi()}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
      throw new Error(
        `Feilet ved oppdatering av id:${id}. Status:${response.status}`
      );
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Ukjent error ved oppdatering av høstedata");
    }
  }
};

export const deleteHarvestEntry = async (id: number) => {
  try {
    const response = await fetch(`${harvestApi()}?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Feilet ved sletting av høste-id:${id}. Status:${response.status}`
      );
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Ukjent error ved sletting av plantedata");
    }
  }
};
