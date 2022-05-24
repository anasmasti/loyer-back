const fs = require("fs");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");

module.exports = {
  genererComptabilisationLoyer: async (req, res) => {
    //add zeros (0)
    function pad(number, count) {
      return number.padStart(9, 0);
    }

    function generateLignComptable(
      comptabilisation_loyer_crediter,
      Sens,
      dateWithSlash,
      dateWithDash,
      time,
      dateGenerationVirement,
      dateMonthName
    ) {
      //traitement du montant
      let montantLoyer = 0;
      let isMntZero = false;
      let sens;
      let code;
      switch (Sens) {
        case "D":
          montantLoyer = comptabilisation_loyer_crediter.montant_brut;
          isMntZero =
            comptabilisation_loyer_crediter.montant_brut == 0 ? true : false;
          sens = "D";
          code = "64200001";
          break;
        case "C Tax":
          montantLoyer = comptabilisation_loyer_crediter.montant_tax;
          isMntZero =
            comptabilisation_loyer_crediter.montant_tax == 0 ? true : false;
          sens = "C";
          code = "32100007";
          break;
        case "C Net":
          montantLoyer = comptabilisation_loyer_crediter.montant_net;
          isMntZero =
            comptabilisation_loyer_crediter.montant_net == 0 ? true : false;
          sens = "C";
          code = "32700008";
          break;
      }
      let addTwoNumbersAfterComma = montantLoyer.toFixed(2);
      let replacePointWithComma = addTwoNumbersAfterComma.replace(".", ",");
      let fullMontant = pad(replacePointWithComma, 9);
      let numeroContrat = comptabilisation_loyer_crediter.numero_contrat;

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
        (codeDr != null && sens == "D" ? codeDr : "-") +
        "|" +
        (codePv != null && sens == "D" ? codePv : "-") +
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
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            await generateLignComptable(
              data.comptabilisation_loyer_crediter[i],
              "D",
              dateWithSlash,
              dateWithDash,
              time,
              dateGenerationVirement,
              dateMonthName
            );
          }

          //ecriture comptable du loyer Sens D
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            await generateLignComptable(
              data.comptabilisation_loyer_crediter[i],
              "C Net",
              dateWithSlash,
              dateWithDash,
              time,
              dateGenerationVirement,
              dateMonthName
            );
          }

          //ecriture comptable du loyer Sens D
          for (
            let i = 0;
            i < data.comptabilisation_loyer_crediter.length;
            i++
          ) {
            await generateLignComptable(
              data.comptabilisation_loyer_crediter[i],
              "C Tax",
              dateWithSlash,
              dateWithDash,
              time,
              dateGenerationVirement,
              dateMonthName
            );
          }

          // //ecriture comptable du loyer Sens D
          // for (let i = 0; i < data.comptabilisation_loyer_debiter.length; i++) {
          //   //traitement du montant
          //   let montantLoyer = data.comptabilisation_loyer_debiter[i].montant;
          //   let addTwoNumbersAfterComma = montantLoyer.toFixed(2);
          //   let replacePointWithComma = addTwoNumbersAfterComma.replace(
          //     ".",
          //     ","
          //   );
          //   let fullMontant = pad(replacePointWithComma, 9);
          //   let numeroContrat =
          //     data.comptabilisation_loyer_crediter[i].numero_contrat;

          //   //les infos du lieu
          //   let codeDr, codePv, lieuIntitule;
          //   codeDr = data.comptabilisation_loyer_debiter[i].direction_regional;
          //   lieuIntitule = data.comptabilisation_loyer_debiter[i].intitule_lieu;
          //   if (data.comptabilisation_loyer_debiter[i].point_de_vente == "") {
          //     codePv = "-|-";
          //   } else {
          //     codePv = data.comptabilisation_loyer_debiter[i].point_de_vente;
          //   }

          //   //set proprietaire cin/passport/carte sejour
          //   let proprietaireIdentifiant;
          //   if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].passport == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].carte_sejour;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].passport == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].cin;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].passport;
          //   }

          //   //ecriture debiter
          //   let ecritureDebiterLoyer =
          //     "FBPMC" +
          //     "|" +
          //     "A" +
          //     "|" +
          //     "FRAIS DE LOYER DU " +
          //     dateWithSlash +
          //     "|" +
          //     dateWithDash +
          //     ` ${time}|` +
          //     dateMonthName.toUpperCase() +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "|" +
          //     dateWithDash +
          //     " 00:00:00|LOY|PAISOFT|MAD|" +
          //     "COMPTABILISATION/" +
          //     dateWithSlash +
          //     "|01|64200001|-|" +
          //     codeDr +
          //     "|" +
          //     codePv +
          //     "|-|-|-|-|-|-|-|-|" +
          //     fullMontant +
          //     "|D|" +
          //     numeroContrat +
          //     "-" +
          //     proprietaireIdentifiant +
          //     "|GFL " +
          //     ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "||-\r\n";
          //   fs.writeFileSync(
          //     "download/comptabilisation loyer/FichierComptableLoyer " +
          //       dateMonthName +
          //       " " +
          //       dateGenerationVirement.getFullYear() +
          //       ".txt",
          //     ecritureDebiterLoyer,
          //     { flag: "a" },
          //     (error) => {
          //       if (error) res.json({ message: error.message });
          //     }
          //   );
          // }

          // //ecriture comptable Sens C 'Montant Net'
          // for (
          //   let i = 0;
          //   i < data.comptabilisation_loyer_crediter.length;
          //   i++
          // ) {
          //   //traitement du montant net
          //   let montantNet =
          //     data.comptabilisation_loyer_crediter[i].montant_net;
          //   let addTwoNumbersAfterComma = montantNet.toFixed(2);
          //   let replacePointWithComma = addTwoNumbersAfterComma.replace(
          //     ".",
          //     ","
          //   );
          //   let fullMontantNet = pad(replacePointWithComma, 9);
          //   let numeroContrat =
          //     data.comptabilisation_loyer_crediter[i].numero_contrat;

          //   //les infos du lieu
          //   let codeDr, codePv, lieuIntitule;
          //   codeDr = data.comptabilisation_loyer_debiter[i].direction_regional;
          //   lieuIntitule = data.comptabilisation_loyer_debiter[i].intitule_lieu;
          //   if (data.comptabilisation_loyer_debiter[i].point_de_vente == "") {
          //     codePv = "-|-";
          //   } else {
          //     codePv = data.comptabilisation_loyer_debiter[i].point_de_vente;
          //   }

          //   //set proprietaire cin/passport/carte sejour
          //   let proprietaireIdentifiant;
          //   if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].passport == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].carte_sejour;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].passport == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].cin;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].passport;
          //   }

          //   //ecriture crediter du montant net
          //   let ecritureCrediterDuMontantNetLoyer =
          //     "FBPMC" +
          //     "|" +
          //     "A" +
          //     "|" +
          //     "FRAIS DE LOYER DU " +
          //     dateWithSlash +
          //     "|" +
          //     dateWithDash +
          //     " 00:00:00|" +
          //     dateMonthName.toUpperCase() +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "|" +
          //     dateWithDash +
          //     " 00:00:00|LOY|PAISOFT|MAD|" +
          //     "COMPTABILISATION/" +
          //     dateWithSlash +
          //     "|01|32700007|-|" +
          //     codeDr +
          //     "|" +
          //     codePv +
          //     "|-|-|-|-|-|-|-|-|" +
          //     fullMontantNet +
          //     "|C|" +
          //     numeroContrat +
          //     "-" +
          //     proprietaireIdentifiant +
          //     "|GFL " +
          //     ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "|-|-\r\n";
          //   fs.writeFileSync(
          //     "download/comptabilisation loyer/FichierComptableLoyer " +
          //       dateMonthName +
          //       " " +
          //       dateGenerationVirement.getFullYear() +
          //       ".txt",
          //     ecritureCrediterDuMontantNetLoyer,
          //     { flag: "a" },
          //     (error) => {
          //       if (error) res.json({ message: error.message });
          //     }
          //   );
          // }

          // // ecriture comptable Sens C 'Tax'
          // for (
          //   let i = 0;
          //   i < data.comptabilisation_loyer_crediter.length;
          //   i++
          // ) {
          //   //traitement du montant de tax
          //   let montantTax =
          //     data.comptabilisation_loyer_crediter[i].montant_tax;
          //   let addTwoNumbersAfterComma = montantTax.toFixed(2);
          //   let replacePointWithComma = addTwoNumbersAfterComma.replace(
          //     ".",
          //     ","
          //   );
          //   let fullMontantTax = pad(replacePointWithComma, 9);
          //   let numeroContrat =
          //     data.comptabilisation_loyer_crediter[i].numero_contrat;
          //   // set proprietaire cin/passport/carte sejour
          //   let proprietaireIdentifiant;
          //   if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].passport == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].carte_sejour;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].passport == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].cin;
          //   } else if (
          //     data.comptabilisation_loyer_crediter[i].cin == "" &&
          //     data.comptabilisation_loyer_crediter[i].carte_sejour == ""
          //   ) {
          //     proprietaireIdentifiant =
          //       data.comptabilisation_loyer_crediter[i].passport;
          //   }

          //   let ecritureCrediterDuTaxLoyer =
          //     "FBPMC" +
          //     "|" +
          //     "A" +
          //     "|" +
          //     "FRAIS DE LOYER DU " +
          //     dateWithSlash +
          //     "|" +
          //     dateWithDash +
          //     " 00:00:00|" +
          //     dateMonthName.toUpperCase() +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "|" +
          //     dateWithDash +
          //     " 00:00:00|LOY|PAISOFT|MAD|" +
          //     "COMPTABILISATION/" +
          //     dateWithSlash +
          //     "|01|32700007|-|-|-|-|-|-|-|-|-|-|-|" +
          //     fullMontantTax +
          //     "|C|" +
          //     numeroContrat +
          //     "-" +
          //     proprietaireIdentifiant +
          //     "|GFL " +
          //     ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
          //     "-" +
          //     dateGenerationVirement.getFullYear() +
          //     "|-|-\r\n";

          //   fs.writeFileSync(
          //     "download/comptabilisation loyer/FichierComptableLoyer " +
          //       dateMonthName +
          //       " " +
          //       dateGenerationVirement.getFullYear() +
          //       ".txt",
          //     ecritureCrediterDuTaxLoyer,
          //     { flag: "a" },
          //     (error) => {
          //       if (error) res.json({ message: error.message });
          //     }
          //   );
          // }

          res.download(
            "download/comptabilisation loyer/FichierComptableLoyer " +
              dateMonthName +
              " " +
              dateGenerationVirement.getFullYear() +
              ".txt"
          );
        }
        // else {
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
