import React, { useState, useEffect, useCallback } from "react";

import {
  HarvestWeek,
  HarvestWeekSkeleton,
  getWeekNumber,
} from "./Harvest/HarvestWeek";
import LocationList, { LocationListSkeleton } from "./Harvest/LocationList";
import HarvestTable, { HarvestTableSkeleton } from "./Harvest/HarvestTable";
import HarvestDetails, {
  HarvestDetailsSkeleton,
} from "./Harvest/HarvestDetails";
import { getInitialWeekAndYear } from "../Utils/Week";
import { plantApi, harvestApi } from "../Utils/Paths";

// Hovedkomponent for appen
const HarvestOverview = () => {
  /* @type {[HarvestData[], React.Dispatch<React.SetStateAction<HarvestData[]>>]} */
  const [harvestData, setHarvestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Get initial week and year using the utility function
  const { week: initialWeek, year: initialYear } = getInitialWeekAndYear(true);

  const [currentWeek, setCurrentWeek] = useState(initialWeek);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [availableLocations, setAvailableLocations] = useState([]);
  const allLocations = [
    "Tak B",
    "Tak F",
    "Tak L",
    "Tak Ulven T",
    "Åkeren på Ulven T",
    "Alle",
  ];

  // Funksjon for å hente data fra API-et
  // Bruk useCallback for å forhindre unødvendig re-rendering av HarvestWeek
  const fetchData = useCallback(async (week, year) => {
    setLoading(true);
    setError(null);
    setHarvestData([]); // Tøm data før ny lasting
    setAvailableLocations([]); // Tøm lokasjoner
    setSelectedPlant(null); // Tøm valgt plante

    try {
      // Oppdater state for uke og år som hentes
      setCurrentWeek(week);
      setCurrentYear(year);

      const response = await fetch(harvestApi() + `?week=${week}&year=${year}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();

      if (data.success) {
        const plantsResponse = await fetch(plantApi());
        if (!plantsResponse.ok) {
          throw new Error(
            `Failed to fetch plants: ${plantsResponse.status} ${plantsResponse.statusText}`
          );
        }
        const plantsData = await plantsResponse.json();
        if (plantsData.success) {
          // Create a map of plant_id to plant data
          const plantsMap = new Map(
            plantsData.data.map((plant) => [
              plant.plant_id,
              {
                name: plant.name,
                category: plant.category,
                info: plant.harvest_info,
                tips: plant.use_tips,
              },
            ])
          );

          const enrichedHarvestData = data.data.map((item) => {
            const plantData = plantsMap.get(item.plant_id);
            return {
              ...item,
              isHarvested: item.done === "1", // Convert done to boolean
              week: parseInt(currentWeek), // Ensure week is a number
              year: parseInt(currentYear), // Ensure year is a number
              plant: plantData ? plantData.name : "Ukjent plante",
              category: plantData ? plantData.category : null,
              info: plantData ? plantData.info : "Ingen instruksjoner tilgjengelig.",
              tips: plantData ? plantData.tips : "Ingen tips tilgjengelig.",
            };
          });

          //console.log("Enriched Data:", enrichedHarvestData);
          setHarvestData(enrichedHarvestData);

          // Finn unike lokasjoner
          const locations = [
            ...new Set(enrichedHarvestData.map((item) => item.position)),
          ];
          setAvailableLocations(locations);
        } else {
          throw new Error(plantsData.message);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Tom dependency array betyr at denne funksjonen bare opprettes én gang

  useEffect(() => {
    // Last inn dagens uke/år automatisk ved første oppstart
    fetchData(initialWeek, initialYear);
  }, [fetchData, initialWeek, initialYear]);

  const handleHarvestToggle = async (id) => {
    try {
      const currentHarvest = harvestData.find((item) => item.id === id);
      if (!currentHarvest) {
        throw new Error("Harvest data not found");
      }
      const newIsHarvested = !currentHarvest.isHarvested;

      const response = await fetch(harvestApi(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          done: newIsHarvested ? "1" : "0", // Convert boolean to "1" or "0"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update harvest status");
      }
      const result = await response.json();
      if (result.success) {
        setHarvestData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, isHarvested: newIsHarvested } : item
          )
        );
        if (result.message && result.message.includes("[Demo]")) {
          alert(result.message);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error updating harvest status:", err);
    }
  };

  // Data som sendes til HarvestTable, filtrert på valgt lokasjon
  const currentWeeksData = harvestData.filter((item) => {
    return (
      selectedLocation === "Alle" || // Show all if "Alle" is selected
      !selectedLocation || // Show all if no location is selected
      item.position === selectedLocation
    ); // Show only matching location
  });

  return (
    <div className="">
      {/* HarvestWeek er alltid synlig for å endre ukenummer */}
      <HarvestWeek
        onFetchData={fetchData}
        currentWeek={currentWeek}
        currentYear={currentYear}
      />

      {loading ? (
        // Vis skjelettkomponenter når loading er true
        <>
          <LocationListSkeleton locations={allLocations} />
          <HarvestTableSkeleton />
          <HarvestDetailsSkeleton />
        </>
      ) : error ? (
        // Vis feilmelding når det er en feil
        <div className="text-red" role="alert">
          <div className="" />
          <strong className="font-bold">Error: </strong>
          <span className="">{error}</span>
        </div>
      ) : (
        // Vis faktiske komponenter når data er lastet og ingen feil
        <>
          <LocationList
            locations={allLocations}
            activeLocations={availableLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
          {currentWeeksData.length > 0 ? (
            <HarvestTable
              harvestData={currentWeeksData}
              onHarvestToggle={handleHarvestToggle}
              selectedPlant={selectedPlant}
              onPlantSelect={setSelectedPlant}
            />
          ) : (
            <div className="">
              Ingen høstedata tilgjengelig for valgt uke/lokasjon
            </div>
          )}
          <HarvestDetails
            harvestData={harvestData}
            selectedPlant={selectedPlant}
          />
        </>
      )}
    </div>
  );
};

export default HarvestOverview;
