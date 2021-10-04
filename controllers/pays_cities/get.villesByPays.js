const csc = require("country-state-city");
const fs = require("fs");

module.exports = {
  getCities: async (req, res) => {
      try {
        let moroccoVilles = fs.readFileSync("data/villes.json");
        let parsedMoroccoVilles = await JSON.parse(moroccoVilles);
        res.json(parsedMoroccoVilles);
      } catch (error) {
        res.status(404).send({ message: error.message });
      }
  },
};
