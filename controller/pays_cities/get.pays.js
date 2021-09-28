const csc = require("country-state-city");

module.exports = {
  listOfCountries: async (_, res) => {
    try {
      let countries = csc.Country.getAllCountries();
      res.json(countries);
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
  },
};
