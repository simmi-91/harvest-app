import React, { useState, useEffect } from "react";
import {
  Stack,
  Autocomplete,
  TextField,
  Button,
  Typography,
  Toolbar,
} from "@mui/material";

import { HarvestEntry, AdressEntry, LocationEntry } from "../../types";

type EditorProps = {
  harvestid: number;
  harvestItem: HarvestEntry;
  initialData: LocationEntry[];
  handleJSONupdate: (id: number, json: {}) => void;
  setResponseMessage: (msg: string | null) => void;
  addressPositions: AdressEntry;
};

const JsonEditor = ({
  harvestid,
  harvestItem,
  initialData,
  handleJSONupdate,
  setResponseMessage,
  addressPositions,
}: EditorProps) => {
  const uniqueAddresses = [
    ...new Set(Object.keys(addressPositions).filter((key) => key !== "Alle")),
  ];
  const allPositions = [...new Set(addressPositions["Alle"])];

  const getInitialEntries = (
    data: LocationEntry[] | string
  ): LocationEntry[] => {
    try {
      if (Array.isArray(data)) {
        return data;
      }
      if (typeof data === "string" && data.trim() !== "") {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(
        "Invalid location_json, falling back to default",
        error,
        data
      );
    }
    return [{ plot: "", adress: "", position: "" }];
  };

  const [entries, setEntries] = useState<LocationEntry[]>(
    getInitialEntries(initialData)
  );

  /* // støtte for gammelt oppsett //
  useEffect(() => {
    if (entries[0]?.adress === "" && entries[0]?.position === "") {
      setEntries(useOldData());
    }
  }, [entries]);

  const useOldData = (): LocationEntry[] => {
    let jsonObj = { plot: "", adress: "", position: "" };

    if (harvestItem.adress) {
      const validPositions: string[] =
        addressPositions[harvestItem.adress] ?? [];
      jsonObj.adress = harvestItem.adress;

      if (harvestItem.position) {
        jsonObj.position = findClosestPosition(
          harvestItem.position,
          validPositions
        );
      }
      if (harvestItem.plot) {
        jsonObj.plot =
          harvestItem.plot.toString() === "0" ? "" : harvestItem.plot;
      }
    }
    return [jsonObj];
  };
  */

  const handleInputChange = (
    index: number,
    field: string,
    value: string | null
  ) => {
    const updatedEntries = entries.map((entry, i) =>
      i === index ? { ...entry, [field]: value ?? "" } : entry
    );
    setEntries(updatedEntries);
  };

  const addNewEntry = () => {
    setEntries([...entries, { plot: "", adress: "", position: "" }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setEntries(getInitialEntries(initialData));
  };

  const saveJsonChanges = () => {
    const initialentries = getInitialEntries(initialData);

    console.log(JSON.stringify(initialentries), JSON.stringify(entries));
    if (JSON.stringify(initialentries) === JSON.stringify(entries)) {
      setResponseMessage("Ingen oppdatert JSON for id:" + harvestid);
      setTimeout(() => setResponseMessage(null), 5000);
      return;
    }

    handleJSONupdate(harvestid, entries);
  };

  return (
    <Stack
      id="edit-wrapper"
      direction="column"
      padding={1}
      useFlexGap
      sx={{
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        backgroundColor: "rgba(240, 238, 226, 0.5)",
      }}
    >
      <Stack
        id="btnrow"
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
        <Button onClick={addNewEntry} size="medium" variant="contained">
          Ny plassering
        </Button>

        <Button onClick={resetForm} size="medium" variant="contained">
          Reset
        </Button>

        <Button onClick={saveJsonChanges} size="medium" variant="contained">
          Lagre JSON
        </Button>
      </Stack>

      <Stack
        id="jsonedit"
        direction="row"
        spacing={3}
        useFlexGap
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {entries.map((entry, index) => (
          <Stack
            key={index}
            direction="column"
            spacing={1}
            useFlexGap
            sx={{
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                width: 200,
              }}
            >
              <Button
                onClick={() => removeEntry(index)}
                size="medium"
                variant="outlined"
              >
                Slett
              </Button>
              <b>Plassering: {index + 1}</b>
              <b></b>
            </Stack>

            <Autocomplete
              value={entry.adress || ""}
              onChange={(e, newValue) => {
                handleInputChange(index, "adress", newValue);
              }}
              options={uniqueAddresses}
              renderInput={(params) => (
                <TextField {...params} label="Adresse" size="small" />
              )}
              style={{ width: 200 }}
            />

            <Autocomplete
              value={entry.position || ""}
              onChange={(e, newValue) => {
                handleInputChange(index, "position", newValue);
              }}
              options={allPositions}
              renderInput={(params) => (
                <TextField {...params} label="Posisjon" size="small" />
              )}
              style={{ width: 200 }}
            />

            <TextField
              value={entry.plot || ""}
              onChange={(e) => {
                handleInputChange(index, "plot", e.target.value);
              }}
              label="Kasse"
              size="small"
              style={{ width: 200 }}
            />
          </Stack>
        ))}
      </Stack>

      <Stack
        id="jsonpreview"
        direction="column"
        spacing={1}
        useFlexGap
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <pre>
          {JSON.stringify(
            entries,
            [
              "adress",
              "position",
              "plot",
              ...Object.keys(entries[0] || {}).filter(
                (k) => !["adress", "position", "plot"].includes(k)
              ),
            ],
            4
          )}
        </pre>
      </Stack>
    </Stack>
  );
};

export default JsonEditor;
