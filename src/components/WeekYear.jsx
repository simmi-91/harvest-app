import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";

const WeekYear = ({ week, year, onWeekChange, onYearChange, blnIncrement }) => {
  const [inputWeek, setInputWeek] = useState(week);
  const [inputYear, setInputYear] = useState(year);

  useEffect(() => {
    setInputWeek(week);
    setInputYear(year);
  }, [week, year]);

  const handleWeekChange = (increment) => {
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
        <button onClick={() => handleWeekChange(-1)} className="mini-button">-</button>
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
        <button onClick={() => handleWeekChange(1)} className="mini-button">+</button>
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

      {/*        
        <label htmlFor="weekInput" className="harvest-label">
          Uke:
        </label>
        <button onClick={() => handleWeekChange(-1)} className="mini-button">-</button>
        <input
          type="number"
          id="weekInput"
          value={inputWeek}
          onChange={(e) => setInputWeek(e.target.value)}
          className="harvest-input round-top round-bot input-sm"
          min="1"
          max="53"
        />
        <button onClick={() => handleWeekChange(1)} className="mini-button">+</button>

        <label htmlFor="yearInput" className="harvest-label harvest-year-label">
          År:
        </label>
        <input
          type="number"
          id="yearInput"
          value={inputYear}
          onChange={(e) => setInputYear(e.target.value)}
          className="harvest-input round-top round-bot input-sm"
          min="2020"
        />
        <button onClick={handleFetchClick} className="harvest-button">Last inn</button>     
        */}
    </>

  ); 
};

export default WeekYear;