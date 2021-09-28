const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  barChartHorizontal: async (_, res) => {
    let totalMontantLoyerPV = 0,
      totalMontantLoyerSUP = 0,
      totalMontantLoyerSG = 0,
      totalMontantLoyerLGF = 0,
      totalMontantLoyerDR = 0,
      allBarChartHorizontalData = [];

    try {
      let filtredContrat = await Contrat.find({
        deleted: false,
      });

      for (let i = 0; i < filtredContrat.length; i++) {
        if (
          filtredContrat[i].type_lieu == "Point de vente" &&
          (filtredContrat[i].etat_contrat.libelle == "En cours" || "Avenant")
        ) {
          totalMontantLoyerPV += await filtredContrat[i].montant_loyer;
        }
      }
      allBarChartHorizontalData.push({
        name: "Point de vente",
        value: totalMontantLoyerPV,
        extra: {
          code: "PV",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        if (
          filtredContrat[i].type_lieu == "Supervision" &&
          (filtredContrat[i].etat_contrat.libelle == "En cours" || "Avenant")
        ) {
          totalMontantLoyerSUP += await filtredContrat[i].montant_loyer;
        }
      }
      allBarChartHorizontalData.push({
        name: "Supervision",
        value: totalMontantLoyerSUP,
        extra: {
          code: "SUP",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        if (
          filtredContrat[i].type_lieu == "Logement de fonction" &&
          (filtredContrat[i].etat_contrat.libelle == "En cours" || "Avenant")
        ) {
          totalMontantLoyerLGF += await filtredContrat[i].montant_loyer;
        }
      }
      allBarChartHorizontalData.push({
        name: "Logement de fonction",
        value: totalMontantLoyerLGF,
        extra: {
          code: "LGF",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        if (
          filtredContrat[i].type_lieu == "Siège" &&
          (filtredContrat[i].etat_contrat.libelle == "En cours" || "Avenant")
        ) {
          totalMontantLoyerSG += await filtredContrat[i].montant_loyer;
        }
      }
      allBarChartHorizontalData.push({
        name: "Siège",
        value: totalMontantLoyerSG,
        extra: {
          code: "SG",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        if (
          filtredContrat[i].type_lieu == "Direction régionale" &&
          (filtredContrat[i].etat_contrat.libelle == "En cours" || "Avenant")
        ) {
          totalMontantLoyerDR += await filtredContrat[i].montant_loyer;
        }
      }
      allBarChartHorizontalData.push({
        name: "Direction régionale",
        value: totalMontantLoyerDR,
        extra: {
          code: "DR",
        },
      });
      res.json(allBarChartHorizontalData);
    } catch (error) {
      res.status(402).send({ message: error.message });
    }
  },
};
