import { useEffect, useState, Fragment } from "react";
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { CircularProgress, AppBar, Toolbar } from "@mui/material";


import { HarvestTableGroup, FixedTableFooter } from "./HarvestTable";
import { harvestApi } from "../Utils/Paths";

const HarvestView = ({ harvestData, week, year, adressPositions }) => {
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState(false);
  const [error, setError] = useState(false);

  const [activeAdress, setActiveAdress] = useState("Alle");
  const [activePosition, setActivePosition] = useState("");
  const positions = adressPositions[activeAdress] || [];

  const [harvestablesOnly, setHarvestablesOnly] = useState(false);

  const [filteredData, setFilteredData] = useState([...harvestData]);

  useEffect(() => {
    const filteredData = harvestData
      .slice()
      .sort((a, b) => {
        if (a.plot_order !== b.plot_order) {
          return a.plot_order - b.plot_order;
        }
        return a.name.localeCompare(b.name);
      })
      .filter(item => {
        return (
          item.week.toString()?.includes(week.toString()) &&
          item.year.toString()?.includes(year.toString()) &&
          (activeAdress === "Alle" || item.full_location?.includes(activeAdress)) &&
          (!activePosition || item.full_location?.includes(activePosition)) &&
          (!harvestablesOnly || item.done.toString() === "0")
        );
      });
    setFilteredData(filteredData);

    setLoading(false);

  }, [activeAdress, activePosition, harvestablesOnly, harvestData]);

  const handleHarvestToggle = async (id) => {
    console.log('handleHarvestToggle ', id);
    try {
      const currentHarvest = filteredData.find((item) => item.id === id);
      if (!currentHarvest) {
        throw new Error("Harvest data not found");
      }
      // Ensure done is compared as string
      const newIsHarvested = currentHarvest.done === "0";

      console.log('currentHarvest ', currentHarvest.done, newIsHarvested);
      console.log('newIsHarvested ', newIsHarvested, newIsHarvested ? "1" : "0");

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
        setError("Failed to update harvest status");
        throw new Error("Failed to update harvest status");
      }
      const result = await response.json();
      console.log('result:', result);

      if (result.success) {
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, done: newIsHarvested ? "1" : "0" } : item
          )
        );

        if (result.message && result.message.includes("[Demo]")) {
          alert(result.message);
        }
      } else {
        setError(result.message);
        throw new Error(result.message);
      }
    } catch (err) {
      setError("Error updating harvest status:", err);
      console.error("Error updating harvest status:", err);
    }
  };

  function displayAdressFilter() {
    return (
      <Stack
        direction="row"
        spacing={1}
        margin={1}
      >
        {
          Object.keys(adressPositions).map((adress, i) => {
            let uniqeKey = 'adress-' + adress;
            uniqeKey = uniqeKey.replace(/\s+/g, '');
            return (
              <Chip
                color={activeAdress === adress ? 'secondary' : 'primary'}
                variant='filled'
                size="medium"
                key={uniqeKey}
                onClick={() => { setActiveAdress(activeAdress === adress ? 'Alle' : adress); setActivePosition("") }}
                label={adress}
                clickable
              />
            )
          })}
      </Stack>
    )
    /*
    <div key={uniqeKey}
      className={activeAdress === tab ? 'active main-tab tab' : 'main-tab tab'}
      onClick={() => { setActiveAdress(activeAdress === tab ? 'Alle' : tab); setActivePosition("") }}>
      {tab}
    </div>
    */
  }

  function displaypositionFilter() {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        margin={1.5}
        padding={1}
      >
        {positions.map((tab, i) => {
          let uniqeKey = 'adress-' + tab;
          uniqeKey = uniqeKey.replace(/\s+/g, '');

          return (
            <Chip
              color={activePosition === tab ? 'secondary' : 'primary'}
              variant={activePosition === tab ? 'filled' : 'outlined'}
              size="small"
              key={uniqeKey}
              onClick={() => setActivePosition(activePosition === tab ? '' : tab)}
              label={tab}
              clickable
            />
          )
        })}
      </Stack>
    )
  }

  function displayHarvest() {
    if (filteredData.length === 0) {
      return (
        <em>
          Ingen data for uke: {week}
        </em>
      )
    } else {
      return (
        <Stack
          spacing={1}
          marginBottom={20}
        >
          <HarvestTableGroup harvestData={filteredData} handleHarvestToggle={handleHarvestToggle} />
        </Stack>

      )
    }


  }

  return (
    <>
      <Stack
        divider={<Divider orientation="vertical" flexItem />}
        direction="row"
        spacing={2}
        margin={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap'
        }}
      >
        {displayAdressFilter()}
        {displaypositionFilter()}
        {
          <Chip
            color={harvestablesOnly ? 'secondary' : 'primary'}
            variant='outlined'
            size="small"
            onClick={() => setHarvestablesOnly(harvestablesOnly === true ? false : true)}
            label={harvestablesOnly ? 'Kun ikke høstet' : 'Viser alle'}
            clickable
          />
        }
      </Stack>

      <AppBar position="sticky">
        {error ? (<Toolbar>{error}</Toolbar>) : null}
        {responseMessage ? (<Toolbar>{responseMessage}</Toolbar>) : null}
      </AppBar>

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
      ) : displayHarvest()}


    </>
  );

};

export default HarvestView;