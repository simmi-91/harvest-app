import { useState } from "react";
import "./App.css";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import HarvestOverview from "./components/HarvestOverview";
import InsertHarvest from "./components/NewData/InsertHarvest";

import EditPlant from "./components/EditData/EditPlant";
import EditHarvest from "./components/EditData/EditHarvest";
import EditReplacements from "./components/EditData/EditReplacements";

import { ThemeProvider } from '@mui/material/styles';
import gardenTheme from '../theme';

function App() {
  const [activeTab, setActiveTab] = useState("harvest");
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleChange = (event, newValue) => {
    if (newValue !== "edit") {
      setActiveTab(newValue);
      setActiveSubTab(null);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value) => {
    setActiveTab("edit");
    setActiveSubTab(value);
    handleClose();
  };

  return (
    <>
      <ThemeProvider theme={gardenTheme}>
      </ThemeProvider>

      <div className="flex-col fill-mobile">
        <Tabs
          value={activeTab}
          onChange={handleChange}
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab value="harvest" label="Høste" />
          <Tab value="insert" label="Ny data" />
          <Tab
            value="edit"
            label="Endre"
            onClick={handleClick}
          />
        </Tabs>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleMenuItemClick("editharvest")}>Høstedata</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("editplants")}>Plante data - TODO</MenuItem>
          <MenuItem onClick={() => handleMenuItemClick("editregex")}>Regex for PDF formatering - TODO</MenuItem>
        </Menu>

        {activeTab === "harvest" ? (
          <>
            <HarvestOverview />
          </>
        ) : activeTab === "insert" ? (
          <>
            <InsertHarvest />
          </>
        ) : activeTab === "edit" && activeSubTab === "editharvest" ? (
          <>
            <EditHarvest />
          </>
        ) : activeTab === "edit" && activeSubTab === "editplants" ? (
          <>
            <EditPlant />
          </>
        ) : activeTab === "edit" && activeSubTab === "editregex" ? (
          <>
            <EditReplacements />
          </>
        ) : null}
      </div>

    </>
  );
}
export default App;
