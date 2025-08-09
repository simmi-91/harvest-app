import React, { useEffect, useState } from "react";
import { Stack, Button, Input } from "@mui/material";

import InsertManualHarvest from "../New/InsertManualHarvest";
import { PlantEntry } from "../../types";

type AddNewHarvestProps = {
  week: number;
  year: number;
  plantData: PlantEntry[];
  manualHarvestTextInput: string;
  setManualHarvestTextInput: (text: string) => void;
  refetchPlants: () => Promise<void>;
  triggerSearch: () => void;
};
const AddNewHarvestView = ({
  week,
  year,
  plantData,
  manualHarvestTextInput,
  setManualHarvestTextInput,
  refetchPlants,
  triggerSearch,
}: AddNewHarvestProps) => {
  return (
    <Stack
      direction="column"
      spacing={1}
      useFlexGap
      sx={{
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" spacing={1}></Stack>

      <InsertManualHarvest
        week={week}
        year={year}
        plantData={plantData}
        refetchPlants={refetchPlants}
        manualHarvestTextInput={manualHarvestTextInput}
        setManualHarvestTextInput={setManualHarvestTextInput}
        triggerSearch={triggerSearch}
      />
    </Stack>
  );
};
export default AddNewHarvestView;
