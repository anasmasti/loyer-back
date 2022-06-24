const incrementMonth = (month, year, incrementDuration = 1) => {
  for (let index = 0; index < incrementDuration; index++) {
    if (month == 12) {
      month = 1;
      year = +year + 1;
    } else {
      month = +month + 1;
    }
  }

  return {
    month: month,
    year: year,
  };
};
module.exports = incrementMonth;
