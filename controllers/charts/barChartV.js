const Lieu = require("../../models/lieu/lieu.model");
module.exports = {
  barChartVertical: async (_, res) => {
    let topVilles = [
      "Tanger",
      "Rabat",
      "Agadir",
      "Casablanca",
      "Marrakech",
      "Ouarzazate",
    ];
    let allBarChartData = [];

    try {
      for (let i = 0; i < topVilles.length; i++) {
        let nombreFoncierByVille = await Lieu.countDocuments({
          ville: topVilles[i],
        });
        allBarChartData.push({
          name: topVilles[i],
          value: nombreFoncierByVille,
        });
      }

      res.json(allBarChartData);
    } catch (error) {
      res.status(403).send({ message: error.message });
    }
  },
};
