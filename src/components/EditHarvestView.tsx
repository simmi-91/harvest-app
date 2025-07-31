import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CircularProgress,
  TextField,
  Stack,
  Autocomplete,
  Button,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";

import { updateHarvestEntry, deleteHarvestEntry } from "../Utils/DataFetching";
import { TableHeader } from "./DisplayFormat/HarvestTable";
import JsonEditor from "./Edit/JsonEditor";

import { HarvestEntry, Event } from "../types";
import { address, addressPositions, type Address } from "../App";

type UpdatedFields = {
  [key: number]: {
    [key: string]: string;
  };
};

type EditHarvestViewProps = {
  harvestData: HarvestEntry[];
  week: number;
  year: number;
  searchPlant: string;
  setSearchPlant: (plant: string) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  triggerSearch: () => void;
};

const EditHarvestView = ({
  harvestData,
  week,
  year,
  searchPlant,
  setSearchPlant,
  searchLocation,
  setSearchLocation,
  triggerSearch,
}: EditHarvestViewProps) => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>();
  const [error, setError] = useState<string | null>();

  const { uniquePlants, uniquePositions } = useMemo(() => {
    const plants = [...new Set(harvestData.map((item) => item.name))];
    const positions = [
      ...new Set(Object.keys(addressPositions).filter((key) => key !== "Alle")),
      "Tom",
    ];
    return {
      uniquePlants: plants,
      uniquePositions: positions,
    };
  }, [harvestData]);

  const [filteredData, setFilteredData] = useState([...harvestData]);

  const [editJsonViewId, seteditJsonViewId] = useState<number>(0);
  const [updatedFields, setUpdatedFields] = useState<UpdatedFields>({});

  /*
  const filterHarvestData = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...harvestData];

      if (week && year) {
        filtered = filtered.filter(
          (item) =>
            item.week.toString()?.includes(week.toString()) &&
            item.year.toString()?.includes(year.toString())
        );
      }

      if (searchPlant) {
        filtered = filtered.filter((item) => item.name === searchPlant);
      }

      if (searchLocation) {
        if (searchLocation === "Tom") {
          filtered = filtered.filter((item) => item.full_location == null);
        } else {
          filtered = filtered.filter((item) =>
            item.full_location?.includes(searchLocation)
          );
        }
      }

      filtered = filtered.sort((a, b) => {
        if (a.plot_order !== b.plot_order) {
          return a.plot_order - b.plot_order;
        }
        return a.name.localeCompare(b.name);
      });

      setFilteredData(filtered);
      setLoading(false);
    }, 500);
  };*/
  const getFilteredData = useCallback(() => {
    let filtered = [...harvestData];

    if (week && year) {
      filtered = filtered.filter(
        (item) =>
          item.week.toString()?.includes(week.toString()) &&
          item.year.toString()?.includes(year.toString())
      );
    }

    if (searchPlant) {
      filtered = filtered.filter((item) => item.name === searchPlant);
    }

    if (searchLocation) {
      if (searchLocation === "Tom") {
        filtered = filtered.filter((item) => item.full_location == null);
      } else {
        filtered = filtered.filter((item) =>
          item.full_location?.includes(searchLocation)
        );
      }
    }

    return filtered.sort((a, b) => {
      if (a.plot_order !== b.plot_order) {
        return a.plot_order - b.plot_order;
      }
      return a.name.localeCompare(b.name);
    });
  }, [harvestData, week, year, searchPlant, searchLocation]);

  const filterHarvestData = useCallback(() => {
    setLoading(true);

    // Use setTimeout for debouncing, but make it shorter for better UX
    const timeoutId = setTimeout(() => {
      const filtered = getFilteredData();
      setFilteredData(filtered);
      setLoading(false);
    }, 500);

    // Cleanup function to cancel timeout if component unmounts or function is called again
    return () => clearTimeout(timeoutId);
  }, [getFilteredData]);

  // Initial filter on mount
  useEffect(() => {
    const filtered = getFilteredData();
    setFilteredData(filtered);
  }, [getFilteredData]);

  // Trigger search with cleanup
  useEffect(() => {
    const cleanup = filterHarvestData();
    return cleanup;
  }, [triggerSearch, filterHarvestData]);

  const handleUpdateField = useCallback((e: Event, id: number) => {
    const { name, value } = e.target;
    setUpdatedFields((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [name]: value,
      },
    }));
  }, []);

  const handleJSONupdate = useCallback(
    (id: number, json: {}) => {
      const newFields: UpdatedFields = {
        ...updatedFields,
        [id]: {
          ...updatedFields[id],
          location_json: JSON.stringify(json),
        },
      };

      setUpdatedFields(newFields);
      handleSaveHarvestData(id, newFields);
    },
    [updatedFields]
  );

  const toggleEditView = useCallback((harvestItem: HarvestEntry) => {
    seteditJsonViewId((prevId) =>
      prevId === harvestItem.id ? 0 : harvestItem.id
    );
  }, []);

  const handleSaveHarvestData = useCallback(
    async (id: number, fields = updatedFields) => {
      setResponseMessage(null);
      setError(null);

      if (!fields[id]) {
        setResponseMessage("Ingen oppdaterte felt for id:" + id);
        return;
      }

      setResponseMessage("Oppdaterer id:" + id + "...");
      try {
        const result = await updateHarvestEntry(id, fields[id]);
        if (result.success) {
          setResponseMessage("(id:" + id + ") " + result.message);
          setFilteredData((prevData) =>
            prevData.map((item) =>
              item.id === id ? { ...item, ...fields[id] } : item
            )
          );
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ukjent error ved oppdatering av høstedata");
        }
      } finally {
        setUpdatedFields({});
      }
    },
    [updatedFields]
  );

  const removeHarvestEntry = useCallback(async (id: number) => {
    setResponseMessage(null);
    setError(null);

    if (!id) {
      setError("Mangler id for å slette");
      return;
    }

    try {
      const result = await deleteHarvestEntry(id);
      if (result.success) {
        setResponseMessage("(id:" + id + ") " + result.message);
        setFilteredData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, name: item.name + " - deleted" } : item
          )
        );
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent error ved oppdatering av høstedata");
      }
    } finally {
      setUpdatedFields({});
    }
  }, []);

  const SearchControls = useMemo(
    () => (
      <Stack
        id="searchbar"
        direction="row"
        spacing={1}
        margin={1}
        useFlexGap
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Autocomplete
          value={searchPlant}
          onChange={(event, newValue) => {
            setSearchPlant(newValue ?? "");
          }}
          options={uniquePlants}
          renderInput={(params) => (
            <TextField {...params} label="Plante" size="small" />
          )}
          style={{ width: 200 }}
        />

        <Autocomplete
          value={searchLocation}
          onChange={(event, newValue) => {
            setSearchLocation(newValue ?? "");
          }}
          options={uniquePositions}
          renderInput={(params) => (
            <TextField {...params} label="Plassering" size="small" />
          )}
          style={{ width: 200 }}
        />
      </Stack>
    ),
    [
      searchPlant,
      setSearchPlant,
      uniquePlants,
      searchLocation,
      setSearchLocation,
      uniquePositions,
    ]
  );

  return (
    <>
      {SearchControls}

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
          <em>Ingen data for uke: {week}</em>
        ) : (
          <>
            {error ? (
              <AppBar
                position="sticky"
                color="error"
                sx={{ marginBottom: "10px" }}
              >
                <Toolbar variant="dense">{error}</Toolbar>
              </AppBar>
            ) : null}

            {responseMessage ? (
              <AppBar
                position="sticky"
                color="success"
                sx={{ marginBottom: "10px" }}
              >
                <Toolbar variant="dense">{responseMessage}</Toolbar>
              </AppBar>
            ) : null}

            {filteredData.map((harvestItem, i) => (
              <Box key={harvestItem.id} width={"100%"}>
                {TableHeader([
                  {
                    key: harvestItem.id + "_" + 1,
                    text: (
                      <Button
                        onClick={() => removeHarvestEntry(harvestItem.id)}
                        size="medium"
                        variant="outlined"
                      >
                        Slett
                      </Button>
                    ),
                    align: "left",
                  },
                  {
                    key: harvestItem.id + "_" + 2,
                    text: "id:" + harvestItem.id,
                    align: "center",
                  },
                  {
                    key: harvestItem.id + "_" + 3,
                    text: harvestItem.name,
                    align: "center",
                  },
                  {
                    key: harvestItem.id + "_" + 4,
                    text: (
                      <Button
                        size="small"
                        sx={{ margin: "2px" }}
                        onClick={() => toggleEditView(harvestItem)}
                        variant={
                          editJsonViewId === harvestItem.id
                            ? "contained"
                            : "outlined"
                        }
                      >
                        {editJsonViewId === harvestItem.id
                          ? "Lukk JSON endring"
                          : "Endre plassering"}
                      </Button>
                    ),
                    align: "right",
                  },
                ])}

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
                    onChange={(e) => handleUpdateField(e, harvestItem.id)}
                    defaultValue={harvestItem.amount ?? ""}
                    sx={{ flexGrow: 1 }}
                  />

                  <TextField
                    variant="filled"
                    name="week"
                    label="Uke"
                    size="small"
                    type="text"
                    onChange={(e) => handleUpdateField(e, harvestItem.id)}
                    defaultValue={harvestItem.week ?? ""}
                    sx={{ width: "60px" }}
                  />

                  <Button
                    size="small"
                    sx={{ margin: "2px" }}
                    onClick={() => handleSaveHarvestData(harvestItem.id)}
                    variant="outlined"
                  >
                    Lagre
                  </Button>
                </Stack>

                {!harvestItem.location_json && harvestItem.position && (
                  <Stack
                    direction={"row"}
                    spacing={1}
                    sx={{
                      alignItems: "left",
                    }}
                  >
                    <b>Gammelt oppsett:</b>
                    <em>
                      {harvestItem.adress} // {harvestItem.position} //{" "}
                      {harvestItem.plot}
                    </em>
                  </Stack>
                )}

                {editJsonViewId === harvestItem.id ? (
                  <React.Suspense fallback={<CircularProgress />}>
                    <JsonEditor
                      harvestid={harvestItem.id}
                      harvestItem={harvestItem}
                      initialData={harvestItem.location_json || []}
                      handleJSONupdate={handleJSONupdate}
                      setResponseMessage={setResponseMessage}
                      addressPositions={addressPositions}
                    />
                  </React.Suspense>
                ) : (
                  <Stack direction="column">
                    {harvestItem.location_json && (
                      <pre style={{ whiteSpace: "pre-line" }}>
                        Plassering: {JSON.stringify(harvestItem.location_json)}
                      </pre>
                    )}
                  </Stack>
                )}
              </Box>
            ))}
          </>
        )}
      </Stack>
    </>
  );
};

export default EditHarvestView;
