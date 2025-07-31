import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";

type WeekYearProps = {
  week: number;
  year: number;
  onWeekChange: (week: number) => void;
  onYearChange: (year: number) => void;
  blnIncrement: boolean;
};

const WeekYear: React.FC<WeekYearProps> = ({
  week,
  year,
  onWeekChange,
  onYearChange,
  blnIncrement,
}) => {
  const [inputWeek, setInputWeek] = useState(week);
  const [inputYear, setInputYear] = useState(year);

  useEffect(() => {
    setInputWeek(week);
    setInputYear(year);
  }, [week, year]);

  const handleWeekChange = (increment: number) => {
    const newWeek = Number(inputWeek) + increment;
    if (newWeek >= 1 && newWeek <= 53) {
      setInputWeek(newWeek);
      onWeekChange?.(newWeek);
    }
  };

  const handleWeekInputChange = (e) => {
    const value = e.target.value;
    setInputWeek(value);
    onWeekChange?.(value);
  };

  const handleYearInputChange = (e) => {
    const value = e.target.value;
    setInputYear(value);
    onYearChange?.(value);
  };

  return (
    <>
      {blnIncrement && (
        <button onClick={() => handleWeekChange(-1)} className="mini-button">
          -
        </button>
      )}

      <TextField
        type="number"
        label="Week"
        id="weekInput"
        value={inputWeek}
        onChange={handleWeekInputChange}
        min="1"
        max="53"
        size="small"
        style={{ width: 100 }}
      />
      {blnIncrement && (
        <button onClick={() => handleWeekChange(1)} className="mini-button">
          +
        </button>
      )}

      <TextField
        type="number"
        label="Year"
        id="yearInput"
        value={inputYear}
        onChange={handleYearInputChange}
        min="2020"
        size="small"
        style={{ width: 100 }}
      />
    </>
  );
};

export default WeekYear;
