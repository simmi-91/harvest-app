import React, { useState, useEffect, useRef } from "react";
import { getWeekNumber, getFormattedToday } from "../../Utils/Week";

const HarvestWeek = ({ onFetchData, currentWeek, currentYear }) => {
  const isFirstRender = useRef(true);

  // Calculate initial week based on current day
  const today = new Date();
  const todaysWeek = getWeekNumber(today);
  const strToday = getFormattedToday();

  let initialWeek = currentWeek;
  let initialYear = currentYear;

  const [inputWeek, setInputWeek] = useState(initialWeek);
  const [inputYear, setInputYear] = useState(initialYear);

  // Oppdaterer inputfeltene når currentWeek/currentYear endres eksternt (f.eks. ved initial lasting)
  useEffect(() => {
    if (isFirstRender.current) {
      setInputWeek(initialWeek);
      setInputYear(initialYear);
    }
  }, [initialWeek, initialYear]);

  const handleFetchClick = () => {
    // Kaller funksjonen sendt fra parent med de valgte uke/år
    if (inputWeek && inputYear) {
      onFetchData(parseInt(inputWeek), parseInt(inputYear));
    } else {
      alert("Vennligst oppgi både ukenummer og år.");
    }
  };

  return (
    <div className="harvest-container">
      <h2 className="harvest-title">Høstemelding</h2>
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
        <label htmlFor="yearInput" className="harvest-label harvest-year-label">
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
        <button onClick={handleFetchClick} className="harvest-button">
          Last inn
        </button>
      </div>
      <small className="current-info">
        {strToday}, week:{todaysWeek}
      </small>
    </div>
  );
};

const HarvestWeekSkeleton = () => {
  return (
    <div className="">
      <div className=""></div>
      <div className="">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export { HarvestWeek, HarvestWeekSkeleton, getWeekNumber };
