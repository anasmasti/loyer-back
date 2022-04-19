const fs = require("fs");
const archiveOrdreVirement = require("../../models/archive/archiveVirement.schema");
module.exports = {
  genererOrdreVirement: async (req, res) => {
    //add zeros (0)
    // function pad(number, count) {
    //     return (1e15 + number + '').slice(-count);
    // }

    archiveOrdreVirement
      .findOne({ mois: req.params.mois, annee: req.params.annee })
      .then((data) => {
        // let data = data_[0]
        // return res.json(data)
        //traitement du date
        let result = [];
        let totalMontantsNet = 0;
        let zoneInitialiseSpace = " ";
        let dateGenerationVirement = data.date_generation_de_virement;
        let currentDate = new Date();
        let dateGenerationFichier = `${("0" + currentDate.getDate()).slice(
          -2
        )}${("0" + (dateGenerationVirement.getMonth() + 1)).slice(
          -2
        )}${currentDate.getFullYear().toString().slice(-1)}`;
        let dateGenerationVirementToString =
          "01" +
          ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
          dateGenerationVirement.getFullYear();
        // let dateWithoutDay =
        //   ("0" + (dateGenerationVirement.getMonth() + 1)).slice(-2) +
        //   dateGenerationVirement.getFullYear();
        let dateWithoutDay =
          ("0" + req.params.mois).slice(-2) + req.params.annee;
        let dateMonthName = dateGenerationVirement.toLocaleString("default", {
          month: "long",
        });

        //delete data from file if exist
        fs.writeFile(
          "download/ordre virement/Ordre Virement " +
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

        // Entee du fichier ordre de virement
        let headerOrdreVirement =
          "0302" +
          zoneInitialiseSpace.padEnd(16, " ") +
          "1" +
          zoneInitialiseSpace.padEnd(4, " ") +
          // dateGenerationVirementToString +
          dateGenerationFichier +
          "FBP. Micro-Crédit  " +
          zoneInitialiseSpace.padEnd(18, " ") +
          "Fra.LY" +
          (("0" + req.params.mois).slice(-2) + req.params.annee.toString().slice(-2)) +
          zoneInitialiseSpace.padEnd(9, " ") +
          "0000000000000000" +
          ")" +
          "2" +
          zoneInitialiseSpace.padEnd(45, " ") +
          "00000" +
          "000" +
          "00" +
          zoneInitialiseSpace.padEnd(1, " ") +
          "\r\n";

        fs.writeFileSync(
          "download/ordre virement/Ordre Virement " +
            dateMonthName +
            " " +
            dateGenerationVirement.getFullYear() +
            ".txt",
          headerOrdreVirement,
          { flag: "a" },
          (error) => {
            if (error){
              res.json({ message: error.message });
            } 
          }
        );

        //set virement informations
        for (let i = 0; i < data.ordre_virement.length; i++) {
          //traitement du montant Net
          let montantNet = data.ordre_virement[i].montant_net;
          totalMontantsNet += montantNet;
          let addTwoNumbersAfterComma = montantNet.toFixed(2);
          let removePointFromMontant = addTwoNumbersAfterComma.replace(".", "");
          let fullMontant = removePointFromMontant.toString();

          // traitement d'identifiant du proprietaire
          let proprietaireIdentifiant;
          if (
            data.ordre_virement[i].cin == "" &&
            data.ordre_virement[i].passport == ""
          ) {
            proprietaireIdentifiant = data.ordre_virement[i].carte_sejour;
          } else if (
            data.ordre_virement[i].passport == "" &&
            data.ordre_virement[i].carte_sejour == ""
          ) {
            proprietaireIdentifiant = data.ordre_virement[i].cin;
          } else if (
            data.ordre_virement[i].cin == "" &&
            data.ordre_virement[i].carte_sejour == ""
          ) {
            proprietaireIdentifiant = data.ordre_virement[i].passport;
          } else if (
            data.ordre_virement[i].cin != "" &&
            data.ordre_virement[i].passport != ""
          ) {
            proprietaireIdentifiant = data.ordre_virement[i].cin;
          }

          //informations proprietaire
          let nomAndPrenom = data.ordre_virement[i].nom_prenom;
          let numeroCompteBancaire = data.ordre_virement[
            i
          ].numero_compte_bancaire.substring(6, 22);
          let banqueRib = data.ordre_virement[
            i
          ].numero_compte_bancaire.substring(0, 3);
          let villeRib = data.ordre_virement[
            i
          ].numero_compte_bancaire.substring(3, 6);
          let cleRib = data.ordre_virement[i].numero_compte_bancaire.substring(
            22,
            24
          );
          let nomAgenceBancaire = data.ordre_virement[i].nom_agence_bancaire;

          // let ecritureOrdreVirement = '0602' + zoneInitialiseSpace.padStart(14, ' ') + proprietaireIdentifiant.padEnd(12, ' ') + nomAndPrenom.padEnd(24, ' ') + nomAgenceBancaire.padEnd(20, ' ') + zoneInitialiseSpace.padEnd(12, ' ') + numeroCompteBancaire.padEnd(16, ' ') + fullMontant.padEnd(16, ' ') + ')' + zoneInitialiseSpace.padEnd(12, ' ') + 'LOYER' + dateWithoutDay.padEnd(13, ' ') + banqueRib + villeRib + cleRib + zoneInitialiseSpace + '\r\n'
          let ecritureOrdreVirement =
            "0602" +
            zoneInitialiseSpace.padStart(14, " ") +
            proprietaireIdentifiant.padEnd(12, " ") +
            nomAndPrenom.padEnd(24, " ") +
            (nomAgenceBancaire == null
              ? zoneInitialiseSpace.padEnd(20, " ")
              : nomAgenceBancaire.padEnd(20, " ")) +
            zoneInitialiseSpace.padEnd(12, " ") +
            (numeroCompteBancaire == null
              ? zoneInitialiseSpace.padEnd(16, " ")
              : numeroCompteBancaire.padEnd(16, " ")) +
            // numeroCompteBancaire.padEnd(13, " ") +
            // fullMontant.padEnd(16, " ") +
            fullMontant.padStart(16, 0) +
            ")" +
            zoneInitialiseSpace.padEnd(12, " ") +
            "LOYER " +
            dateWithoutDay.padEnd(13, " ") +
            (banqueRib == null
              ? zoneInitialiseSpace.padEnd(5, " ")
              : banqueRib.padStart(5, 0)) +
            (villeRib == null
              ? zoneInitialiseSpace.padEnd(3, " ")
              : villeRib.padEnd(3, " ")) +
            (cleRib == null
              ? zoneInitialiseSpace.padEnd(2, " ")
              : cleRib.padEnd(2, " ")) +
            zoneInitialiseSpace +
            "\r\n";

          fs.writeFileSync(
            "download/ordre virement/Ordre Virement " +
              dateMonthName +
              " " +
              dateGenerationVirement.getFullYear() +
              ".txt",
            ecritureOrdreVirement,
            { flag: "a" },
            (error) => {
              if (error) res.json({ message: error.message });
            }
          );
        }


        totalMontantsNet = totalMontantsNet.toFixed(2);
        let footerOrdreVirement =
          "0802" +
          zoneInitialiseSpace.padEnd(98, " ") +
          totalMontantsNet.toString().replace(".", "").padStart(16, 0) +
          zoneInitialiseSpace.padEnd(42, " ");

        fs.writeFileSync(
          "download/ordre virement/Ordre Virement " +
            dateMonthName +
            " " +
            dateGenerationVirement.getFullYear() +
            ".txt",
          footerOrdreVirement,
          { flag: "a" },
          (error) => {
            if (error) res.json({ message: error.message });
          }
        );
        res.download(
          "download/ordre virement/Ordre Virement " +
            dateMonthName +
            " " +
            dateGenerationVirement.getFullYear() +
            ".txt"
        );
      });
  },
};
