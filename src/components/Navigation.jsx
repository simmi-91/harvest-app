import { useState } from "react";
import { Box, Tabs, Tab, Menu, MenuItem } from '@mui/material';

const Navigation = ({ mainmenu, submenu, activeTab, setActiveTab, activeSubTab, setActiveSubTab }) => {
  const [submenuAnchor, setSubmenuAnchor] = useState(null);
  const open = Boolean(submenuAnchor);

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  const handleTabChange = (event, newValue) => {
    if (newValue === 'rediger') {
    } else {
      setActiveTab(newValue);
      setActiveSubTab(null);
    }
  };

  const activateSubmenu = (event) => {
    setSubmenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setSubmenuAnchor(null);
  };

  const handleMenuItemClick = (value) => {
    setActiveTab('rediger');
    setActiveSubTab(value.tab);
    handleClose();
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
          {mainmenu.map((tab, idx) => (
            <Tab
              key={tab}
              label={tab}
              value={tab}
              {...a11yProps(idx)}
              {...(tab === 'rediger' ? { onClick: activateSubmenu } : {})}
            />
          ))}
        </Tabs>

        {
          submenu.length > 0 ? (
            <Menu
              aria-label="Sub menu"
              anchorEl={submenuAnchor}
              open={open}
              onClose={handleClose}
            >
              {
                submenu.map((tab, idx) => (
                  <MenuItem
                    key={tab}
                    onClick={() => handleMenuItemClick({ tab })}>
                    {tab}
                  </MenuItem>
                ))
              }
            </Menu>
          ) : null
        }
      </Box>

    </>
  );
};
export default Navigation;

/*
          <button key={'main-' + tab}
            className={activeTab === tab ? 'active main-tab tab' : 'main-tab tab'}
            onClick={() => setActiveTab(tab)}>
            <span className="focus">{tab}</span>
          </button>
*/
