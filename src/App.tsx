import React, { useState, useEffect } from "react";
import { CircularProgress, Stack } from "@mui/material";
import "./App.css";
import { getFormattedToday, getInitialWeekAndYear } from "./Utils/Week";
import { fetchPlants, fetchHarvestData } from "./Utils/DataFetching";
import { PlantEntry, HarvestEntry } from "./types";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HarvestView from "./components/HarvestView.js";
import EditHarvestView from "./components/EditHarvestView";
import AddNewHarvestView from "./components/AddNewHarvestView";

export const mainmenu = {
  harvest: {
    main: "høste",
    sub: null,
  },
  add: {
    main: "legg inn",
    sub: null,
  },
  edit: {
    main: "rediger",
    sub: {
      harvest: "høstedata",
      plants: "planter",
    },
  },
} as const;
//type Menutype = (typeof mainmenu)[keyof typeof mainmenu];

export const address = {
  ulvenPark: "Ulvenpark",
  ulvenT: "Ulven T",
  alle: "Alle",
} as const;
export type Address = (typeof address)[keyof typeof address];

export type AddressPositions = {
  [key: string]: string[];
};
export const addressPositions = {
  [address.ulvenPark]: ["B", "F", "L"],
  [address.ulvenT]: ["Tak", "Åker"],
  [address.alle]: ["B", "F", "L", "Tak", "Åker"],
} as const satisfies AddressPositions;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<string>(mainmenu.harvest.main);
  const [activeSubTab, setActiveSubTab] = useState<string | null>(
    mainmenu.harvest.sub
  );

  const [harvestData, setHarvestData] = useState<HarvestEntry[]>([]);
  const [plantData, setPlantsData] = useState<PlantEntry[]>([]);

  const strToday = getFormattedToday();
  const { week: initialWeek, year: initialYear } = getInitialWeekAndYear(true);
  const [currentWeek, setCurrentWeek] = useState<number>(initialWeek);
  const [currentYear, setCurrentYear] = useState<number>(initialYear);

  const [searchPlant, setSearchPlant] = useState<string>("");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [searchTrigger, setSearchTrigger] = useState<number>(0);

  const [manualHarvestTextInput, setManualHarvestTextInput] =
    useState<string>("");

  const triggerSearch = () => setSearchTrigger((prev) => prev + 1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [newPlants, newHarvests] = await Promise.all([
        fetchPlants(),
        fetchHarvestData(currentWeek, currentYear),
      ]);

      if (!newHarvests) {
        throw new Error("Fikk ikke ut høstedata");
      }

      const fixedHarvests = newHarvests
        .sort((a, b) => {
          if (a.week !== b.week) {
            return a.week - b.week;
          }
          if (a.plot_order !== b.plot_order) {
            return a.plot_order - b.plot_order;
          }
          return a.name.localeCompare(b.name);
        })
        .map((item) => {
          const strLocation = item.location_json;
          if (strLocation && typeof strLocation === "string") {
            try {
              const jsonLocation = JSON.parse(strLocation);
              return {
                ...item,
                location_json: jsonLocation,
              };
            } catch (error) {
              console.error("Error parsing location_json:", error);
              return {
                ...item,
                location_json: null,
              };
            }
          }
          return item;
        });

      setHarvestData(fixedHarvests);
      setPlantsData(newPlants);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent error ved henting av høstedata");
      }
    } finally {
      setLoading(false);
    }
  };

  const refetchPlants = async () => {
    setLoading(true);
    try {
      const [newPlants] = await Promise.all([fetchPlants()]);

      if (!newPlants) throw new Error("Fikk ikke ut plantedata");
      setPlantsData(newPlants);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent error ved henting av plantedata");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {};
  }, [currentWeek, currentYear]);

  useEffect(() => {
    //changes has been made - refetch data when navigating
    if (searchTrigger > 0) {
      loadData();
    }
    return () => {};
  }, [activeTab]);

  useEffect(() => {
    //console.log("manualHarvestTextInput", manualHarvestTextInput);
  }, [manualHarvestTextInput]);

  return (
    <Stack direction="column">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      <Header
        date={strToday}
        week={currentWeek}
        year={currentYear}
        blnIncrement={true}
        setCurrentWeek={setCurrentWeek}
        setCurrentYear={setCurrentYear}
        searchPlant={searchPlant}
        setSearchPlant={setSearchPlant}
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        triggerSearch={triggerSearch}
      />

      {error ? error : null}

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
        <>
          {activeTab === "høste" ? (
            <HarvestView
              harvestData={harvestData}
              plantData={plantData}
              week={currentWeek}
              year={currentYear}
              triggerSearch={triggerSearch}
            />
          ) : activeTab === "legg inn" ? (
            <AddNewHarvestView
              week={currentWeek}
              year={currentYear}
              plantData={plantData}
              manualHarvestTextInput={manualHarvestTextInput}
              setManualHarvestTextInput={setManualHarvestTextInput}
              refetchPlants={refetchPlants}
              triggerSearch={triggerSearch}
            />
          ) : activeTab === "rediger" && activeSubTab === "planter" ? (
            <>rediger planter - TODO</>
          ) : activeTab === "rediger" && activeSubTab === "høstedata" ? (
            <EditHarvestView
              harvestData={harvestData}
              week={currentWeek}
              year={currentYear}
              searchPlant={searchPlant}
              setSearchPlant={setSearchPlant}
              searchLocation={searchLocation}
              setSearchLocation={setSearchLocation}
              triggerSearch={triggerSearch}
            />
          ) : null}
        </>
      )}
    </Stack>
  );
}
export default App;
