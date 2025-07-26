import React from "react";
import { useState, useEffect } from "react";
import { CircularProgress, TextField, Stack, Autocomplete, Button, Box, AppBar, Toolbar } from "@mui/material";

import { updateHarvestEntry, deleteHarvestEntry } from "../Utils/DataFetching";
import { HarvestEditTableGroup, FixedTableFooter, TableHeader } from "./HarvestTable";
import JsonEditor from "./JsonEditor";

const EditHarvestView = ({ harvestData, week, year, adressPositions }) => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState(false);
  const [error, setError] = useState(false);

  const uniquePlants = [...new Set(harvestData.map(item => item.name))];
  const uniquePossitions = [
    ...new Set(Object.keys(adressPositions).filter(key => key !== "Alle")),
    "Tom"
  ];

  const [searchLocation, setSearchLocation] = useState('');
  const [searchPlant, setSearchPlant] = useState('');

  const [filteredData, setFilteredData] = useState([...harvestData]);

  const [editJsonView, setEditJsonView] = useState('');
  const [updatedFields, setUpdatedFields] = useState({});

  useEffect(() => {
    const filteredData = harvestData
      .slice()
      .sort((a, b) => {
        if (a.week !== b.week) {
          return a.week - b.week;
        }
        if (a.plot_order !== b.plot_order) {
          return a.plot_order - b.plot_order;
        }
        return a.name.localeCompare(b.name);
      })
      .filter(item => {
        return (
          item.week.toString()?.includes(week.toString()) &&
          item.year.toString()?.includes(year.toString())
        );
      });

    setFilteredData(filteredData);
  }, []);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...harvestData];

      if (week && year) {
        filtered = filtered.filter(item =>
          item.week.toString()?.includes(week.toString()) &&
          item.year.toString()?.includes(year.toString())
        );
      }

      if (searchPlant) {
        filtered = filtered.filter(item => item.name === searchPlant);
      }

      if (searchLocation) {
        if (searchLocation === "Tom") {
          filtered = filtered.filter(item => item.full_location == null);
        } else {
          filtered = filtered.filter(item =>
            item.full_location?.includes(searchLocation)
          );
        }
      }

      filtered = filtered
        .sort((a, b) => {
          if (a.plot_order !== b.plot_order) {
            return a.plot_order - b.plot_order;
          }
          return a.name.localeCompare(b.name);
        });

      setFilteredData(filtered);
      setLoading(false);
    }, 500);
  };

  const handleUpdateField = (e, id) => {
    const { name, value } = e.target;
    setUpdatedFields(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [name]: value
      }
    }));
  };

  const handleJSONupdate = (id, json) => {
    const newFields = {
      ...updatedFields,
      [id]: {
        ...updatedFields[id],
        location_json: JSON.stringify(json)
      }
    };

    console.log('json', newFields);
    setUpdatedFields(newFields);
    handleSaveHarvestData(id, newFields);
  };

  const toggleEditView = (harvestItem) => {
    if (editJsonView === harvestItem.id) {
      setEditJsonView(0);
    } else {
      setEditJsonView(harvestItem.id);
    }
  };

  const handleSaveHarvestData = async (id, fields = updatedFields) => {
    console.log('handleSaveHarvestData', id, fields);

    if (!fields[id]) {
      setResponseMessage("Ingen oppdaterte felt for id:" + id);
      //setTimeout(() => setResponseMessage(null), 5000);
      return;
    }

    try {
      setResponseMessage("Oppdaterer id:" + id + "...");
      const result = await updateHarvestEntry(id, fields[id]);
      setFilteredData(prevData =>
        prevData.map(item =>
          item.id === id ? { ...item, ...fields[id] } : item
        )
      );
      setResponseMessage("(id:" + id + ") " + result.message);
      //setTimeout(() => setResponseMessage(null), 5000);
    } catch (err) {
      setError(err.message);
      //setTimeout(() => setResponseMessage(null), 5000);
    } finally {
      //setLoading(false);
      setUpdatedFields({});
    }

  };

  const removeHarvestEntry = async (id) => {
    if (!id) {
      setResponseMessage("Mangler id");
      //setTimeout(() => setResponseMessage(null), 5000);
      return;
    }

    try {
      const result = await deleteHarvestEntry(id);

      setFilteredData(prevData => prevData.filter(item => item.id !== id));

      setResponseMessage("(id:" + id + ") " + result.message);
      //setTimeout(() => setResponseMessage(null), 5000);
    } catch (err) {
      setError(err.message);
      //setTimeout(() => setResponseMessage(null), 5000);
    } finally {
      //setLoading(false);
      setUpdatedFields({});
    }

  };

  return (
    <>
      <Stack id="searchbar"
        direction="row"
        spacing={1}
        margin={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap'
        }}
      >
        <Autocomplete
          value={searchPlant}
          onChange={(event, newValue) => {
            setSearchPlant(newValue);
          }}
          options={uniquePlants}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Plante"
              size="small"
            />
          )}
          style={{ width: 200 }}
        />

        <Autocomplete
          value={searchLocation}
          onChange={(event, newValue) => {
            setSearchLocation(newValue);
          }}
          options={uniquePossitions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Plassering"
              size="small"
            />
          )}
          style={{ width: 200 }}
        />

        <Button onClick={() => handleSearch()} size="medium" variant='contained'>Søk</Button>

      </Stack>

      <Stack
        spacing={2}
        marginBottom={20}
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >

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
        ) : null}

        {filteredData.length === 0 ? (
          <em>
            Ingen data for uke: {week}
          </em>
        ) : (
          <>
            <AppBar position="sticky">
              {error ? (<Toolbar>{error}</Toolbar>) : null}
              {responseMessage ? (<Toolbar>{responseMessage}</Toolbar>) : null}
            </AppBar>

            {
              filteredData.map((harvestItem, i) => (

                <Box key={harvestItem.id}
                  width={'100%'}
                >

                  <TableHeader columns={[
                    {
                      key: harvestItem.id + '_' + 1,
                      text: (
                        <Button
                          onClick={() => removeHarvestEntry(harvestItem.id)}
                          size="medium"
                          variant='outlined'
                        >
                          Slett
                        </Button>
                      ),
                      align: 'left'
                    },
                    {
                      key: harvestItem.id + '_' + 2,
                      text: harvestItem.id,
                      align: 'center'
                    },
                    {
                      key: harvestItem.id + '_' + 3,
                      text: harvestItem.name,
                      align: 'center'
                    },
                    {
                      key: harvestItem.id + '_' + 4,
                      text: (
                        <Button
                          size="small"
                          sx={{ margin: '2px' }}
                          onClick={() => (toggleEditView(harvestItem))}
                          variant={editJsonView === harvestItem.id ? 'contained' : 'outlined'}>
                          {editJsonView === harvestItem.id ? 'Lukk JSON endring' : 'Endre plassering'}
                        </Button>
                      ),
                      align: 'right'
                    }
                  ]} />

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >

                    <TextField
                      variant="filled"
                      name="amount"
                      label="Mengde"
                      size="small"
                      type="text"
                      onChange={e => handleUpdateField(e, harvestItem.id)}
                      defaultValue={harvestItem.amount ?? ''}
                      sx={{ flexGrow: 1 }}
                    />

                    <TextField
                      variant="filled"
                      name="amount"
                      label="Uke"
                      size="small"
                      type="text"
                      onChange={e => handleUpdateField(e, harvestItem.id)}
                      defaultValue={harvestItem.week ?? ''}
                    />

                    <Button
                      size="small"
                      sx={{ margin: '2px' }}
                      onClick={() => (handleSaveHarvestData(harvestItem.id))}
                      variant='outlined'>
                      Lagre
                    </Button>

                  </Stack>


                  {editJsonView === harvestItem.id
                    ? (
                      <>
                        {harvestItem.location_json ?
                          <JsonEditor
                            harvestid={harvestItem.id}
                            initialData={harvestItem.location_json}
                            handleJSONupdate={handleJSONupdate}
                            setResponseMessage={setResponseMessage}
                            adressPositions={adressPositions}
                          />
                          : "ingen json"}

                      </>
                    )
                    : (
                      <Stack direction="column">
                        <pre style={{ whiteSpace: 'pre-line' }}>Plassering: {harvestItem.location_json}</pre>
                      </Stack>
                    )
                  }
                </Box>
              ))
            }
          </>
        )}

      </Stack >

    </>
  )
};

export default EditHarvestView;