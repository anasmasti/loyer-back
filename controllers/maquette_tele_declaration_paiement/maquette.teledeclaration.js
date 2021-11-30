const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");
const Contrat = require("../../models/contrat/contrat.model");
const Test = require("../../controllers/contrat/get.contrat");
// const Test =
// const Contrat = require("../../controllers/");

// Current Date
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;

function CreateAnnex1objectFromContrat(CurrentMonthContrats , annee) {
  // console.log(CurrentMonthContrats);

  let ifuBailleur = 0;
  let DetailRetenueRevFoncier = [];
  let TotalMntBrutLoyer = 0;
  let TotalMntRetenueSource = 0;
  let TotalMntLoyer = 0;

  // Make data unite ( Calculation )
  for (let index = 0; index < CurrentMonthContrats.length; index++) {
    TotalMntBrutLoyer += CurrentMonthContrats[index].total_montant_brut_loyer;
    TotalMntRetenueSource +=
      CurrentMonthContrats[index].retenue_source_par_mois;
    TotalMntLoyer += CurrentMonthContrats[index].total_montant_net_loyer;

    //List DetailRetenueRevFoncier
    for (
      let j = 0;
      j < CurrentMonthContrats[index].foncier.proprietaire.length;
      j++
    ) {
      ifuBailleur += 1;
      DetailRetenueRevFoncier.push({
        ifuBailleur: ifuBailleur,
        numCNIBailleur: CurrentMonthContrats[index].foncier.proprietaire[j].cin,
        numCEBailleur:
          CurrentMonthContrats[index].foncier.proprietaire[j].carte_sejour,
        nomPrenomBailleur:
          CurrentMonthContrats[index].foncier.proprietaire[j].nom_prenom,
        adresseBailleur:
          CurrentMonthContrats[index].foncier.proprietaire[j].adresse,
        adresseBien: CurrentMonthContrats[index].foncier.adresse,
        typeBienBailleur: {
          code: "LUC",
        },
        mntBrutLoyer:
          CurrentMonthContrats[index].foncier.proprietaire[j].montant_loyer,
        mntRetenueSource:
          CurrentMonthContrats[index].foncier.proprietaire[j].retenue_source,
        mntNetLoyer:
          CurrentMonthContrats[index].foncier.proprietaire[j]
            .montant_apres_impot,
        tauxRetenueRevFoncier: {
          code: "TSR.10.2018",
        },
      });
    }
  }

  // Annex 1
  // let Annex1 =

  return {
    VersementRASRF: {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
      },
      identifiantFiscal: "IF",
      exerciceFiscalDu: annee + "-" + "1" + "-" + "1",
      // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
      exerciceFiscalAu: annee + "-" + 12 + "-" + 31,
      // exerciceFiscalAu: 2021 + "-" + 12 + "-" + 31,
      annee: currentYear,
      mois: currentMonth,
      totalMntBrutLoyer: TotalMntBrutLoyer,
      totalMntRetenueSource: TotalMntRetenueSource,
      totalMntNetLoyer: TotalMntLoyer,
      listDetailRetenueRevFoncier: {
        DetailRetenueRevFoncier,
      },
    },
  };
}

function CreateAnnex1ObjectFromArchvCompt(archivecomptabilisation , annee) {
  let DetailRetenueRevFoncier = [];
  let TotalMntBrutLoyer = 0;
  let TotalMntRetenueSource = 0;
  let TotalMntLoyer = 0;

  for (
    let i = 0;
    i < archivecomptabilisation.comptabilisation_loyer_crediter.length;
    i++
  ) {
    //Get Total Montant Brut/RS/Aprés l'impot
    TotalMntBrutLoyer +=
      archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_brut;
    TotalMntRetenueSource +=
      archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_tax ||
      0;
    TotalMntLoyer +=
      archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_net;
    //List DetailRetenueRevFoncier
    DetailRetenueRevFoncier.push({
      ifuBailleur: i + 1,
      numCNIBailleur:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].cin,
      numCEBailleur:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].carte_sejour,
      nomPrenomBailleur:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].nom_prenom,
      adresseBailleur:
        archivecomptabilisation.comptabilisation_loyer_crediter[i]
          .adresse_proprietaire,
      adresseBien:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].adresse_lieu,
      typeBienBailleur: {
        code: "LUC",
      },
      mntBrutLoyer:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_brut, //!!!!!!!
      // mntRetenueSource: data[0].retenue_source_par_mois,
      mntRetenueSource:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_tax,
      mntNetLoyer:
        archivecomptabilisation.comptabilisation_loyer_crediter[i].montant_net,
      tauxRetenueRevFoncier: {
        code: "TSR.10.2018",
      },
    });
  }
  // Annex 1
  return {
    VersementRASRF: {
      $: {
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
      },
      identifiantFiscal: "IF",
      exerciceFiscalDu: annee + "-" + "1" + "-" + "1",
      // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
      exerciceFiscalAu: annee + "-" + 12 + "-" + 31,
      // exerciceFiscalAu: 2021 + "-" + 12 + "-" + 31,
      annee: currentYear,
      mois: currentMonth,
      totalMntBrutLoyer: TotalMntBrutLoyer,
      totalMntRetenueSource: TotalMntRetenueSource,
      totalMntNetLoyer: TotalMntLoyer,
      listDetailRetenueRevFoncier: {
        DetailRetenueRevFoncier,
      },
    },
  };
}

module.exports = {
  createAnnex1FromContrat: async (req, res) => {
    let Annex1;
    let CurrentMonthContrats = [];
    let CompareDate;

    archivecomptabilisation
      .find({ mois: req.params.mois, annee: req.params.annee })
      .then((data) => {
        if (data.length > 0) {
          Annex1 = CreateAnnex1ObjectFromArchvCompt(data[0] , req.params.annee);
          res.json(Annex1);
        } else {
          Contrat.find({ deleted: false })
            .populate("foncier")
            .populate({ path: "foncier", populate: { path: "proprietaire" } })
            .limit(2)
            .then((data) => {

              for (let i = 0; i < data.length; i++) {
                // Get the Compare Date between
                // date_comptabilisation / date_premier_paiement / date_debut_loyer
                if (data[i].date_comptabilisation != null) {
                  console.log("test1");
                  CompareDate = new Date(data[i].date_comptabilisation);
                  console.log(CompareDate);
                } else {
                  if (data[i].date_premier_paiement != null) {
                    console.log("test2");
                    CompareDate = new Date(data[i].date_premier_paiement);
                  } else {
                    console.log("test3");
                    CompareDate = new Date(data[i].date_debut_loyer);
                  }
                }
                CompareDate.setMonth(CompareDate.getMonth() - 1);

                if (
                  CompareDate.getMonth() + 1 == req.params.mois &&
                  CompareDate.getFullYear() == req.params.annee
                ) {
                  CurrentMonthContrats.push(data[i]); //!!!!!!!!!!!!!!!!!!!!!!!
                }
              }
              if (CurrentMonthContrats.length > 0) {
                Annex1 = CreateAnnex1objectFromContrat(CurrentMonthContrats , req.params.annee);
                res.json(Annex1);
              }
              else
              res.status(422).json({ message:" Date invalide " });
            })
            .catch((error) => {
              res.status(403).json({ message: error.message });
            });
        }

        // Get the alphabetical month
        let date = new Date(req.params.annee + " / " + req.params.mois+ " / 1")

        const AlphabeticalMonth = date.toLocaleString(
          "default",
          {
            month: "short",
          }
        );

        // // Download the xml file
        // var builder = new xml2js.Builder();
        // var xml = builder.buildObject(Annex1);

        // fs.writeFile(
        //   `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`,
        //   xml,
        //   (error) => {
        //     if (error) {
        //       res.status(403).json({ message: error.message });
        //     } else {
        //       res.download(
        //         `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`
        //       );
        //     }
        //   }
        // );
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });

    // res.send(data);
  },
};
