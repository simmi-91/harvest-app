import { useState, useEffect } from "react";
import { CircularProgress, Stack } from "@mui/material";
import "./App.css";

import { getWeekNumber, getFormattedToday, getInitialWeekAndYear } from "./Utils/Week";
import { fetchPlants, fetchHarvestData } from "./Utils/DataFetching";

import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HarvestView from "./components/HarvestView";
import EditHarvestView from "./components/EditHarvestView";
import AddNewHarvest from "./components/AddNewHarvest";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mainmenu = ['høste', 'legg inn', 'rediger'];
  const submenu = ['høstedata', 'planter'];
  const [activeTab, setActiveTab] = useState(mainmenu[0]);
  const [activeSubTab, setActiveSubTab] = useState('');

  const [harvestData, setHarvestData] = useState([]);
  const [plantData, setPlantsData] = useState([]);

  const strToday = getFormattedToday();
  const { week: initialWeek, year: initialYear } = getInitialWeekAndYear(true);
  const [currentWeek, setCurrentWeek] = useState(initialWeek);
  const [currentYear, setCurrentYear] = useState(initialYear);

  const adressPositions = {
    "Ulvenpark": ['B', 'F', 'L'],
    "Ulven T": ['Tak', 'Åker'],
    "Alle": ['B', 'F', 'L', 'Tak', 'Åker']
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [newPlants, newHarvests] = await Promise.all([
        fetchPlants(),
        fetchHarvestData()
      ]);

      newHarvests
        .sort((a, b) => {
          if (a.week !== b.week) {
            return a.week - b.week;
          }
          if (a.plot_order !== b.plot_order) {
            return a.plot_order - b.plot_order;
          }
          return a.name.localeCompare(b.name);
        })
        .map(item => {
          if (item.full_location) {
            // eksempel: [Ulvenpark|F|12-14],[Ulvenpark|L|49+50],[Ulven T|Åker]
            const locArray = item.full_location.match(/\[[^\]]*\]/g) || [];
            item.locationArray = locArray;
          }
        });

      setPlantsData(newPlants);
      setHarvestData(newHarvests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentWeek, currentYear]);

  return (
    <>
      <Stack direction="column">

        <Navigation
          mainmenu={mainmenu} submenu={submenu}
          activeTab={activeTab} setActiveTab={setActiveTab}
          activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
        />

        <Header
          date={strToday}
          week={currentWeek}
          year={currentYear}
          blnIncrement={true}
          setCurrentWeek={setCurrentWeek}
          setCurrentYear={setCurrentYear}
        />

        {error ? (error) : null}

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
        ) :
          <>
            {activeTab === "høste" ? (
              <HarvestView
                harvestData={harvestData}
                week={currentWeek}
                year={currentYear}
                adressPositions={adressPositions}
              />
            ) : activeTab === "legg inn" ? (
              <AddNewHarvest />
            ) : activeTab === "rediger" && activeSubTab === "planter" ? (
              <>rediger planter - TODO</>
            ) : activeTab === "rediger" && activeSubTab === "høstedata" ? (
              <EditHarvestView
                harvestData={harvestData}
                week={currentWeek}
                year={currentYear}
                adressPositions={adressPositions}
              />
            ) : null}
          </>
        }

      </Stack>

    </>
  );
}
export default App;
