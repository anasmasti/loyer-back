const Contrat = require("../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const traitementContratActif = require("./contrat actif/index");

module.exports = {
  clotureDuMois: async (req, res, next) => {
    try {
      let comptabilisationLoyerCrediter = [],
        montantDebiter = 0,
        comptabilisationLoyerDebiter = [],
        ordreVirement = [];

      //get current contrat of this month
      let contrat = await Contrat.find({
        deleted: false,
        "etat_contrat.libelle": { $in: ["Actif"] },
      }).populate({
        path: "foncier",
        populate: [
          { path: "proprietaire", populate: { path: "proprietaire_list" } },
          { path: "lieu.lieu" },
        ],
      });

      // return res.json(contrat);

      //traitement pour date generation de comptabilisation
      let dateGenerationDeComptabilisation = null;
      let result;
      if (req.body.mois == 12) {
        dateGenerationDeComptabilisation = new Date(
          req.body.annee + 1 + "-" + "01" + "-" + "01"
        );
      } else {
        dateGenerationDeComptabilisation = new Date(
          req.body.annee +
            "-" +
            ("0" + (req.body.mois + 1)).slice(-2) +
            "-" +
            "01"
        );
      }

      //comptabilisation pour le paiement des loyers
      for (let i = 0; i < contrat.length; i++) {
        let dateDebutLoyer = new Date(contrat[i].date_debut_loyer);
        let premierDateDePaiement = new Date(contrat[i].date_premier_paiement);
        let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation);
        let dateFinDeContrat = contrat[i].date_fin_contrat;

        let montant_loyer_net,
          montant_loyer_brut,
          montant_tax = 0;
        let montant_loyer_net_mandataire,
          montant_loyer_brut_mandataire,
          montant_tax_mandataire = 0;
        let montant_a_verse = 0;

        //traitement pour comptabiliser les contrats Actif
        if (contrat[i].etat_contrat.libelle == "Actif") {
          // console.log(contrat[i]);
          result = await traitementContratActif.clotureContratActif(
            req,
            res,
            contrat[i],
            dateGenerationDeComptabilisation,
            Contrat
          );
          result.ordre_virement.forEach((ordVrm) => {
            ordreVirement.push(ordVrm);
          });
          result.cmptLoyerCrdt.forEach((cmptCrdt) => {
            comptabilisationLoyerCrediter.push(cmptCrdt);
          });
          result.cmptLoyerDebt.forEach((cmptDept) => {
            comptabilisationLoyerDebiter.push(cmptDept);
          });
        } //end if

        //******************************************************************************************* */
        //******************************************************************************************* */
        //******************************************************************************************* */
        //******************************************************************************************* */
      } //end for

      //post ordre de virement dans ordre de virement archive
      const ordeVirementLoyer = new ordreVirementArchive({
        ordre_virement: ordreVirement,
        date_generation_de_virement: dateGenerationDeComptabilisation,
        mois: req.body.mois,
        annee: req.body.annee,
      });
      //post comptabilisation des loyer dans comptabilisation des loyer archive
      const comptabilisationArchive = new archiveComptabilisation({
        comptabilisation_loyer_crediter: comptabilisationLoyerCrediter,
        comptabilisation_loyer_debiter: comptabilisationLoyerDebiter,
        date_generation_de_comptabilisation: dateGenerationDeComptabilisation,
        mois: req.body.mois,
        annee: req.body.annee,
      });
      // ordeVirementLoyer
      //   .save()
      //   .then(async (virementData) => {
      //     await comptabilisationArchive
      //       .save()
      //       .then((comptabilisationData) => {
      //         // res.json(true);
      //         res.json({
      //           virementData,
      //           comptabilisationData,
      //         });
      //       })
      //       .catch((error) => {
      //         res.status(402).send({ message6: error.message });
      //       });
      //   })
      //   .catch((error) => {
      //     res.status(401).send({ message7: error.message });
      //   });
      res.json({
        ordeVirementLoyer,
        comptabilisationArchive,
      });

      // res.json(result);
    } catch (error) {
      res.status(402).json({ message8: error.message });
    }
  },

  getClotureDate: async (req, res) => {
    let nextCloture;
    await archiveComptabilisation
      .find()
      .sort({ date_generation_de_comptabilisation: "desc" })
      .select({ date_generation_de_comptabilisation: 1 })
      .then((data) => {
        nextCloture = new Date(data[0].date_generation_de_comptabilisation);
        res.json({
          mois: nextCloture.getMonth() + 1,
          annee: nextCloture.getFullYear(),
        });
      })
      .catch((error) => {
        res.status(402).send({ message10: error.message });
      });
  },

  annulerCloture: async (req, res) => {},
};
