import React, { useState, useEffect, useRef } from "react";
import Textarea from "@mui/joy/Textarea";
import WeekYear from "../../components/WeekYear";
import {
  getInitialWeekAndYear,
  getWeekNumber,
  getFormattedToday,
} from "../../Utils/Week";
import { plantApi, harvestApi, replacementsApi } from "../../Utils/Paths";

const InsertHarvest = () => {
  const { week: initialWeek, year: initialYear } = getInitialWeekAndYear(false);
  const isFirstRender = useRef(true);

  const today = new Date();
  const todaysWeek = getWeekNumber(today);
  const strToday = getFormattedToday();

  const [inputWeek, setInputWeek] = useState(initialWeek);
  const [inputYear, setInputYear] = useState(initialYear);
  const [jsonHarvestData, setjsonHarvestData] = useState("");
  const [inputData, setInputData] = useState("");
  const [plantsData, setPlantsData] = useState("");
  const [activePlantData, setactivePlantData] = useState([]);
  const [NewplantsData, setNewplantsData] = useState([]);
  const [NewplantsResponse, setNewplantsResponse] = useState();
  const [isValidJson, setIsValidJson] = useState(false);
  const [isDataCleaned, setIsDataCleaned] = useState(false);
  const [replacements, setReplacements] = useState([]);

  const [responseMessage, setResponseMessage] = useState(null);

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
Reddik NY! Tak B,
Kasse 14-
17
4 reddik 8 reddik
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

  useEffect(() => {
    fetchPlants();
  }, []);

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

  // Add this useEffect to fetch replacements when component mounts
  useEffect(() => {
    const fetchReplacements = async () => {
      try {
        const response = await fetch(replacementsApi());
        if (!response.ok) {
          throw new Error(`Failed to fetch replacements: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          // Convert string patterns to RegExp objects
          const processedReplacements = data.data.map(rep => ({
            pattern: new RegExp(rep.pattern, 'g'),
            replacement: rep.replacement
          }));
          setReplacements(processedReplacements);
        }
      } catch (err) {
        console.error("Error fetching replacements:", err);
      }
    };

    fetchReplacements();
  }, []);

  const cleanInput = () => {
    let formattedData = inputData;
    let foundPlants = [];
    plantsData.forEach((plant) => {
      const regex = new RegExp(`(^|\\D\\s)(?:\\s*)?${plant.name}(?:\\s*|$)`, "gi");
      formattedData = formattedData.replace(regex, `$1\n\n${plant.name}\n`);
      foundPlants[plant.id] = plant.name;
    });
    setactivePlantData(foundPlants);

    const replacements = [
      { pattern: /TILBAKE TIL OVERSIKTEN\n/g, replacement: "" },
      { pattern: /(Ulven T)?\s*Grønnsak\s*Bednr[. ]*Enkeltandel\/\s*parandel\s*Familieandel/gi, replacement: "" },
      { pattern: /\*/g, replacement: "" },
      { pattern: /\sog\s*/g, replacement: " og " },
      { pattern: /Så\s*mye\s*(du\s*)?vil/g, replacement: "SMDV" },
      { pattern: /Så\s*mye\s*(du\s*)?trenger/g, replacement: "SMDT" },
      { pattern: /SMDV SMDV/g, replacement: "SMDV" },
      { pattern: /SMDT SMDT/g, replacement: "SMDT" },
      { pattern: /\s+NY!\s+/ig, replacement: "\n" },
      { pattern: /\nUlven/g, replacement: " Ulven" },
      { pattern: /\nhåndfull/g, replacement: " håndfull" },
      { pattern: /Tak\n/g, replacement: "Tak " },
      { pattern: /Tak [A-Z \+]+ Ulven T/g, replacement: "Tak Ulven T" },
      { pattern: /,\s*\n\s*/g, replacement: ", " },
      { pattern: /-\n/g, replacement: "-" },
      { pattern: /En halv /g, replacement: "0.5 " },
      { pattern: /I\s*store\s*kasser\s*(på)?/g, replacement: "" },
      { pattern: /flerårige\s*kasser/g, replacement: "" },
      { pattern: /[+ ]*rundt\s*kanten\s*på\s*kasse\s*(\d+)/g, replacement: "+$1" },
      { pattern: /[(+ ]*\w+ som har\s*sneket seg inn[)]*\n/g, replacement: "" },
      {
        pattern: /Nok\s*til\s*pynt\s*til\s*(\w+)\s*(salat(?:er)?\/)ka\s*ke/g,
        replacement: "Nok til pynt til $1 $2kake",
      }, {
        pattern: /Nok\s*til\s*en\s*(\w+)\s/g,
        replacement: "Nok til en $1\n",
      },
      {
        pattern: /kasse\s*(?:\n)?([0-9]+)\s*(?:\n)?(?:([,+-])\s*([0-9]+))?(?:\n)?/gi,
        replacement: "kasse $1$2$3\n", // fjerner linebreak mellom kassenummer
      },
      {
        pattern:
          /(Tak\s+[A-Z])(?:\n)?\s*,\s*(kasse\s*(?:\n)?[0-9]+(?:(?:\n)?[ ,\+\-]+(?:\n)?[0-9]+)?)/gi,
        replacement: "$1, $2", //slå sammen tak og kasse
      },
      {
        pattern:
          /\s*\n*b\n*l\n*o\n*m\n*s\n*t\n*e\n*r\n*h\n*o\n*d\n*e/gi,
        replacement: " blomsterhode",
      },
      {
        pattern:
          /I flere\s*kasser på\s*tak (\w)\n/gi,
        replacement: "Tak $1\n",
      },
    ];

    // Apply all replacements from the database
    replacements.forEach(({ pattern, replacement }) => {
      formattedData = formattedData.replace(pattern, replacement);
    });

    setInputData(formattedData.trim());
    setIsDataCleaned(true);

    return formattedData;
  };

  const handleFormatJsonClick = (week, year) => {
    let cleanedText = inputData;
    let foundPlants = "";

    try {
      // Split input data by double line breaks
      const entries = cleanedText.split(/\n\n+/);
      const jsonHarvestData = entries
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
              /(Tak\s+(?:[A-Z]|[A-Z][,A-Zog ]{4,10}))\s*,\s*kasse\s*([0-9]+(?:[ +,-]+[0-9]+)?)/i
            );
            if (takMatch) {
              position = takMatch[1];
              plot = takMatch[2] || "0";
            }
          }
          position = position.charAt(0).toUpperCase() + position.slice(1);

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
      if (jsonHarvestData.length > 0) {
        setjsonHarvestData(JSON.stringify(jsonHarvestData, null, 2));
        setIsValidJson(true);
      } else {
        setjsonHarvestData("Invalid data format");
        setIsValidJson(false);
      }
    } catch (err) {
      setjsonHarvestData("Error processing data: " + err.message);
      setIsValidJson(false);
    }
  };

  const handleAddHarvestClick = async (week, year) => {
    setResponseMessage("Laster...");
    try {
      const response = await fetch(harvestApi(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week: week,
          year: year,
          data: JSON.parse(jsonHarvestData),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert harvest data");
      }

      const result = await response.json();

      if (result.success) {
        const processedEntries = JSON.parse(jsonHarvestData);
        const processedPlantNames = new Set(processedEntries.map(entry => entry.plant_name));
        const entries = inputData.split(/\n\n+/);
        const remainingEntries = entries.filter(entry => {
          const plantName = entry.trim().split('\n')[0].trim();
          return !processedPlantNames.has(plantName);
        });
        setResponseMessage(result.message);
        setInputData(remainingEntries.join('\n\n').trim());
        setjsonHarvestData([]);
        setIsValidJson(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      //console.error("Error inserting harvest data:", err);
      setResponseMessage(`Error inserting harvest data: ${err.message}`);
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
      setNewplantsResponse(`Error inserting plants data: ${err.message}`);
    }
  };

  const findPotentialPlants = (text) => {
    let data = text;
    let newPlants = [];

    // Look for "NY!" pattern to find new plants
    const newPlantMatches = data.match(/(^|\n)(?:\w+\/-\n*)?[A-Za-zÆØÅæøå ]+\s+NY\!\s+/ig);

    if (newPlantMatches) {
      newPlantMatches.forEach((match) => {
        let plantName = match.replace(/\s*NY\!\s+/i, "").trim();
        if (plantName) {
          plantName = plantName.replace(/\n/, "");

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
      <div className="harvest-container round-top round-bot">
        <h2 className="harvest-title">Legg inn ny høstemelding</h2>
        <div className="harvest-controls">
          <WeekYear
            week={initialWeek}
            year={initialYear}
            onWeekChange={(week) => handleFormatJsonClick(week, initialYear)}
            onYearChange={(year) => handleFormatJsonClick(initialWeek, year)}
            blnIncrement={true}
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
          <p className="round-top round-bot bg-white border-dark">
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
            <button onClick={cleanInput} className="harvest-button">
              Auto rydd input
            </button>
            <button onClick={() => handleFormatJsonClick(initialWeek, initialYear)} className="harvest-button">
              Forbered innleggelse
            </button>
          </div>
        </div>

        {jsonHarvestData ? (
          <>
            <div style={{ minWidth: "40%" }}>
              <span>Formatert Json Data</span>
              <Textarea
                minRows={8}
                maxRows={15}
                size="sm"
                variant="outlined"
                placeholder={jsonHarvestData}
              />
              <button
                id="insertBtn"
                disabled={!isValidJson}
                onClick={() => handleAddHarvestClick(initialWeek, initialYear)}
                className="harvest-button"
              >
                Legg inn data
              </button>
            </div>
          </>
        ) : null}
      </div>

      {jsonHarvestData && (() => {
        try {
          const parsedData = JSON.parse(jsonHarvestData);
          return Array.isArray(parsedData) ? (
            <>
              <div className="table-container border">
                <h3 className="table-header bg-light border-light round-top mb-0">Ny data:</h3>
                <table className="harvest-table bg-white">
                  <thead>
                    <tr>
                      <th>Plant</th>
                      <th>Position</th>
                      <th>Plot</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isValidJson && parsedData.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.plant_name}</td>
                        <td>{entry.position}</td>
                        <td>{entry.plot}</td>
                        <td>{entry.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null;
        } catch (err) {
          return null;
        }
      })()}

      {responseMessage && (
        <footer className="round-top round-bot">
          <em style={{ whiteSpace: 'pre-line' }}>{responseMessage}</em>
        </footer>
      )}
    </>
  );
};

export default InsertHarvest;
