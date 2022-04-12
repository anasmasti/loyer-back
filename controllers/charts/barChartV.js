const Lieu = require("../../models/lieu/lieu.model");
module.exports = {
  barChartVertical: async (_, res) => {
    let topVilles = [
      "Rabat",
      "Agadir",
      "Tanger",
      "Casablanca",
      "Marrakech",
      "Ouarzazate",
    ];

    let allBarChartData = [];

    try {
      // get the DR count per City
      // for (let i = 0; i < topVilles.length; i++) {
      //   let nombreFoncierByVille = await Lieu.find({type_lieu: "Direction régionale" , deleted: false}).countDocuments({
      //     ville: topVilles[i], deleted: false
      //   });
      //   allBarChartData.push({
      //     name: topVilles[i],
      //     value: nombreFoncierByVille,
      //   });
      // }

      // get the LF count per DR
      let DirectionRegionales = await Lieu.find({
        type_lieu: "Direction régionale",
        deleted: false,
      }).limit(11);

      for (let i = 0; i < DirectionRegionales.length; i++) {
        let nombrePointVenteByDirection = await Lieu.find({
          type_lieu: "Point de vente",
          deleted: false,
        }).countDocuments({
          attached_DR: DirectionRegionales[i]._id,
          deleted: false,
        });
        allBarChartData.push({
          name: DirectionRegionales[i].intitule_lieu,
          value: nombrePointVenteByDirection,
        });
      }

      res.json(allBarChartData);
    } catch (error) {
      res.status(403).send({ message: error.message });
    }
  },
};
