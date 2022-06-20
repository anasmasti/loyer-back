const fs = require("fs");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");

module.exports = {
  genererComptabilisationLoyer: async (req, res) => {
    //add zeros (0)
    function pad(number, count) {
      return number.padStart(9, 0);
    }

    let dateGenerationVirement = new Date(
      `${req.params.annee}/${req.params.mois}/01`
    );
    let dateWithSlash =
      "01" +
      "/" +
      ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
      "/" +
      dateGenerationVirement.getFullYear();
    let time = "00:00:00";
    let dateWithDash =
      dateGenerationVirement.getFullYear() +
      "-" +
      ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
      "-" +
      "01";
    let dateMonthName = dateGenerationVirement.toLocaleString("default", {
      month: "long",
    });

    function generateLignComptable(
      comptabilisation_loyer_crediter,
      sens,
      code,
      montant
    ) {
      //traitement du montant
      let isMntZero = montant == 0 ? true : false;
      let addTwoNumbersAfterComma = montant.toFixed(2);
      let replacePointWithComma = addTwoNumbersAfterComma.replace(".", ",");
      let fullMontant = pad(replacePointWithComma, 9);

      //les infos du lieu
      let codeDr, codePv, lieuIntitule;
      codeDr = comptabilisation_loyer_crediter.direction_regional;
      lieuIntitule = comptabilisation_loyer_crediter.intitule_lieu;
      if (comptabilisation_loyer_crediter.point_de_vente == "") {
        codePv = "-|-";
      } else {
        codePv = comptabilisation_loyer_crediter.point_de_vente;
      }

      //set proprietaire cin/passport/carte sejour
      let proprietaireIdentifiant;
      if (
        comptabilisation_loyer_crediter.cin == "" &&
        comptabilisation_loyer_crediter.passport == ""
      ) {
        proprietaireIdentifiant = comptabilisation_loyer_crediter.carte_sejour;
      } else if (
        comptabilisation_loyer_crediter.passport == "" &&
        comptabilisation_loyer_crediter.carte_sejour == ""
      ) {
        proprietaireIdentifiant = comptabilisation_loyer_crediter.cin;
      } else if (
        comptabilisation_loyer_crediter.cin == "" &&
        comptabilisation_loyer_crediter.carte_sejour == ""
      ) {
        proprietaireIdentifiant = comptabilisation_loyer_crediter.passport;
      } else {
        proprietaireIdentifiant = comptabilisation_loyer_crediter.cin;
      }

      // Generate numero contrat 'Rappel'
      let numeroContrat = comptabilisation_loyer_crediter.numero_contrat;

      if (comptabilisation_loyer_crediter.is_overdued) {
        if (comptabilisation_loyer_crediter.is_annee_antr) {
          numeroContrat = `Rap/EA-${numeroContrat}`;
        } else {
          numeroContrat = `Rappel-${numeroContrat}`;
        }
      }

      //ecriture debiter
      let ecritureLoyer =
        "FBPMC" +
        "|" +
        "A" +
        "|" +
        "FRAIS DE LOYER DU " +
        dateWithSlash +
        "|" +
        dateWithDash +
        ` ${time}|` +
        dateMonthName.toUpperCase() +
        "-" +
        dateGenerationVirement.getFullYear() +
        "|" +
        dateWithDash +
        " 00:00:00|LOY|PAISOFT|MAD|" +
        "COMPTABILISATION/" +
        dateWithSlash +
        "|01|" +
        code +
        "|-|" +
        (codeDr != null && (code == "64200001" || code == "64290001")
          ? codeDr
          : "-") +
        "|" +
        (codePv != null && (code == "64200001" || code == "64290001")
          ? codePv
          : "-") +
        "|-|-|-|-|-|-|-|-|" +
        fullMontant +
        "|" +
        sens +
        "|" +
        numeroContrat +
        "-" +
        proprietaireIdentifiant +
        "|GFL " +
        ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
        "-" +
        dateGenerationVirement.getFullYear() +
        "|-|-\r\n";

      if (!isMntZero) {
        fs.writeFileSync(
          "download/comptabilisation loyer/FichierComptableLoyer " +
            dateMonthName +
            " " +
            dateGenerationVirement.getFullYear() +
            ".txt",
          ecritureLoyer,
          { flag: "a" },
          (error) => {
            if (error) res.json({ message: error.message });
          }
        );
      }
    }

    archiveComptabilisation
      .findOne({ mois: req.params.mois, annee: req.params.annee })
      .sort({ updatedAt: "desc" })
      .then(async (data) => {
        if (data) {
          //traitement du date
          // return res.json(data);
          // let dateGenerationVirement = data.date_generation_de_comptabilisation;

          // delete data from file if exist
          await fs.writeFile(
            "download/comptabilisation loyer/FichierComptableLoyer " +
              dateMonthName +
              " " +
              dateGenerationVirement.getFullYear() +
              ".txt",
            "",
            { flag: "w" },
            (error) => {
              if (error) throw error;
            }
          );

          console.log("headerOrdreVirement");

          //ecriture comptable du loyer Sens D
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (!data.comptabilisation_loyer_crediter[i].is_overdued) {
              let montant =
                data.comptabilisation_loyer_crediter[i].montant_brut_loyer == 0
                  ? data.comptabilisation_loyer_crediter[i]
                      .montant_avance_proprietaire
                  : data.comptabilisation_loyer_crediter[i].montant_brut_loyer;
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "D",
                "64200001",
                montant
              );
            }
          }

          //ecriture comptable du loyer Sens C net
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (!data.comptabilisation_loyer_crediter[i].is_overdued) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32700008",
                data.comptabilisation_loyer_crediter[i]
                  .montant_net_without_caution
              );
            }
          }

          //ecriture comptable du loyer Sens C tax
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (!data.comptabilisation_loyer_crediter[i].is_overdued) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32100007",
                data.comptabilisation_loyer_crediter[i].montant_tax
              );
            }
          }

          //ecriture comptable du loyer Sens D caution
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (!data.comptabilisation_loyer_crediter[i].is_overdued) {
              if (data.comptabilisation_loyer_crediter[i].montant_caution > 0) {
                await generateLignComptable(
                  data.comptabilisation_loyer_crediter[i],
                  "D",
                  "31500003",
                  data.comptabilisation_loyer_crediter[i].montant_caution
                );
              }
            }
          }

          //ecriture comptable du loyer Sens C caution
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].montant_caution > 0 &&
              !data.comptabilisation_loyer_crediter[i].is_overdued
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32700008",
                data.comptabilisation_loyer_crediter[i].montant_caution
              );
            }
          }

          // :::::::::::::::::::::::::::::::::::: Rappel (same year) ::::::::::::::::::::::::::::::::::::

          //ecriture comptable du loyer Sens D
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              !data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "D",
                "64200001",
                data.comptabilisation_loyer_crediter[i].montant_brut
              );
            }
          }

          //ecriture comptable du loyer Sens C net
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              !data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32700008",
                data.comptabilisation_loyer_crediter[i].montant_net
              );
            }
          }

          //ecriture comptable du loyer Sens C tax
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              !data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32100007",
                data.comptabilisation_loyer_crediter[i].montant_tax
              );
            }
          }

          // :::::::::::::::::::::::::::::::::::: Rappel (previous years) ::::::::::::::::::::::::::::::::::::

          //ecriture comptable du loyer Sens D
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "D",
                "64290001",
                data.comptabilisation_loyer_crediter[i].montant_brut
              );
            }
          }

          //ecriture comptable du loyer Sens C net
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32700008",
                data.comptabilisation_loyer_crediter[i].montant_net
              );
            }
          }

          //ecriture comptable du loyer Sens C tax
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            if (
              data.comptabilisation_loyer_crediter[i].is_overdued &&
              data.comptabilisation_loyer_crediter[i].is_annee_antr
            ) {
              await generateLignComptable(
                data.comptabilisation_loyer_crediter[i],
                "C",
                "32100007",
                data.comptabilisation_loyer_crediter[i].montant_tax
              );
            }
          }

          res.download(
            "download/comptabilisation loyer/FichierComptableLoyer " +
              dateMonthName +
              " " +
              dateGenerationVirement.getFullYear() +
              ".txt"
          );
        }
      })
      .catch((error) => {
        res.json({ message: error.message });
      });
  },
};
