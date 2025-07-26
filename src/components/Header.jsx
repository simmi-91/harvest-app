import { useState } from "react";
import { TextField, Stack, Button } from "@mui/material";

const Header = ({ date, week, year, blnIncrement, setCurrentWeek, setCurrentYear }) => {
  const [inputWeek, setInputWeek] = useState(week);
  const [inputYear, setInputYear] = useState(year);

  const handleWeekChange = (increment) => {
    const newWeek = Number(inputWeek) + increment;
    if (newWeek >= 1 && newWeek <= 53) {
      setInputWeek(newWeek);
      setCurrentWeek(newWeek);
    }
  };

  const handleWeekInputChange = (e) => {
    const value = e.target.value;
    setInputWeek(value);
    setCurrentWeek(value);
  };

  const handleYearInputChange = (e) => {
    const value = e.target.value;
    setInputYear(value);
    setCurrentYear(value);
  };

  return (
    <header>

      <Stack
        direction="row"
        spacing={1}
        margin={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          flexWrap: 'wrap'
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
            whiteSpace: 'nowrap'
          }}
        >
          {
            blnIncrement && (
              <Button
                size="small"
                variant='outlined'
                onClick={() => handleWeekChange(-1)}
                style={{ minWidth: 30 }}
              >
                -
              </Button>
            )
          }
          <TextField
            type="number"
            label="Week"
            value={inputWeek}
            onChange={handleWeekInputChange}
            min="15"
            max="50"
            size="small"
            style={{ width: 100 }}
          />
          {
            blnIncrement && (
              <Button
                size="small"
                variant='outlined'
                onClick={() => handleWeekChange(1)}
                style={{ minWidth: 30 }}
              >
                +
              </Button>
            )
          }

          <TextField
            type="number"
            label="Year"
            value={inputYear}
            onChange={handleYearInputChange}
            min="2020"
            size="small"
            style={{ width: 100 }}
          />
        </Stack>
      </Stack>

    </header >
  );
};
export default Header;
/*
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

  <div className="flex-row">
      <button value="harvest" onClick={handleClick}>Høste</button>
      <button value="insert" onClick={handleClick}>Ny data</button>
      <button value="editharvest" onClick={handleClick}>Endre Høstedata</button>
  </div>

  </div>
*/
