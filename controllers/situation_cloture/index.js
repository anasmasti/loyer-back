const Contrat = require("../../models/contrat/contrat.model");
const etatTaxesSch = require("../../models/situation_cloture/etatTaxes.schema");
const etatVirementSch = require("../../models/situation_cloture/etatVirement.schema");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const traitementContratActif = require("../helpers/cloture/contrats_actif");
const traitementContratResilie = require("../helpers/cloture/contrats_resilie");
const checkContrats = require("../helpers/shared/check_contrats");
const overduedContrats = require("../helpers/cloture/contrats_en_retard");
const etatMonsuelTaxes = require("./etat_taxes");
const etatMonsuelVirement = require("./etat_virement");
const mongoose = require("mongoose");

module.exports = {
  situation_cloture: async (req, res, next) => {
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
      // Check 'Suspendu' contrats
      // await checkContrats.checkContratsSus(req, res);

      // :::::::::::::::::::::::::::::::::::::::::::::: End Checking contrats ::::::::::::::::::::::::::::::::::::::::::::::

      //get current contrat of this month
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
            let treatmentResult;
            if (contrat[i].is_overdued) {
              treatmentResult = await overduedContrats(
                res,
                contrat[i],
                dateGenerationDeComptabilisation,
                contrat[i].periodicite_paiement,
                Contrat,
                false,
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
                  false,
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
                false,
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

        // Store archives
        const existedEtatVirement = await etatVirementSch.findOne({
          mois: req.body.mois,
          annee: req.body.annee,
        });
        const existedEtatTaxes = await etatTaxesSch.findOne({
          mois: req.body.mois,
          annee: req.body.annee,
        });

        if (existedEtatVirement && existedEtatTaxes) {
          etatVirementSch
            .findByIdAndUpdate(
              { _id: existedEtatVirement._id },
              {
                ordre_virement: ordreVirement,
                date_generation_de_virement: dateGenerationDeComptabilisation,
                mois: existedEtatTaxes.mois,
                annee: existedEtatVirement.annee,
              }
            )
            .then(() => {
              etatMonsuelVirement(req, res);
            });

          etatTaxesSch
            .findByIdAndUpdate(
              { _id: existedEtatTaxes._id },
              {
                comptabilisation_loyer_crediter: comptabilisationLoyerCrediter,
                comptabilisation_loyer_debiter: comptabilisationLoyerDebiter,
                date_generation_de_comptabilisation:
                  dateGenerationDeComptabilisation,
                mois: existedEtatTaxes.mois,
                annee: existedEtatTaxes.annee,
              }
            )
            .then(() => {
              etatMonsuelTaxes(req, res);
            });
        } else {
          //post ordre de virement dans ordre de virement archive
          const etatVirement = new etatVirementSch({
            ordre_virement: ordreVirement,
            date_generation_de_virement: dateGenerationDeComptabilisation,
            mois: req.body.mois,
            annee: req.body.annee,
          });
          //post comptabilisation des loyer dans comptabilisation des loyer archive
          const etatTaxes = new etatTaxesSch({
            comptabilisation_loyer_crediter: comptabilisationLoyerCrediter,
            comptabilisation_loyer_debiter: comptabilisationLoyerDebiter,
            date_generation_de_comptabilisation:
              dateGenerationDeComptabilisation,
            mois: req.body.mois,
            annee: req.body.annee,
          });

          etatVirement
            .save()
            .then(async (virementData) => {
              await etatTaxes
                .save()
                .then(async (comptabilisationData) => {
                  await etatMonsuelVirement(req, res);
                  etatMonsuelTaxes(req, res);
                  // res.json({
                  //   virementData,
                  //   comptabilisationData,
                  // });
                })
                .catch((error) => {
                  res.status(402).send({ message: error.message });
                });
            })
            .catch((error) => {
              res.status(401).send({ message: error.message });
            });
        }
        res.json({
          comptabilisationLoyerCrediter,
          comptabilisationLoyerDebiter,
          ordreVirement,
        });
        // End Store archives
      } else {
        return res.status(402).send({ message: "Aucun contrat inséré" });
      }
      // res.json(true);
    } catch (error) {
      res.status(402).json({ message: error.message });
    }
  },
};
