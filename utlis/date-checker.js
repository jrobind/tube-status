const dayMap = {
  0: "Su",
  1: "Mo",
  2: "Tu",
  3: "We",
  4: "Th",
  5: "Fr",
  6: "Sa",
};

const matchesTime = (hours) => {
  const currentHour = (new Date()).getHours();

  return hours.includes(currentHour);
};

const matchesDay = (days) => {
  const currentDay = dayMap[(new Date()).getDay()];

  return days.includes(currentDay);
};

module.exports = {matchesTime, matchesDay};
