const Contrat = require("../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const traitementContratActif = require("../helpers/cloture/contrats_actif");
const traitementContratResilie = require("../helpers/cloture/contrats_resilie");
const checkContrats = require("../helpers/shared/check_contrats");
const overduedContrats = require("../helpers/cloture/contrats_en_retard");
const traitementContratAvenant = require("../helpers/cloture/contrats_avenants_rappel");

module.exports = {
  clotureDuMois: async (req, res, next) => {
    try {
      let comptabilisationLoyerCrediter = [],
        montantDebiter = 0,
        comptabilisationLoyerDebiter = [],
        ordreVirement = [];

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

      // :::::::::::::::::::::::::::::::::::::::::::::: Checking contrats ::::::::::::::::::::::::::::::::::::::::::::::

      // Check 'Avenant' contrats
      await checkContrats.checkContratsAv(req, res);

      // :::::::::::::::::::::::::::::::::::::::::::::: End Checking contrats ::::::::::::::::::::::::::::::::::::::::::::::

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
          match: { is_mandataire: true, deleted: false },
        })
        .sort({ updatedAt: "desc" });

      // return res.json(contrat);

      if (contrat.length > 0) {
        //comptabilisation pour le paiement des loyers
        for (let i = 0; i < contrat.length; i++) {
          //traitement pour comptabiliser les contrats Actif
          if (contrat[i].etat_contrat.libelle == "Actif") {
            if (
              contrat[i].is_avenant &&
              contrat[i].etat_contrat.etat.is_overdued_av
            ) {
              contrat[i].etat_contrat.etat.motif.forEach(async (motif) => {
                if (motif.type_motif == "Révision du prix du loyer") {
                  // let dateEffetAv = new Date(
                  //   contrat.etat_contrat.etat.date_effet_av
                  // );
                  // if (
                  //   (dateEffetAv.getMonth() + 1 < req.body.mois &&
                  //     dateEffetAv.getFullYear() == req.body.annee) ||
                  //   dateEffetAv.getFullYear() < req.body.annee
                  // ) {
                  if (
                    contrat[i].etat_contrat.etat
                      .etat_contrat_rappel_montant_loyer_ma > 0
                  ) {
                    let resultTrait = await traitementContratAvenant(
                      res,
                      contrat[i],
                      Contrat,
                      true,
                      req.body.mois,
                      req.body.annee
                    );

                    ordreVirement.push(...resultTrait.ordreVirement);
                    comptabilisationLoyerCrediter.push(
                      ...resultTrait.comptabilisationLoyerCrediter
                    );
                  }
                  if (
                    contrat[i].etat_contrat.etat
                      .etat_contrat_rappel_montant_loyer_ea > 0
                  ) {
                    console.log("Test");
                  }
                  // }
                }
              });
            }

            let treatmentResult;
            if (contrat[i].is_overdued) {
              treatmentResult = await overduedContrats(
                res,
                contrat[i],
                dateGenerationDeComptabilisation,
                contrat[i].periodicite_paiement,
                Contrat,
                true,
                req.body.mois,
                req.body.annee
              );
            } else {
              treatmentResult =
                await traitementContratActif.clotureContratActif(
                  res,
                  contrat[i],
                  dateGenerationDeComptabilisation,
                  Contrat,
                  true,
                  req.body.mois,
                  req.body.annee
                );
            } //end if

            ordreVirement.push(...treatmentResult.ordre_virement);
            comptabilisationLoyerCrediter.push(
              ...treatmentResult.cmptLoyerCrdt
            );
            comptabilisationLoyerDebiter.push(...treatmentResult.cmptLoyerDebt);
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
                res,
                contrat[i],
                dateGenerationDeComptabilisation,
                Contrat,
                true,
                req.body.mois,
                req.body.annee
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
      } else {
        return res.status(402).send({ message: "Aucun contrat inséré" });
      }

      // :::::::::::::::::::::::::::::::::::::::::::::: Checking contrats ::::::::::::::::::::::::::::::::::::::::::::::

      // Check 'Suspendu' contrats
      await checkContrats.checkContratsSus(req, res);

      // :::::::::::::::::::::::::::::::::::::::::::::: End Checking contrats ::::::::::::::::::::::::::::::::::::::::::::::
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
