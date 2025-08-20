import { HarvestEntry } from "../types";

export const filterHarvestData = (
  harvestData: HarvestEntry[]
): HarvestEntry[] => {
  const filteredHarvest = harvestData.sort((a, b) => {
    if (a.week !== b.week) {
      return a.week - b.week;
    }
    if (a.plot_order !== b.plot_order) {
      return a.plot_order - b.plot_order;
    }
    return a.name.localeCompare(b.name);
  });

  return filteredHarvest;
};
