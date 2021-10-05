const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  CirclChart: async (_, res) => {
    try {
      let countContratEnCours = await Contrat.countDocuments({
        "etat_contrat.libelle": "Actif",
      });
      let countContratSuspendu = await Contrat.countDocuments({
        "etat_contrat.libelle": "Suspendu",
      });
      let countContratAvenant = await Contrat.countDocuments({
        "etat_contrat.libelle": "Avenant",
      });
      let countContratResilie = await Contrat.countDocuments({
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
          value: countContratEnCours,
          extra: {
            code: "Acf",
          },
        },
        {
          name: "Avenant",
          value: countContratAvenant,
          extra: {
            code: "Av",
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