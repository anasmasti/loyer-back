const xml2js = require("xml2js");
const fs = require("fs");
const archivecomptabilisation = require("../../models/archive/archiveComptabilisation.schema");
const archivevirements = require("../../models/archive/archiveVirement.schema");
const Contrat = require("../../models/contrat/contrat.model");
const Test = require("../../controllers/contrat/get.contrat");
// const Test =
// const Contrat = require("../../controllers/");

module.exports = {
  createAnnex1FromContrat: async (req, res) => {
    let ArchCmptb;
    let DetailRetenueRevFoncier = [];
    let TotalMntBrutLoyer = 0;
    let TotalMntRetenueSource = 0;
    let TotalMntLoyer = 0;

    // Current Date
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;

    // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
    // archivecomptabilisation
    //   .find({ mois: req.params.mois, annee: req.params.annee })
    Contrat.find({ deleted: false })
      .populate("lieu")
      .populate({ path: "lieu", populate: { path: "proprietaire" } })
      .then((data) => {
        if (data.length > 0) {
          // Make data unite ( Calculation )
          for (let index = 0; index < data.length; index++) {
            TotalMntBrutLoyer += data[index].total_montant_brut_loyer;
            TotalMntRetenueSource += data[index].retenue_source_par_mois;
            TotalMntRetenueSource += data[index].total_montant_net_loyer;

            //List DetailRetenueRevFoncier
            for (let j = 0; j < data[index].lieu.proprietaire.length; j++) {
              DetailRetenueRevFoncier.push({
                ifuBailleur: i + 1,
                numCNIBailleur: data[index].lieu.proprietaire[j].cin,
                numCEBailleur: data[index].lieu.proprietaire[j].carte_sejour,
                nomPrenomBailleur: data[index].lieu.proprietaire[j].nom_prenom,
                adresseBailleur: data[index].lieu.proprietaire[j].adresse,
                adresseBien: data[index].lieu.adresse,
                typeBienBailleur: {
                  code: "LUC",
                },
                mntBrutLoyer: data[index].lieu.proprietaire[j].montant_loyer,
                mntRetenueSource:
                  data[index].lieu.proprietaire[j].retenue_source,
                mntNetLoyer:
                  data[index].lieu.proprietaire[j].montant_apres_impot,
                tauxRetenueRevFoncier: {
                  code: "TSR.10.2018",
                },
              });
            }
          }

          // Annex 1
          let Annex1 = {
            VersementRASRF: {
              $: {
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
              },
              identifiantFiscal: "IF",
              exerciceFiscalDu: req.params.annee + "-" + "1" + "-" + "1",
              // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
              exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
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

          // get the alphabetical month
          let dateGenerationComptabilisation = new Date(
            ArchCmptb.date_generation_de_comptabilisation
          );
          const AlphabeticalMonth =
            dateGenerationComptabilisation.toLocaleString("default", {
              month: "short",
            });

          // Download the xml file
          var builder = new xml2js.Builder();
          var xml = builder.buildObject(Annex1);

          fs.writeFile(
            `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`,
            xml,
            (error) => {
              if (error) {
                res.status(403).json({ message: error.message });
              } else {
                res.download(
                  `download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`
                );
              }
            }
          );
        } else {
          // Get the (archivecomptabilisation) data and put it in ArchCmptb variable
          archivecomptabilisation
            .find({ mois: mois, annee: annee })
            .then((data) => {
                ArchCmptb = data[0]
                // Main Method
                for (
                  let i = 0;
                  i < ArchCmptb.comptabilisation_loyer_crediter.length;
                  i++
                ) {
                  //Get Total Montant Brut/RAS/Aprés l'impot
                  TotalMntBrutLoyer +=
                    ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut;
                  TotalMntRetenueSource +=
                    ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax || 0;
                  TotalMntLoyer +=
                    ArchCmptb.comptabilisation_loyer_crediter[i].montant_net;
                  //List DetailRetenueRevFoncier
                  DetailRetenueRevFoncier.push({
                    ifuBailleur: i + 1,
                    numCNIBailleur: ArchCmptb.comptabilisation_loyer_crediter[i].cin,
                    numCEBailleur:
                      ArchCmptb.comptabilisation_loyer_crediter[i].carte_sejour,
                    nomPrenomBailleur:
                      ArchCmptb.comptabilisation_loyer_crediter[i].nom_prenom,
                    adresseBailleur:
                      ArchCmptb.comptabilisation_loyer_crediter[i].adresse_proprietaire,
                    adresseBien:
                      ArchCmptb.comptabilisation_loyer_crediter[i].adresse_lieu,
                    typeBienBailleur: {
                      code: "LUC",
                    },
                    mntBrutLoyer:
                      ArchCmptb.comptabilisation_loyer_crediter[i].montant_brut, //!!!!!!!
                    // mntRetenueSource: data[0].retenue_source_par_mois,
                    mntRetenueSource:
                      ArchCmptb.comptabilisation_loyer_crediter[i].montant_tax,
                    mntNetLoyer:
                      ArchCmptb.comptabilisation_loyer_crediter[i].montant_net,
                    tauxRetenueRevFoncier: {
                      code: "TSR.10.2018",
                    },
                  });
                }
                // Annex 1
                let Annex1 = {
                  VersementRASRF: {
                    $: {
                      "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                      "xsi:noNamespaceSchemaLocation": "VersementRASRF.xsd",
                    },
                    identifiantFiscal: "IF",
                    exerciceFiscalDu: req.params.annee + "-" + "1" + "-" + "1",
                    // exerciceFiscalDu: "2021" + "-" + "1" + "-" + "1",
                    exerciceFiscalAu: req.params.annee + "-" + 12 + "-" + 31,
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
                // get the alphabetical month
                let dateGenerationComptabilisation = new Date(ArchCmptb.date_generation_de_comptabilisation)
                const AlphabeticalMonth = dateGenerationComptabilisation.toLocaleString("default", { month: "short" });
                // Download the xml file
                var builder = new xml2js.Builder();
                var xml = builder.buildObject(Annex1);
                fs.writeFile(`download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`, xml, (error) => {
                  if (error) {
                    res.status(403).json({ message: error.message });
                  } else {
                    res.download(`download/les maquettes DGI/annex 1/Annex1-${AlphabeticalMonth}-${dateGenerationComptabilisation.getFullYear()}.xml`);
                  }
                });
            })
            .catch((error) => {
              res.status(403).json({ message: error.message });
            });
        }

        // res.send(data);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  },
};
