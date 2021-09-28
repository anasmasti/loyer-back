const csc = require("country-state-city");
const fs = require("fs");

module.exports = {
  getCitiesByCountry: async (req, res) => {
    if (req.params.isoCode != "MA") {
      try {
        let cities = csc.City.getCitiesOfCountry(req.params.isoCode);
        res.json(cities);
      } catch (error) {
        res.status(404).send({ message: error.message });
      }
    } else if (req.params.isoCode == "MA") {
      try {
        let moroccoVilles = fs.readFileSync("data/villes.json");
        let parsedMoroccoVilles = await JSON.parse(moroccoVilles);
        res.json(parsedMoroccoVilles);
      } catch (error) {
        res.status(404).send({ message: error.message });
      }
    }
  },
};
