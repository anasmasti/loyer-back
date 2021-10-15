const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  CirclChart: async (_, res) => {
    try {
      let countContratActif = await Contrat.find({deleted: false}).countDocuments({
        "etat_contrat.libelle": "Actif",
      });
      let countContratAvenant = await Contrat.find({deleted: false}).countDocuments({
        "etat_contrat.libelle": "Avenant",
      });
      let countContratSuspendu = await Contrat.find({deleted: false}).countDocuments({
        "etat_contrat.libelle": "Suspendu",
      });
      let countContratResilie = await Contrat.find({deleted: false}).countDocuments({
        "etat_contrat.libelle": "Résilié",
      });

      let allCirclChartData = [
        {
          name: "Résilié",
          value: countContratResilie,
          extra: {
            code: "Rés",
          },
        },
        {
          name: "Actif",
          value: countContratAvenant + countContratActif,
          extra: {
            code: "Acf",
          },
        },
        {
          name: "Suspendu",
          value: countContratSuspendu,
          extra: {
            code: "Sus",
          },
        },
      ];
      res.json(allCirclChartData);
    } catch (error) {
      throw error;
    }
  },
};
