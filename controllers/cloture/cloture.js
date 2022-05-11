const Contrat = require("../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const traitementContratActif = require("../helpers/cloture/contrats_actif");
const traitementContratResilie = require("../helpers/cloture/contrats_resilie");
const clotureHelper = require("../helpers/cloture/cloture");

module.exports = {
  clotureDuMois: async (req, res, next) => {
    try {
      await clotureHelper.checkContratsAv(req, res);
      await clotureHelper.checkDtFinContratsSus(req, res);

      let comptabilisationLoyerCrediter = [],
        montantDebiter = 0,
        comptabilisationLoyerDebiter = [],
        ordreVirement = [];

      let contrat = await Contrat.find({
        deleted: false,
        "etat_contrat.libelle": { $in: ["Actif", "Résilié"] },
      })
        .populate({
          path: "foncier",
          populate: {
            path: "lieu.lieu",
            populate: {
              path: "attached_DR",
            },
          },
        })
        .populate({
          path: "proprietaires",
          populate: [
            {
              path: "proprietaire_list",
              populate: { path: "proprietaire" },
            },
            {
              path: "proprietaire",
            },
          ],
          match: { is_mandataire: true },
        })
        .sort({ updatedAt: "desc" });
     // console.log("requested data ", contrat);

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
        //traitement pour comptabiliser les contrats Actif
        if (contrat[i].etat_contrat.libelle == "Actif") {
          result = await traitementContratActif.clotureContratActif(
            req,
            res,
            contrat[i],
            dateGenerationDeComptabilisation,
            Contrat,
            true
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

        if (
          contrat[i].etat_contrat.libelle == "Résilié" &&
          contrat[i].etat_contrat.etat.reprise_caution == "Récupérée"
        ) {
          let dateEffResilie = new Date(contrat[i].etat_contrat.etat.preavis);
          let dateEffResilieMonth = dateEffResilie.getMonth() + 1;
          let dateEffResilieYear = dateEffResilie.getFullYear();
          if (
            dateEffResilieMonth == req.body.mois &&
            dateEffResilieYear == req.body.annee
          ) {
            result = await traitementContratResilie.clotureContratResilie(
              req,
              res,
              contrat[i],
              dateGenerationDeComptabilisation,
              Contrat,
              true
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
          }
        }
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
      ordeVirementLoyer
        .save()
        .then(async (virementData) => {
          await comptabilisationArchive
            .save()
            .then((comptabilisationData) => {
              console.log("inisde comptabilisationData save");
              res.json({
                virementData,
                comptabilisationData,
              });
            })
            .catch((error) => {
              res.status(402).send({ message: error.message });
            });
        })
        .catch((error) => {
          res.status(401).send({ message: error.message });
        });
      // res.json(result);
    } catch (error) {
      res.status(402).json({ message: error.message });
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
        res.status(402).send({ message: error.message });
      });
  },
};
