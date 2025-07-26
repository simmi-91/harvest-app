export const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
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
  const formattedDateIntl = new Intl.DateTimeFormat("nb-NO", options).format(today);
  return formattedDateIntl;
};
