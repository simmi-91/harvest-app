import React, { useState, useEffect, useRef } from "react";
import Textarea from "@mui/joy/Textarea";
import {
  getInitialWeekAndYear,
  getWeekNumber,
  getFormattedToday,
} from "../../Utils/Week";
import { plantApi, harvestApi } from "../../Utils/Paths";

const InsertHarvest = () => {
  // Get initial week and year using the utility function
  const { week: initialWeek, year: initialYear } = getInitialWeekAndYear(false);
  const isFirstRender = useRef(true);

  const today = new Date();
  const todaysWeek = getWeekNumber(today);
  const strToday = getFormattedToday();

  const [inputWeek, setInputWeek] = useState(initialWeek);
  const [inputYear, setInputYear] = useState(initialYear);
  const [tableData, setTableData] = useState("");
  const [inputData, setInputData] = useState("");
  const [plantsData, setPlantsData] = useState("");
  const [activePlantData, setactivePlantData] = useState([]);
  const [NewplantsData, setNewplantsData] = useState([]);
  const [NewplantsResponse, setNewplantsResponse] = useState();
  const [isValidJson, setIsValidJson] = useState(false);
  const [isDataCleaned, setIsDataCleaned] = useState(false);

  // Dummy data string
  const dummyData = `Løpestikke Åkeren på
Ulven T
4 stilker 7 stilker
Rabarbra NY! Tak F + D
Ulven T
4 stilker 7 stilker
Gressløk NY! Tak F + D
Ulven T
En halv plante 1 plante
Jordbær NY! 2 stk
`;

  const fetchPlants = async () => {
    try {
      const response = await fetch(plantApi());
      if (!response.ok) {
        throw new Error(
          `Failed to fetch plants: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.success) {
        setPlantsData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Error fetching plants:", err);
    }
  };

  // Fetch plants data on component mount // Need to be first!
  useEffect(() => {
    fetchPlants();
  }, []);

  // Run findPotentialPlants when inputData changes
  useEffect(() => {
    if (plantsData.length > 0) {
      findPotentialPlants(inputData);
    }
  }, [inputData, plantsData]);

  useEffect(() => {
    //setInputData(dummyData); // Set dummy data on load
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      setInputWeek(initialWeek);
      setInputYear(initialYear);
      isFirstRender.current = false;
    }
  }, [initialWeek, initialYear]);

  const cleanInput = () => {
    //fetch plants data
    let formattedData = inputData;
    let foundPlants = [];
    plantsData.forEach((plant) => {
      const regex = new RegExp(`(?:^|\\s*)${plant.name}(?:\\s*|$)`, "gi");
      formattedData = formattedData.replace(regex, `\n\n${plant.name}\n`);
      foundPlants[plant.id] = plant.name;
    });
    setactivePlantData(foundPlants);

    /*formattedData = formattedData
      .split("\n")
      .map((line) => line.trimStart())
      .join("\n");*/

    const replacements = [
      { pattern: /Så\s*mye\s*du\s*vil/g, replacement: "SMDV" },
      { pattern: /Så\s*mye\s*du\s*trenger/g, replacement: "SMDT" },
      { pattern: /\s+NY!\s+/g, replacement: "\n" },
      { pattern: /\nUlven/g, replacement: " Ulven" },
      { pattern: /\nhåndfull/g, replacement: " håndfull" },
      { pattern: /Tak\n/g, replacement: "Tak " },
      { pattern: /Tak F[ \+]+D Ulven T/g, replacement: "Tak Ulven T" },
      { pattern: /,\s*\n\s*/g, replacement: ", " },
      { pattern: /-\n/g, replacement: "-" },
      { pattern: /En halv plante/g, replacement: "0.5 plante" },
      {
        pattern: /Nok\s*til\s*pynt\s*til\s*(\w+)\s*(salat(?:er)?\/)ka\s*ke/g,
        replacement: "Nok til pynt til $1 $2kake",
      },
      {
        pattern: /kasse\s*(?:\n)?([0-9]+)\s*(?:\n)?/gi,
        replacement: "kasse $1 ", // fjerner linebreak mellom kasse nummer
      },
      {
        pattern:
          /(Tak\s+[A-Z])(?:\n)?\s*,\s*(kasse\s*(?:\n)?[0-9]+(?:(?:\n)?[ ,\+\-]+(?:\n)?[0-9]+)?)/gi,
        replacement: "$1, $2", //slå sammen tak og kasse
      },
    ];

    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      formattedData = formattedData.replace(pattern, replacement);
    });

    setInputData(formattedData.trim());
    setIsDataCleaned(true);

    return formattedData;
  };

  const handleFormatJsonClick = () => {
    let cleanedText = cleanInput();
    let foundPlants = "";

    try {
      // Split input data by double line breaks
      const entries = cleanedText.split(/\n\n+/);
      const jsonData = entries
        .map((entry) => {
          const lines = entry.trim().split("\n");
          if (lines.length < 3) return null;

          const plantName = lines[0].trim();
          const plant = plantsData.find(
            (p) => p.name.toLowerCase() === plantName.toLowerCase()
          );
          if (!plant) return null;

          if (foundPlants) {
            foundPlants += " / ";
          }
          foundPlants += plant.plant_id + ":" + plantName;

          let position = lines[1].trim();
          let plot = 0;

          if (position.match("Tak")) {
            // Extract position and plot from Tak format
            const takMatch = position.match(
              /(Tak\s+[A-Z])\s*,\s*kasse\s*([0-9]+(?:[ ,-]+[0-9]+)?)/i
            );
            if (takMatch) {
              position = takMatch[1];
              plot = takMatch[2] || "0";
            }
          }

          // Extract first number from plot for plot_order
          const plotOrder = plot.toString().match(/\d+/);
          const plot_order = plotOrder ? parseInt(plotOrder[0]) : 0;

          //detect if amount is one or two harvests
          let amount = lines[2].trim();
          let amounts = amount.split(/\s+/);

          if (amounts.length >= 2) {
            // Convert text numbers to actual numbers
            const convertToNumber = (text) => {
              const numberMap = {
                en: 1,
                to: 2,
                tre: 3,
                fire: 4,
                fem: 5,
              };
              const num = parseInt(text);
              if (!isNaN(num)) return num;
              return numberMap[text.toLowerCase()] || 1;
            };

            const firstAmount = convertToNumber(amounts[0]);
            const secondAmount = convertToNumber(amounts[2] || amounts[1]);

            // Verify if second amount is double the first
            if (secondAmount >= firstAmount * 1.7) {
              // Keep the original first amount with its unit/description
              amount = amounts.slice(0, 2).join(" ");
            }
          }

          return {
            plant_id: plant.plant_id,
            plant_name: plantName,
            position: position,
            plot: plot,
            plot_order: plot_order,
            amount: amount,
          };
        })
        .filter((entry) => entry !== null);

      setactivePlantData(foundPlants);
      if (jsonData.length > 0) {
        setTableData(JSON.stringify(jsonData, null, 2));
        setIsValidJson(true);
      } else {
        setTableData("Invalid data format");
        setIsValidJson(false);
      }
    } catch (err) {
      setTableData("Error processing data: " + err.message);
      setIsValidJson(false);
    }
  };

  const handleAddHarvestClick = async () => {
    try {
      const response = await fetch(harvestApi(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week: inputWeek,
          year: inputYear,
          data: JSON.parse(tableData),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert harvest data");
      }

      const result = await response.json();

      if (result.success) {
        //console.log("Harvest data inserted successfully!");
        setInputData("");
        setTableData(result.message);
        setIsValidJson(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error inserting harvest data:", err);
    }
  };

  const handleAddPlantsClick = async () => {
    setNewplantsResponse("");

    try {
      const response = await fetch(plantApi(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: inputYear,
          plants: NewplantsData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert plants data");
      }

      const result = await response.json();
      if (result.success) {
        setIsValidJson(false);
        fetchPlants();
        if (result.message) {
          setNewplantsResponse(result.message);
        } else {
          setNewplantsResponse("");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error(err, result.error);
      alert(result.message);
    }
  };

  const findPotentialPlants = (text) => {
    let data = text;
    let newPlants = [];

    // Look for "NY!" pattern to find new plants
    const newPlantMatches = data.match(/(^|\n)[A-Za-zÆØÅæøå ]+\s+NY\!\s+/g);

    if (newPlantMatches) {
      newPlantMatches.forEach((match) => {
        // Extract plant name by removing "NY!" and any surrounding text
        const plantName = match.replace(/\s*NY\!\s+/, "").trim();
        if (plantName) {
          // Check if plant already exists in plantsData
          const plantExists = plantsData.find(
            (plant) => plant.name.toLowerCase() === plantName.toLowerCase()
          );
          if (!plantExists) {
            newPlants.push(plantName);
          }
        }
      });
    }
    setNewplantsData(newPlants);
  };

  const handleInputChange = (e) => {
    setInputData(e.target.value);
    setNewplantsResponse("");
    setIsDataCleaned(false);
  };

  return (
    <>
      <div className="harvest-container">
        <h2 className="harvest-title">Legg inn ny høstemelding</h2>
        <div className="harvest-controls">
          <label htmlFor="weekInput" className="harvest-label">
            Uke:
          </label>
          <input
            type="number"
            id="weekInput"
            value={inputWeek}
            onChange={(e) => setInputWeek(e.target.value)}
            className="harvest-input"
            min="1"
            max="53"
          />
          <label
            htmlFor="yearInput"
            className="harvest-label harvest-year-label"
          >
            År:
          </label>
          <input
            type="number"
            id="yearInput"
            value={inputYear}
            onChange={(e) => setInputYear(e.target.value)}
            className="harvest-input"
            min="2020"
          />
        </div>
        <small className="current-info">
          {strToday}, week:{todaysWeek}
        </small>
        <p className="instructions">
          Kopier tabell data fra PDF. Legg til nye planter hvis det finnes.
          Formater og test om Json blir gyldig. Alt OK? Legg inn ny høste-data
          <br />
          <a href="./hostemelding_uke_21.pdf" target="_blank">
            Eksempel pdf
          </a>
        </p>
      </div>

      {NewplantsData.length > 0 ? (
        <>
          <p>
            <span>Fant nye planter i lista:&nbsp;</span>
            <span>{NewplantsData.join(", ")} &nbsp;</span>

            {NewplantsResponse ? (
              <>
                <br />
                {NewplantsResponse}
              </>
            ) : !NewplantsResponse ? (
              <>
                <button
                  onClick={handleAddPlantsClick}
                  className="harvest-button"
                >
                  Legg til plantene
                </button>
              </>
            ) : null}
          </p>
        </>
      ) : null}

      <div className="flex-row ">
        <div className="flex-col flex-grow">
          <span>Høste Data fra PDF</span>
          <Textarea
            required
            minRows={8}
            maxRows={15}
            placeholder="Tabell-data fra høstemeldings PDF"
            size="sm"
            variant="outlined"
            value={inputData}
            onChange={handleInputChange}
          />
          <div className="flex-row">
            {/*
              <button onClick={cleanInput} className="harvest-button">
                Auto rydd input
              </button>
            */}
            <button onClick={handleFormatJsonClick} className="harvest-button">
              Formater og test input
            </button>
          </div>
        </div>

        {tableData ? (
          <>
            <div style={{ minWidth: "40%" }}>
              <span>Formatert Json Data</span>
              <Textarea
                minRows={8}
                maxRows={15}
                size="sm"
                variant="outlined"
                placeholder={tableData}
              />
              <button
                id="insertBtn"
                disabled={!isValidJson}
                onClick={handleAddHarvestClick}
                className="harvest-button"
              >
                Legg inn data
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

export default InsertHarvest;
