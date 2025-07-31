import { PlantEntry } from "../types";
export const cleanNewHarvestInput = (
  inputData: string,
  setInputData: (text: string) => void,
  plantData: PlantEntry[],
  setIsDataCleaned: (arg: boolean) => void
) => {
  let formattedData = inputData;
  //let foundPlants: string[] = [];

  // make singleline before splitting based on plantname
  let replacements = [
    { pattern: /Så\s*mye\s*(du\s*)?vil/g, replacement: "SMDV" },
    { pattern: /Så\s*mye\s*(du\s*)?trenger/g, replacement: "SMDT" },
    { pattern: /TILBAKE TIL OVERSIKTEN\n/g, replacement: "" },
    { pattern: /\-\s/g, replacement: "-" },
    { pattern: /\s*\+\s/g, replacement: "+" },
    { pattern: /NY\!/gi, replacement: "" },
    { pattern: /\n\s*/g, replacement: " " },
    {
      pattern:
        /(Grønnsak[ ]*)?(Bednr[. ]*)?(Enkeltandel[\/ ]*parandel[ ]*)?(Familieandel[ ]*)?/gi,
      replacement: "",
    },
  ];
  replacements.forEach(({ pattern, replacement }) => {
    formattedData = formattedData.replace(pattern, replacement);
  });

  // douple newline before every plantname in input
  plantData.forEach((plant) => {
    const regex = new RegExp(
      `(^|\\D\\s)(?:\\s*)?${plant.name}(?:\\s+|$)`,
      "gi"
    );
    formattedData = formattedData.replace(regex, `$1\n\n${plant.name}\n`);
    //foundPlants[plant.plant_id] = plant.name;
  });
  //setactivePlantData(foundPlants);

  setInputData(formattedData.trim());
  setIsDataCleaned(true);

  return formattedData;
};

export const numberMap = {
  en: 1,
  to: 2,
  tre: 3,
  fire: 4,
  fem: 5,
  "en halv": 0.5,
};

export const convertToNumber = (text: string): number => {
  const num: number | undefined = numberMap[text as keyof typeof numberMap];
  return num;
};

export const splitStringByWordCount = (text: string): [string, string] => {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return ["", ""];
  }

  const midpoint = Math.ceil(words.length / 2);

  const firstHalf = words.slice(0, midpoint).join(" ");

  const secondHalf = words.slice(midpoint).join(" ");

  return [firstHalf, secondHalf];
};
