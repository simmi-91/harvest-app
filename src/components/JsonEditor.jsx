import React, { useState } from "react";
import { Stack, Autocomplete, TextField, Button, Typography, Toolbar } from "@mui/material";

import { updateHarvestEntry } from "../Utils/DataFetching";

const JsonEditor = ({ harvestid, initialData, handleJSONupdate, setResponseMessage, adressPositions }) => {
  const uniqueAdresses = [
    ...new Set(Object.keys(adressPositions).filter(key => key !== "Alle"))
  ];

  const getInitialEntries = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === "object" && parsed !== null)
          return Object.entries(parsed).map(([key, value]) => ({ key, value }));
      } catch (e) {
        return [];
      }
    }
    if (typeof data === "object" && data !== null)
      return Object.entries(data).map(([key, value]) => ({ key, value }));
    return [];
  };

  const [entries, setEntries] = useState(getInitialEntries(initialData));

  const handleInputChange = (index, field, value) => {
    const updatedEntries = entries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setEntries(updatedEntries);
  };

  const addNewEntry = () => {
    setEntries([...entries, { plot: "", adress: "", position: "" }]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setEntries(getInitialEntries(initialData));
  };

  const saveJsonChanges = () => {
    const initialentries = getInitialEntries(initialData);

    if (JSON.stringify(initialentries) === JSON.stringify(entries)) {
      setResponseMessage("Ingen oppdatert JSON for id:" + harvestid);
      setTimeout(() => setResponseMessage(null), 5000);
      return;
    }

    handleJSONupdate(harvestid, entries);
  };

  return (
    <Stack id="edit-wrapper"
      direction="column"
      padding={1}
      sx={{
        justifyContent: "center",
        alignItems: "center",
        flexWrap: 'wrap',
        backgroundColor: 'rgba(240, 238, 226, 0.5)'
      }}
    >
      <Stack id="btnrow"
        direction="row"
        spacing={1}
        margin={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap',
        }}
      >
        <Button
          onClick={addNewEntry}
          size="medium"
          variant='contained'
        >
          Ny plassering
        </Button>

        <Button
          onClick={resetForm}
          size="medium"
          variant='contained'
        >
          Reset
        </Button>

        <Button
          onClick={saveJsonChanges}
          size="medium"
          variant='contained'
        >
          Lagre JSON
        </Button>

      </Stack>

      <Stack id="jsonedit"
        direction="row"
        spacing={3}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap',
        }}
      >

        {entries.map((entry, index) => (

          <Stack key={index}
            direction="column"
            spacing={1}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              flexWrap: 'wrap',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                width: 200
              }}
            >
              <Button
                onClick={() => removeEntry(entry.id)}
                size="medium"
                variant='outlined'
              >
                Slett
              </Button>
              <b>
                Plassering: {index + 1}
              </b>
              <b></b>
            </Stack>


            <Autocomplete
              value={entry.adress}
              onChange={(e, newValue) => {
                handleInputChange(index, "adress", newValue)
              }}
              options={uniqueAdresses}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Adresse"
                  size="small"
                />
              )}
              style={{ width: 200 }}
            />

            <Autocomplete
              value={entry.position}
              onChange={(e, newValue) => {
                handleInputChange(index, "position", newValue)
              }}
              options={adressPositions['Alle']}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Posisjon"
                  size="small"
                />
              )}
              style={{ width: 200 }}
            />

            <TextField
              value={entry.plot || ""}
              onChange={(e) => {
                handleInputChange(index, "plot", e.target.value)
              }}
              label="Kasse"
              size="small"
              style={{ width: 200 }}
            />

          </Stack>

        ))}

      </Stack>

      <Stack id="jsonpreview"
        direction="column"
        spacing={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap',
        }}
      >
        <pre>
          {JSON.stringify(
            entries,
            (key, value) => {
              if (value && typeof value === "object" && !Array.isArray(value)) {
                const ordered = {};

                ["adress", "position", "plot"].forEach(k => {
                  if (k in value) ordered[k] = value[k];
                });

                Object.keys(value).forEach(k => {
                  if (!["adress", "position", "plot"].includes(k)) {
                    ordered[k] = value[k];
                  }
                });
                return ordered;
              }
              return value;
            },
            4
          )}
        </pre>
      </Stack>

    </Stack>

  );
};

export default JsonEditor;
