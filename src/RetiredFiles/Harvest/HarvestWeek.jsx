import React, { useRef } from "react";
import { getWeekNumber, getFormattedToday } from "../../Utils/Week";
import WeekYear from "../../components/WeekYear";

const HarvestWeek = ({ onFetchData, currentWeek, currentYear }) => {

  const today = new Date();
  const todaysWeek = getWeekNumber(today);
  const strToday = getFormattedToday();

  let initialWeek = currentWeek;
  let initialYear = currentYear;

  const handleFetchClick = (week, year) => {
    if (week && year) {
      onFetchData(parseInt(week), parseInt(year));
    } else {
      alert("Vennligst oppgi både ukenummer og år.");
    }
  };

  return (
    <div className="harvest-container round-top round-bot">
      <h2 className="harvest-title">Høstemelding</h2>
      <div className="harvest-controls">
        <WeekYear
          week={initialWeek}
          year={initialYear}
          onWeekChange={(week) => handleFetchClick(week, initialYear)}
          onYearChange={(year) => handleFetchClick(initialWeek, year)}
          blnIncrement={true}
        />
        <button onClick={() => handleFetchClick(initialWeek, initialYear)} className="harvest-button">Last inn</button>
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
