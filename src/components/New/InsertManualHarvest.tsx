import React, { useEffect, useState } from "react";
import {
  Stack,
  Button,
  AppBar,
  Toolbar,
  Chip,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import { Event, NewHarvestEntry, PlantEntry } from "../../types";
import { harvestApi, plantApi } from "../../Utils/Paths";
import { findClosestPosition } from "../../Utils/AddressSimilarity";
import { HarvestTableGroupNewEntry } from "../DisplayFormat/HarvestTable";

import {
  cleanNewHarvestInput,
  splitStringByWordCount,
} from "../../Utils/TextModifications";

import {
  address,
  addressPositions,
  type Address,
  type AddressPositions,
} from "../../App";

type InsertManualHarvestProps = {
  week: number;
  year: number;
  plantData: PlantEntry[];
  refetchPlants: () => Promise<void>;
  manualHarvestTextInput: string;
  setManualHarvestTextInput: (text: string) => void;
};
const InsertManualHarvest = ({
  week,
  year,
  plantData,
  refetchPlants,
  manualHarvestTextInput,
  setManualHarvestTextInput,
}: InsertManualHarvestProps) => {
  const [responseMessageType, setResponseMessageType] = useState<
    "info" | "error" | "success"
  >();
  const [responseMessage, setResponseMessage] = useState<string | null>();
  const [error, setError] = useState<string | null>();
  const [NewplantData, setNewplantData] = useState<string[]>([]);

  const [isDataCleaned, setIsDataCleaned] = useState<boolean>(false);
  const [isValidJson, setIsValidJson] = useState<boolean>(false);

  const [outputViewSelector, setOutputViewSelector] = useState<
    "table" | "json"
  >("table");
  const [failedEntries, setFailedEntries] = useState<string[]>([]);
  const [jsonHarvestData, setjsonHarvestData] = useState<
    NewHarvestEntry[] | null
  >();

  let dummyData = `Løpestikke Åkeren på
Ulven T
4 stilker 7 stilker
Rabarbra NY! Tak F + D
Ulven T
4 stilker 7 stilker
Gressløk NY! Tak F + D
Ulven T
En halv plante 1 plante
Jordbær NY! 2 stk
Reddik NY! Tak B,
Kasse 14-
17
4 reddik 8 reddik
Bladkål
Tak B,
Kasse 1-
14 el.
åkeren på
Ulven T.
Så mye du vil Så mye
du vil
`;
  useEffect(() => {
    //setManualHarvestTextInput(dummyData); // Set dummy data on load
  }, []);

  useEffect(() => {
    if (plantData.length > 0) {
      findPotentialPlants(manualHarvestTextInput);
    }
  }, [manualHarvestTextInput, plantData]);

  const findPotentialPlants = (text: string) => {
    let data = text;

    // Look for "NY!" pattern to find new plants
    const newPlantMatches = data.match(
      /(^|\n)(?:\w+\/-\n*)?[A-Za-zÆØÅæøå ]+\s+NY\!\s+/gi
    );

    if (newPlantMatches) {
      let newPlants: string[] = [];

      newPlantMatches.forEach((match) => {
        let plantName = match.replace(/\s*NY\!\s+/i, "").trim();
        if (plantName) {
          plantName = plantName.replace(/\n/, "");

          // Check if plant already exists in plantData
          const plantExists = plantData.find(
            (plant) => plant.name.toLowerCase() === plantName.toLowerCase()
          );
          if (!plantExists) {
            newPlants.push(plantName);
          }
        }
      });
      setNewplantData(newPlants);
    }
  };

  const handleInputChange = (e: Event) => {
    setManualHarvestTextInput(e.target.value);
    setIsDataCleaned(false);
    setIsValidJson(false);
  };

  const handleFormatJsonClick = () => {
    setFailedEntries([]);
    setjsonHarvestData(null);
    setResponseMessage(null);
    setError(null);

    let cleanedText = manualHarvestTextInput;
    let foundPlants = "";
    let foundFailedEntries: string[] = [];

    try {
      // Split input data by double line breaks
      const entries = cleanedText.split(/\n\n+/);
      const jsonHarvestData: NewHarvestEntry[] = entries
        .map((entry, i) => {
          const harvestLines: string[] = entry.trim().split("\n");
          if (harvestLines.length != 2) {
            foundFailedEntries.push(entry);
            return null;
          }

          if (harvestLines.length == 2) {
            // Verify plantname
            const [plantNameRaw, plantInfoRaw] = harvestLines;
            if (typeof plantNameRaw !== "string")
              throw new Error("Plantenavn ekstraksjonen feilet");
            if (typeof plantInfoRaw !== "string")
              throw new Error("Høsteinfo ekstraksjonen feilet");

            const plantName = plantNameRaw.trim();
            const plant = plantData.find(
              (p) => p.name.toLowerCase() === plantName.toLowerCase()
            );
            if (!plant)
              throw new Error("Fant ingen plante i søk etter:" + plantName);
            const plant_id = plant.plant_id;

            // make harvest element
            let plotOrder = 0;
            let amount = "";
            let plantInfo = plantInfoRaw.replace(/\s(Ulvenpark|Ulven T)$/, "");
            const splitLocations = plantInfo.split(/el\./);
            const locations = splitLocations.map((line, idx) => {
              //console.log("linje", idx, line);

              //address // position // plot
              const plotAndAmountArr =
                line.match(/(?:Ulven T|Kasse)(.+)$/gi) ?? [];
              let plotAndAmount = plotAndAmountArr[0] ?? "";
              plotAndAmount = plotAndAmount.replace(/([-+])\s/g, `$1`);

              //const match = plotAndAmount.match(/^([. ]*[0-9,+-]+)\s*(.*?)$/);
              if (line.match(/Ulven T/gi)) {
                const validPositions: string[] =
                  addressPositions[address.ulvenT];
                const pos = findClosestPosition(line, validPositions);
                const match = plotAndAmount.match(/(Ulven T[. ]*)(.*?)$/i);

                if (match && match[2]) {
                  amount = match[2];
                }
                return {
                  adress: address.ulvenT,
                  position: pos,
                };
              } else if (line.match(/Kasse/gi)) {
                const validPositions: string[] =
                  addressPositions[address.ulvenPark];
                const pos = findClosestPosition(line, validPositions);
                const match = plotAndAmount.match(/Kasse (\S+)(.*?)$/i);

                let plot = "";
                if (match && match[1]) {
                  plot = match[1];
                  const plotMatch = plot.match(/(\d+)$/i);
                  plotOrder =
                    plotMatch && plotMatch[0] ? parseInt(plotMatch[0]) : 0;
                }
                if (match && match[2]) {
                  amount = match[2];
                }

                plot = plot.replace(/,\s*$/, "");
                return {
                  adress: address.ulvenPark,
                  position: pos,
                  plot: plot,
                };
              }

              return {};
            });

            //detect if amount is one or two harvests
            const amounts = splitStringByWordCount(amount);
            if (amounts && amounts.length === 2) {
              let newAmount = amounts[0];
              amount = newAmount;
            }
            //JSON.stringify(locations)
            return {
              plant_name: plantName,
              plant_id: plant_id,
              week: week,
              year: year,
              amount: amount,
              plot_order: plotOrder,
              location_json: locations,
            };
          }
          return null;
        })
        .filter(Boolean) as NewHarvestEntry[]; // Filter out null values

      if (foundFailedEntries) setFailedEntries(foundFailedEntries);

      if (jsonHarvestData) {
        setIsValidJson(true);
        setjsonHarvestData(jsonHarvestData);
      } else {
        throw new Error("Klarte ikke lage et json object av høstedataen");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent error ved konvertering til json");
      }
      return null;
    }
  };

  const handleAddHarvestData = async () => {
    setResponseMessage(null);
    setError(null);

    if (!jsonHarvestData) {
      setError("Har ingen JSON data som kan sendes til databasen");
      return;
    }
    if (
      confirm("Du legger nå inn data på uke " + week + "\nEr dette riktig?")
    ) {
      setResponseMessageType("info");
      setResponseMessage(
        "Legger inn " +
          (jsonHarvestData.length === 1
            ? "1 linje"
            : jsonHarvestData.length + " linjer") +
          " med data..."
      );

      try {
        const response = await fetch(harvestApi(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            week: week,
            year: year,
            data: jsonHarvestData,
          }),
        });

        if (!response.ok) {
          throw new Error("Feilet ved innleggelse av ny høstedata");
        }

        const result = await response.json();

        if (result.success) {
          const processedPlantNames = new Set(
            jsonHarvestData.map((entry) => entry.plant_name)
          );

          const entries = manualHarvestTextInput.split(/\n\n+/);
          const remainingEntries = entries
            .filter((entry: string) => {
              const all = entry.trim().split("\n");
              if (all && all[0]) {
                const plantName = all[0].trim();
                return !processedPlantNames.has(plantName);
              }
            })
            .filter(Boolean) as string[];

          setResponseMessage(result.message);
          setResponseMessageType("success");
          setManualHarvestTextInput(remainingEntries.join("\n\n").trim() ?? "");
          setjsonHarvestData([]);
          setIsValidJson(false);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setResponseMessage(null);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ukjent error ved innleggelse av ny høstedata");
        }
      }
    }
  };

  const addNewPlants = async () => {
    setResponseMessage(null);
    setError(null);

    try {
      const response = await fetch(plantApi(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: year,
          plants: NewplantData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert plants data");
      }

      const result = await response.json();
      if (result.success) {
        setIsValidJson(false);
        refetchPlants();
        if (result.message) {
          setResponseMessageType("success");
          setResponseMessage(result.message);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ukjent error ved innleggelse av nye planter");
      }
    }
  };

  const displayHarvest = () => {
    if (jsonHarvestData && jsonHarvestData.length > 0) {
      return (
        <Stack
          spacing={1}
          marginBottom={20}
          sx={{
            width: "100%",
          }}
        >
          <HarvestTableGroupNewEntry harvestData={jsonHarvestData} />
        </Stack>
      );
    }
  };

  return (
    <Stack
      id="insetNewHarvestWrap"
      direction="column"
      spacing={1}
      margin={1}
      sx={{
        width: "90%",
      }}
    >
      {error ? (
        <AppBar position="sticky" color="error" sx={{ marginBottom: "10px" }}>
          <Toolbar variant="dense">{error}</Toolbar>
        </AppBar>
      ) : null}

      {responseMessage ? (
        <AppBar
          position="sticky"
          color={responseMessageType}
          sx={{ marginBottom: "10px" }}
        >
          <Toolbar variant="dense">{responseMessage}</Toolbar>
        </AppBar>
      ) : null}

      {NewplantData.length > 0 ? (
        <AppBar
          position="sticky"
          color="success"
          sx={{
            padding: "10px",
          }}
        >
          <Stack
            direction="row"
            spacing={3}
            useFlexGap
            sx={{
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              minHeight: "50px",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            {NewplantData.map((plant) => (
              <em key={plant}>{plant}</em>
            ))}
          </Stack>
          <Box>
            <Button
              size="small"
              variant="contained"
              onClick={() => addNewPlants()}
            >
              Legg til nye planter
            </Button>
          </Box>
        </AppBar>
      ) : null}

      <Stack
        id="textareaWrap"
        direction="column"
        spacing={1}
        sx={{ width: "100%" }}
      >
        <Textarea
          required
          minRows={8}
          maxRows={15}
          placeholder="Tabell-data fra høstemeldings PDF"
          size="sm"
          variant="outlined"
          color="neutral"
          value={manualHarvestTextInput}
          onChange={handleInputChange}
        />
        <Stack
          direction={"row"}
          spacing={1}
          useFlexGap
          sx={{
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={() =>
              cleanNewHarvestInput(
                manualHarvestTextInput,
                setManualHarvestTextInput,
                plantData,
                setIsDataCleaned
              )
            }
          >
            Auto rydd input
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => handleFormatJsonClick()}
          >
            Forbered innleggelse
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => handleAddHarvestData()}
            disabled={
              isValidJson && jsonHarvestData && jsonHarvestData.length > 0
                ? false
                : true
            }
          >
            legg inn
          </Button>
        </Stack>
      </Stack>

      {failedEntries && failedEntries.length > 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5">
              Noen feilet i forberedelsen for innlegging
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {failedEntries.map((entry, i) => {
                return <li key={i}>{entry}</li>;
              })}
            </Typography>

            <Typography variant="body1">
              Hver plantedata skal ha et tomt linjeskift mellom seg.
            </Typography>
            <Typography variant="body1">
              Plantenavnet skal være på egen linje og høstedataen på linjen
              under.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {jsonHarvestData ? (
        <Stack
          direction="column"
          spacing={1}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1}>
            <Chip
              color={outputViewSelector === "table" ? "secondary" : "primary"}
              variant="filled"
              size="medium"
              key={"table"}
              onClick={() => {
                setOutputViewSelector("table");
              }}
              label={"Se som tabell"}
              clickable
            />
            <Chip
              color={outputViewSelector === "json" ? "secondary" : "primary"}
              variant="filled"
              size="medium"
              key={"json"}
              onClick={() => {
                setOutputViewSelector("json");
              }}
              label={"Se som JSON"}
              clickable
            />
          </Stack>

          {outputViewSelector === "table" ? (
            displayHarvest()
          ) : (
            <pre style={{ backgroundColor: "rgba(240, 238, 226, 0.5)" }}>
              {JSON.stringify(jsonHarvestData, null, 4)}
            </pre>
          )}
        </Stack>
      ) : (
        <Card
          variant="outlined"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <CardContent>
            <Typography variant="h5">Info</Typography>
            <Typography variant="body2">
              Auto rydding formaterer input til en struktur som kan brukes til
              videre arbeid.
            </Typography>
            <Typography variant="body2">
              Forberede innleggelse går igjennom input teksten og gjør den om
              til en JSON som kan ses over før det blir lagt inn i databasen
            </Typography>
            <Typography variant="body2">
              Hver plantedata skal ha et tomt linjeskift mellom seg. <br />
              Plantenavnet er på egen linje og høstedataen på linjen under.
            </Typography>
            <Typography variant="h5">Eksempel</Typography>
            <Textarea
              size="sm"
              variant="outlined"
              color="neutral"
              disabled
              value={
                "Rabarbra\nTak F + D Ulven T 4 stilker 7 stilker\n\nReddik\nTak B, Kasse 14- 17 4 reddik 8 reddik"
              }
            />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
export default InsertManualHarvest;
