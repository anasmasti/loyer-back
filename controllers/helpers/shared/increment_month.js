const incrementMonth = (month, year) => {
  if (month == 12) {
    month = 1;
    year = +year + 1;
  } else {
    month = +month + 1;
  }

  return {
    month: month,
    year: year,
  };
};
module.exports = incrementMonth;
