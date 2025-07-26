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

// Helper to split combined location strings, handling single-letter suffixes
function splitLocations(locationString) {
  // Replace ' og ' with ',' for uniform splitting
  const parts = locationString.replace(/\s+og\s+/g, ",").split(",");
  let lastPrefix = "";
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((loc) => {
      // If the location contains a space, update the prefix (e.g., 'Tak B')
      if (loc.includes(" ")) {
        lastPrefix = loc.split(" ")[0];
        return loc;
      }
      // If it's a single letter, prepend the last prefix
      if (loc.length === 1 && lastPrefix) {
        return `${lastPrefix} ${loc}`;
      }
      return loc;
    });
}

const HarvestOverview = () => {
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

  const fetchData = useCallback(async (week, year) => {
    setLoading(true);
    setError(null);
    setHarvestData([]);
    setAvailableLocations([]);
    setSelectedPlant(null);

    try {
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
          const plantsMap = new Map(
            plantsData.data.map((plant) => [
              plant.plant_id,
              {
                name: plant.name,
                latin: plant.latin,
                category: plant.category,
                variant: plant.variant,
                info: plant.harvest_info,
                tips: plant.use_tips,
              },
            ])
          );

          const enrichedHarvestData = data.data.map((item) => {
            const plantData = plantsMap.get(item.plant_id);
            return {
              ...item,
              isHarvested: item.done === "1",
              week: parseInt(currentWeek),
              year: parseInt(currentYear),
              plant: plantData ? plantData.name : "Ukjent plante",
              latin: plantData ? plantData.latin : null,
              variant: plantData ? plantData.variant : null,
              category: plantData ? plantData.category : null,
              info: plantData ? plantData.info : "Ingen instruksjoner tilgjengelig.",
              tips: plantData ? plantData.tips : "Ingen tips tilgjengelig.",
            };
          });

          setHarvestData(enrichedHarvestData);

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
  }, []);

  useEffect(() => {
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
          done: newIsHarvested ? "1" : "0",
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

  const currentWeeksData = harvestData
    .filter((item) => {
      if (selectedLocation === "Alle" || !selectedLocation) return true;
      const locations = splitLocations(item.position);
      return locations.includes(selectedLocation);
    })
    .sort((a, b) => a.position.localeCompare(b.position));

  return (
    <div className="">
      <HarvestWeek
        onFetchData={fetchData}
        currentWeek={currentWeek}
        currentYear={currentYear}
      />

      {loading ? (
        <>
          <LocationListSkeleton locations={allLocations} />
          <HarvestTableSkeleton />
          <HarvestDetailsSkeleton />
        </>
      ) : error ? (
        <div className="text-red" role="alert">
          <div className="" />
          <strong className="font-bold">Error: </strong>
          <span className="">{error}</span>
        </div>
      ) : (
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
