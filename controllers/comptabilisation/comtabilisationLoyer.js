const fs = require("fs");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");

module.exports = {
  genererComptabilisationLoyer: async (req, res) => {
    //add zeros (0)
    function pad(number, count) {
      return (1e15 + number + "").slice(-count);
    }

    archiveComptabilisation
      .findOne({ mois: req.params.mois, annee: req.params.annee })
      .then((data) => {
        // if (data.length > 0) {
          //traitement du date
          // return res.json(data)
          let dateGenerationVirement = data.date_generation_de_comptabilisation;
          let dateWithSlash =
            "01" +
            "/" +
            ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
            "/" +
            dateGenerationVirement.getFullYear();
          let dateWithDash =
            dateGenerationVirement.getFullYear() +
            "-" +
            ("0" + +(dateGenerationVirement.getMonth() + 1)).slice(-2) +
            "-" +
            "01";
          let dateMonthName = dateGenerationVirement.toLocaleString("default", {
            month: "long",
          });

          // delete data from file if exist
          fs.writeFile(
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
          //ecriture comptable du loyer Sens D
          for (let i = 0; i < data.comptabilisation_loyer_debiter.length; i++) {
            //traitement du montant
            let montantLoyer = data.comptabilisation_loyer_debiter[i].montant;
            let addTwoNumbersAfterComma = montantLoyer.toFixed(2);
            let replacePointWithComma = addTwoNumbersAfterComma.replace(
              ".",
              ","
            );
            let fullMontant = pad(replacePointWithComma, 9);

            //les infos du lieu
            let codeDr, codePv, lieuIntitule;
            codeDr = data.comptabilisation_loyer_debiter[i].direction_regional;
            lieuIntitule = data.comptabilisation_loyer_debiter[i].intitule_lieu;
            if (data.comptabilisation_loyer_debiter[i].point_de_vente == "") {
              codePv = "-|-";
            } else {
              codePv = data.comptabilisation_loyer_debiter[i].point_de_vente;
            }

            //ecriture debiter
            let ecritureDebiterLoyer =
              "FRAIS DE LOYER DU " +
              dateWithSlash +
              "|" +
              dateWithDash +
              " 00:00:00|" +
              dateMonthName.toUpperCase() +
              "-" +
              dateGenerationVirement.getFullYear() +
              "|" +
              dateWithDash +
              " 00:00:00|LOY|PAISOFT|MAD|" +
              lieuIntitule +
              " " +
              dateWithSlash +
              "|01|64200001|-|" +
              codeDr +
              "|" +
              codePv +
              "|" +
              fullMontant +
              "|D|Frais Loyer-|GFL -" +
              (dateGenerationVirement.getMonth() + 1) +
              "-" +
              dateGenerationVirement.getFullYear() +
              "||-\n";
            fs.writeFileSync(
              "download/comptabilisation loyer/FichierComptableLoyer " +
                dateMonthName +
                " " +
                dateGenerationVirement.getFullYear() +
                ".txt",
              ecritureDebiterLoyer,
              { flag: "a" },
              (error) => {
                if (error) res.json({ message: error.message });
              }
            );
          }

          //ecriture comptable Sens C 'Montant Net'
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            //traitement du montant net
            let montantNet =
              data.comptabilisation_loyer_crediter[i].montant_net;
            let addTwoNumbersAfterComma = montantNet.toFixed(2);
            let replacePointWithComma = addTwoNumbersAfterComma.replace(
              ".",
              ","
            );
            let fullMontantNet = pad(replacePointWithComma, 9);

            //infos lieu
            lieuIntitule =
              data.comptabilisation_loyer_crediter[i].intitule_lieu;

            //set proprietaire cin/passport/carte sejour
            let proprietaireIdentifiant;
            if (
              data.comptabilisation_loyer_crediter[i].cin == "" &&
              data.comptabilisation_loyer_crediter[i].passport == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].carte_sejour;
            } else if (
              data.comptabilisation_loyer_crediter[i].passport == "" &&
              data.comptabilisation_loyer_crediter[i].carte_sejour == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].cin;
            } else if (
              data.comptabilisation_loyer_crediter[i].cin == "" &&
              data.comptabilisation_loyer_crediter[i].carte_sejour == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].passport;
            }

            //ecriture crediter du montant net
            let ecritureCrediterDuMontantNetLoyer =
              "FRAIS DE LOYER DU " +
              dateWithSlash +
              "|" +
              dateWithDash +
              " 00:00:00|" +
              dateMonthName.toUpperCase() +
              "-" +
              dateGenerationVirement.getFullYear() +
              "|" +
              dateWithDash +
              " 00:00:00|LOY|PAISOFT|MAD|" +
              dateWithSlash +
              " " +
              lieuIntitule +
              "|01|32700008|-|-|-|" +
              fullMontantNet +
              "|C|Frais Loyer-" +
              proprietaireIdentifiant +
              "|GFL -" +
              (dateGenerationVirement.getMonth() + 1) +
              "-" +
              dateGenerationVirement.getFullYear() +
              "||-\n";
            fs.writeFileSync(
              "download/comptabilisation loyer/FichierComptableLoyer " +
                dateMonthName +
                " " +
                dateGenerationVirement.getFullYear() +
                ".txt",
              ecritureCrediterDuMontantNetLoyer,
              { flag: "a" },
              (error) => {
                if (error) res.json({ message: error.message });
              }
            );
          }

          // ecriture comptable Sens C 'Tax'
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            //traitement du montant de tax
            let montantTax =
              data.comptabilisation_loyer_crediter[i].montant_tax;
            let addTwoNumbersAfterComma = montantTax.toFixed(2);
            let replacePointWithComma = addTwoNumbersAfterComma.replace(
              ".",
              ","
            );
            let fullMontantTax = pad(replacePointWithComma, 9);

            // set proprietaire cin/passport/carte sejour
            let proprietaireIdentifiant;
            if (
              data.comptabilisation_loyer_crediter[i].cin == "" &&
              data.comptabilisation_loyer_crediter[i].passport == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].carte_sejour;
            } else if (
              data.comptabilisation_loyer_crediter[i].passport == "" &&
              data.comptabilisation_loyer_crediter[i].carte_sejour == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].cin;
            } else if (
              data.comptabilisation_loyer_crediter[i].cin == "" &&
              data.comptabilisation_loyer_crediter[i].carte_sejour == ""
            ) {
              proprietaireIdentifiant =
                data.comptabilisation_loyer_crediter[i].passport;
            }

            let ecritureCrediterDuTaxLoyer =
              "FRAIS DE LOYER DU " +
              dateWithSlash +
              "|" +
              dateWithDash +
              " 00:00:00|" +
              dateMonthName.toUpperCase() +
              "-" +
              dateGenerationVirement.getFullYear() +
              "|" +
              dateWithDash +
              " 00:00:00|LOY|PAISOFT|MAD|" +
              dateWithSlash +
              "/" +
              lieuIntitule +
              "|01|32100007|-|-|-|" +
              fullMontantTax +
              "|C|Frais Loyer-" +
              proprietaireIdentifiant +
              "|GFL -" +
              (dateGenerationVirement.getMonth() + 1) +
              "-" +
              dateGenerationVirement.getFullYear() +
              "||-\n";

            fs.writeFileSync(
              "download/comptabilisation loyer/FichierComptableLoyer " +
                dateMonthName +
                " " +
                dateGenerationVirement.getFullYear() +
                ".txt",
              ecritureCrediterDuTaxLoyer,
              { flag: "a" },
              (error) => {
                if (error) res.json({ message: error.message });
              }
            );
          }

          res.download(
            "download/comptabilisation loyer/FichierComptableLoyer " +
              dateMonthName +
              " " +
              dateGenerationVirement.getFullYear() +
              ".txt"
          );
        // } else {
        //   res
        //     .status(204)
        //     .send({ message: "Aucune donnée à afficher dans ce mois" });
        // }
      })
      .catch((error) => {
        res.json({ message: error.message });
      });
  },
};