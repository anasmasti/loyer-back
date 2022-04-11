const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  barChartHorizontal: async (_, res) => {
    let totalMontantLoyerPV = 0,
      // totalMontantLoyerSUP = 0,
      totalMontantLoyerSG = 0,
      totalMontantLoyerLGF = 0,
      totalMontantLoyerDR = 0,
      allBarChartHorizontalData = [];

    try {
      let filtredContrat = await Contrat.find({
        deleted: false,
      }).populate({ path: "foncier", populate: { path: "lieu.lieu" } });
      // return res.json(filtredContrat)
      for (let i = 0; i < filtredContrat.length; i++) {
        // for (let j = 0; j < filtredContrat[i].foncier.lieu.length; j++) {
        //   if (filtredContrat[i].foncier.lieu[j].deleted == false) {
        if (
          // filtredContrat[i].foncier.lieu[j].lieu.type_lieu == "Point de vente" &&
          filtredContrat[i].foncier.type_lieu == "Point de vente" &&
          (filtredContrat[i].etat_contrat.libelle == "Actif" || "Avenant")
        ) {
          totalMontantLoyerPV += await filtredContrat[i].montant_loyer;
        }
      }
      //   }
      // }
      allBarChartHorizontalData.push({
        name: "Point de vente",
        value: totalMontantLoyerPV + "MAD",
        extra: {
          code: "PV",
        },
      });
      // for (let i = 0; i < filtredContrat.length; i++) {
      //   if (
      //     filtredContrat[i].lieu.type_lieu == "Supervision" &&
      //     (filtredContrat[i].etat_contrat.libelle == "Actif" || "Avenant")
      //   ) {
      //     totalMontantLoyerSUP += await filtredContrat[i].montant_loyer;
      //   }
      // }
      // allBarChartHorizontalData.push({
      //   name: "Supervision",
      //   value: totalMontantLoyerSUP,
      //   extra: {
      //     code: "SUP",
      //   },
      // });
      for (let i = 0; i < filtredContrat.length; i++) {
        // for (let j = 0; j < filtredContrat[i].foncier.lieu.length; j++) {
        //   if (filtredContrat[i].foncier.lieu[j].deleted == false) {
        if (
          // filtredContrat[i].foncier.lieu[j].lieu.type_lieu == "Logement de fonction" &&
          filtredContrat[i].foncier.type_lieu == "Logement de fonction" &&
          (filtredContrat[i].etat_contrat.libelle == "Actif" || "Avenant")
        ) {
          totalMontantLoyerLGF += await filtredContrat[i].montant_loyer;
        }
      }
      //   }
      // }
      allBarChartHorizontalData.push({
        name: "Logement de fonction",
        value: totalMontantLoyerLGF + "MAD",
        extra: {
          code: "LGF",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        // for (let j = 0; j < filtredContrat[i].foncier.lieu.length; j++) {
        //   if (filtredContrat[i].foncier.lieu[j].deleted == false) {
        if (
          // filtredContrat[i].foncier.lieu[j].lieu.type_lieu == "Siège" &&
          filtredContrat[i].foncier.type_lieu == "Siège" &&
          (filtredContrat[i].etat_contrat.libelle == "Actif" || "Avenant")
        ) {
          totalMontantLoyerSG += await filtredContrat[i].montant_loyer;
        }
      }
      //   }
      // }
      allBarChartHorizontalData.push({
        name: "Siège",
        value: totalMontantLoyerSG + "MAD",
        extra: {
          code: "SG",
        },
      });
      for (let i = 0; i < filtredContrat.length; i++) {
        // for (let j = 0; j < filtredContrat[i].foncier.lieu.length; j++) {
        //   if (filtredContrat[i].foncier.lieu[j].deleted == false) {
        if (
          // filtredContrat[i].foncier.lieu[j].lieu.type_lieu == "Direction régionale" &&
          filtredContrat[i].foncier.type_lieu == "Direction régionale" &&
          (filtredContrat[i].etat_contrat.libelle == "Actif" || "Avenant")
        ) {
          totalMontantLoyerDR += await filtredContrat[i].montant_loyer;
        }
      }
      //   }
      // }
      allBarChartHorizontalData.push({
        name: "Direction régionale",
        value: totalMontantLoyerDR + "MAD",
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
