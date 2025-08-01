import React, { useEffect, useState, Fragment } from "react";
import {
  Stack,
  Chip,
  Divider,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";

import PlantInfo from "./DisplayFormat/PlantInfo";
import { HarvestTableGroup } from "./DisplayFormat/HarvestTable";
import { harvestApi } from "../Utils/Paths";

import { HarvestEntry, PlantEntry } from "../types";
import { address, addressPositions, type Address } from "../App";

type HarvestViewProps = {
  harvestData: HarvestEntry[];
  plantData: PlantEntry[];
  week: number;
  year: number;
};

const HarvestView = ({
  harvestData,
  plantData,
  week,
  year,
}: HarvestViewProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [activeAdress, setActiveAdress] = useState<Address>(address.alle);
  const [activePosition, setActivePosition] = useState<string>("");
  const positionsFilter =
    addressPositions[activeAdress as keyof typeof addressPositions] || [];

  const [harvestablesOnly, setHarvestablesOnly] = useState(false);
  const [showPlantInfoId, setShowPlantInfoId] = useState<number>(0);

  const [modifiedHarvestData, setModifiedHarvestData] = useState([
    ...harvestData,
  ]);
  const [filteredHarvestData, setFilteredHarvestData] = useState([
    ...harvestData,
  ]);

  useEffect(() => {
    const filtered = modifiedHarvestData
      .slice()
      .sort((a, b) => {
        if (a.plot_order !== b.plot_order) {
          return a.plot_order - b.plot_order;
        }
        return a.name.localeCompare(b.name);
      })
      .filter((item) => {
        return (
          item.week.toString()?.includes(week.toString()) &&
          item.year.toString()?.includes(year.toString()) &&
          (activeAdress === address.alle ||
            JSON.stringify(item.location_json).includes(activeAdress)) &&
          (!activePosition ||
            JSON.stringify(item.location_json).includes(activePosition)) &&
          (!harvestablesOnly || item.done == 0)
        );
      });
    setFilteredHarvestData(filtered);

    setLoading(false);
    return () => {};
  }, [activeAdress, activePosition, harvestablesOnly, modifiedHarvestData]);

  useEffect(() => {
    if (showPlantInfoId > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    return () => {};
  }, [showPlantInfoId]);

  const handleHarvestToggle = async (id: number) => {
    try {
      const currentHarvest = filteredHarvestData.find((item) => item.id === id);
      if (!currentHarvest) {
        throw new Error("Høstedata ble ikke funnet");
      }
      const isCurrentlyDone =
        typeof currentHarvest.done === "string"
          ? parseInt(currentHarvest.done)
          : currentHarvest.done;

      const newSetDone: number = isCurrentlyDone === 0 ? 1 : 0;
      const response = await fetch(harvestApi(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          done: newSetDone,
        }),
      });

      if (!response.ok) {
        throw new Error("Feilet å sette høstestatus");
      }
      const result = await response.json();

      if (result.success) {
        setModifiedHarvestData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, done: newSetDone } : item
          )
        );
        setFilteredHarvestData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, done: newSetDone } : item
          )
        );
        setResponseMessage(
          `( ${currentHarvest.id} ${currentHarvest.name} ) ${result.message}`
        );
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError("Error oppdatering av høstestatus:" + err.message);
      } else {
        setError("Ukjent error ved oppdatering av høstestatus");
      }
    }
  };

  const displayAdressFilter = () => {
    return (
      <Stack direction="row" spacing={1}>
        {Object.keys(address).map((key, i) => {
          const displayAdress = address[key as keyof typeof address];

          return (
            <Chip
              color={activeAdress === displayAdress ? "secondary" : "primary"}
              variant="filled"
              size="medium"
              key={key}
              onClick={() => {
                setActiveAdress(
                  activeAdress === displayAdress ? address.alle : displayAdress
                );
                setActivePosition("");
              }}
              label={displayAdress}
              clickable
            />
          );
        })}
      </Stack>
    );
  };

  const displaypositionFilter = () => {
    return (
      <Stack direction="row" spacing={0.5}>
        {positionsFilter.map((tab, i) => {
          let uniqeKey = "adress-" + tab;
          uniqeKey = uniqeKey.replace(/\s+/g, "");

          return (
            <Chip
              color={activePosition === tab ? "secondary" : "primary"}
              variant={activePosition === tab ? "filled" : "outlined"}
              size="small"
              key={uniqeKey}
              onClick={() =>
                setActivePosition(activePosition === tab ? "" : tab)
              }
              label={tab}
              clickable
            />
          );
        })}
      </Stack>
    );
  };

  const displayHarvest = () => {
    if (filteredHarvestData.length === 0) {
      return <em>Ingen data for uke: {week}</em>;
    } else {
      return (
        <Stack spacing={1} marginBottom={20}>
          <HarvestTableGroup
            harvestData={filteredHarvestData}
            plantData={plantData}
            showPlantInfoId={showPlantInfoId}
            handleHarvestToggle={handleHarvestToggle}
            setShowPlantInfoId={setShowPlantInfoId}
          />
        </Stack>
      );
    }
  };

  return (
    <>
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        direction="row"
        spacing={2}
        margin={1}
        useFlexGap
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {displayAdressFilter()}
        {displaypositionFilter()}
        {
          <Chip
            color={harvestablesOnly ? "secondary" : "primary"}
            variant="outlined"
            size="small"
            onClick={() =>
              setHarvestablesOnly(harvestablesOnly === true ? false : true)
            }
            label={harvestablesOnly ? "Kun ikke høstet" : "Viser alle"}
            clickable
          />
        }
      </Stack>

      {error ? (
        <AppBar position="sticky" color="error" sx={{ marginBottom: "10px" }}>
          <Toolbar variant="dense">{error}</Toolbar>
        </AppBar>
      ) : null}

      {responseMessage ? (
        <AppBar position="sticky" color="success" sx={{ marginBottom: "10px" }}>
          <Toolbar variant="dense">{responseMessage}</Toolbar>
        </AppBar>
      ) : null}

      {loading ? (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Stack>
      ) : (
        <Stack direction="column" spacing={2}>
          {showPlantInfoId > 0 ? (
            <PlantInfo
              id={showPlantInfoId}
              setShowPlantInfoId={setShowPlantInfoId}
              plantData={plantData}
            />
          ) : null}
          {displayHarvest()}
        </Stack>
      )}
    </>
  );
};

export default HarvestView;
