import { useState } from "react";
import "./App.css";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import HarvestOverview from "./components/HarvestOverview";
import InsertHarvest from "./components/NewData/InsertHarvest";

function App() {
  const [activeTab, setActiveTab] = useState("harvest");

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <div className="flex-col fill-mobile">
        <Tabs
          value={activeTab}
          onChange={handleChange}
          indicatorColor=""
          textColor="inherit"
          variant="fullWidth"
        >
          <Tab value="harvest" label="Høste" />
          <Tab value="insert" label="Ny data" />
          <Tab value="plants" label="endre" />
        </Tabs>

        {activeTab === "harvest" ? (
          <>
            <HarvestOverview />
          </>
        ) : activeTab === "insert" ? (
          <>
            <InsertHarvest />
          </>
        ) : activeTab === "plants" ? (
          <>
            <em>ToDo...</em>
            <p>Endre plante data</p>
          </>
        ) : null}
      </div>
    </>
  );
}
export default App;
