import React, { useEffect, useState } from "react";
import { TextField, Stack, Button, Input } from "@mui/material";
import { Event } from "../types";

type HeaderProps = {
  date: string;
  week: number;
  year: number;
  blnIncrement: boolean;
  setCurrentWeek: (week: number) => void;
  setCurrentYear: (year: number) => void;
  searchPlant: string;
  setSearchPlant: (plant: string) => void;
  searchLocation: string;
  setSearchLocation: (location: string) => void;
  triggerSearch: () => void;
};

const Header = ({
  date,
  week,
  year,
  blnIncrement,
  setCurrentWeek,
  setCurrentYear,
  searchPlant,
  setSearchPlant,
  searchLocation,
  setSearchLocation,
  triggerSearch,
}: HeaderProps) => {
  const [inputWeek, setInputWeek] = useState(week);
  const [inputYear, setInputYear] = useState(year);

  const validateNumber = (value: string | number): number => {
    let stringValue = typeof value === "number" ? value.toString() : value;
    stringValue.replace(/\D+/g, "");

    const num =
      typeof stringValue === "number" ? stringValue : parseInt(stringValue);
    return num;
  };

  const handleWeekButtons = (increment: number) => {
    const num = validateNumber(inputWeek);
    let newWeek = num + increment;
    if (newWeek >= 50) newWeek = 50;
    if (newWeek <= 15) newWeek = 15;
    setInputWeek(newWeek);
  };

  const handleWeekInputChange = (e: Event) => {
    const num = validateNumber(e.target.value);
    setInputWeek(num);
  };

  const handleYearInputChange = (e: Event) => {
    const num = validateNumber(e.target.value);
    setInputYear(num);
  };

  const handleSearch = () => {
    let searchWeek = inputWeek;
    if (inputWeek >= 50) searchWeek = 50;
    if (inputWeek <= 15) searchWeek = 15;

    let searchYear = inputYear;
    if (searchYear <= 2022) searchYear = 2022;

    setInputWeek(searchWeek);
    setInputYear(searchYear);

    setCurrentWeek(searchWeek);
    setCurrentYear(searchYear);
  };

  return (
    <header>
      <Stack
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
        <Stack>
          <b>Høstemelding</b>
          <small>{date}</small>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          {blnIncrement && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleWeekButtons(-1)}
              style={{ minWidth: 30 }}
            >
              -
            </Button>
          )}
          <TextField
            label="Uke"
            value={inputWeek}
            onChange={handleWeekInputChange}
            size="small"
            style={{ width: 60 }}
          />
          {blnIncrement && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleWeekButtons(1)}
              style={{ minWidth: 30 }}
            >
              +
            </Button>
          )}

          <TextField
            label="År"
            value={inputYear}
            onChange={handleYearInputChange}
            size="small"
            style={{ width: 80 }}
          />

          <Button
            onClick={() => {
              handleSearch();
              triggerSearch();
            }}
            size="medium"
            variant="contained"
          >
            Søk
          </Button>
        </Stack>
      </Stack>
    </header>
  );
};
export default Header;
