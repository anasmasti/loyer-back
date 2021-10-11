const Lieu = require("../../models/lieu/lieu.model");
module.exports = {
  advancedCircleChart: async (_, res) => {
    let liuex = [
      "Direction régionale",
      "Logement de fonction",
      "Point de vente",
      "Siège",
      "Supervision",
    ];
    
    let allBarChartData = [];

    try {
      for (let i = 0; i < liuex.length; i++) {
        let nombreFoncierByLieu = await Lieu.countDocuments({
            type_lieu: liuex[i], deleted: false
        });
        allBarChartData.push({
          name: liuex[i],
          value: nombreFoncierByLieu,
        });
      }

      res.json(allBarChartData);
    } catch (error) {
      res.status(403).send({ message: error.message });
    }
  },
};