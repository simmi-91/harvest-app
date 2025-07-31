import React, { useState } from "react";
import { Box, Tabs, Tab, Menu, MenuItem } from "@mui/material";
import { mainmenu } from "../App";

type NavProps = {
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  activeSubTab: string | null;
  setActiveSubTab: (activeSubTab: string | null) => void;
};

const Navigation = ({
  activeTab,
  setActiveTab,
  activeSubTab,
  setActiveSubTab,
}: NavProps) => {
  const [submenuAnchor, setSubmenuAnchor] = useState<null | HTMLElement>(null);
  const [submenuTab, setSubmenuTab] = useState<string | null>(null);
  const open = Boolean(submenuAnchor);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const menuKey = Object.keys(mainmenu).find(
      (key) => mainmenu[key as keyof typeof mainmenu].main === newValue
    );

    if (menuKey) {
      const menuItem = mainmenu[menuKey as keyof typeof mainmenu];
      if (menuItem.sub !== null) {
        return;
      } else {
        setActiveTab(newValue);
        setActiveSubTab(null);
      }
    }
  };

  const activateSubmenu = (event: React.SyntheticEvent, tabValue: string) => {
    setSubmenuAnchor(event.currentTarget as HTMLElement);
    setSubmenuTab(tabValue);
  };

  const handleClose = () => {
    setSubmenuAnchor(null);
    setSubmenuTab(null);
  };

  const handleMenuItemClick = (value: string) => {
    setActiveTab("rediger");
    setActiveSubTab(value);
    handleClose();
  };

  const renderSubmenu = () => {
    if (!submenuTab) return null;

    const menuKey = Object.keys(mainmenu).find(
      (key) => mainmenu[key as keyof typeof mainmenu].main === submenuTab
    );

    if (!menuKey) return null;

    const menuItem = mainmenu[menuKey as keyof typeof mainmenu];
    if (menuItem.sub === null) return null;

    return (
      <Menu
        aria-label="Sub menu"
        anchorEl={submenuAnchor}
        open={open}
        onClose={handleClose}
      >
        {Object.values(menuItem.sub).map((subItem: string) => (
          <MenuItem key={subItem} onClick={() => handleMenuItemClick(subItem)}>
            {subItem}
          </MenuItem>
        ))}
      </Menu>
    );
  };

  return (
    <>
      <Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Main menu"
          variant="fullWidth"
        >
          {Object.keys(mainmenu).map((key: string, idx: number) => {
            const menuItem = mainmenu[key as keyof typeof mainmenu];
            return (
              <Tab
                key={key}
                label={menuItem.main}
                value={menuItem.main}
                {...a11yProps(idx)}
                {...(menuItem.sub !== null
                  ? {
                      onClick: (event: React.SyntheticEvent) =>
                        activateSubmenu(event, menuItem.main),
                    }
                  : {})}
              />
            );
          })}
        </Tabs>

        {renderSubmenu()}
      </Box>
    </>
  );
};
export default Navigation;
