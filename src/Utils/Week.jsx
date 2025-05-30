// Hjelpefunksjon for å beregne ukenummer
export const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getInitialWeekAndYear = (useAdjustedWeek = false) => {
  const today = new Date();

  if (!useAdjustedWeek) {
    return {
      week: getWeekNumber(today),
      year: today.getFullYear(),
    };
  }

  const dayOfWeek = today.getDay(); // 0 for søndag, 1 for mandag, ..., 6 for lørdag
  let dateToUseForWeekCalculation = new Date(today);
  if (dayOfWeek < 3) {
    // 3 = onsdag
    dateToUseForWeekCalculation.setDate(today.getDate() - 4);
  }

  return {
    week: getWeekNumber(dateToUseForWeekCalculation),
    year: dateToUseForWeekCalculation.getFullYear(),
  };
};

export const getFormattedToday = () => {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const formattedDateIntl = new Intl.DateTimeFormat("en-GB", options).format(
    today
  );
  const parts = formattedDateIntl.split("/");
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
};
