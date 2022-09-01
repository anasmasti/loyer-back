const fs = require("fs");
const archiveOrdreVirement = require("../../models/archive/archiveVirement.schema");
const Signaletique = require("../../models/signaletique/signaletique.schema");

module.exports = {
  genererOrdreVirement: async (req, res) => {
    archiveOrdreVirement
      .findOne({ mois: req.params.mois, annee: req.params.annee })
      .then(async (data) => {
        //traitement du date
        let ordreVirementCalculé = [];
        let totalMontantsNet = 0;
        var zoneInitialiseSpace = " ";
        let signaletique = await Signaletique.findOne({
          deleted: false,
          active: true,
        });

        let numeroCompteBancaire = signaletique.rib.substring(6, 22);
        let banqueRib = signaletique.rib.substring(0, 3);
        let villeRib = signaletique.rib.substring(3, 6);
        let cleRib = signaletique.rib.substring(22, 24);

        let dateGenerationVirement = new Date(`${req.params.annee}-${req.params.mois}-01`);
        let currentDate = new Date();
        let dateGenerationFichier = `${("0" + currentDate.getDate()).slice(
          -2
        )}${("0" + (currentDate.getMonth() + 1)).slice(-2)}${currentDate
          .getFullYear()
          .toString()
          .slice(-1)}`;

        let dateWithoutDay =
          ("0" + req.params.mois).slice(-2) + req.params.annee;
        let dateMonthName = dateGenerationVirement.toLocaleString("default", {
          month: "long",
        });

        //delete data from file if exist
        await fs.writeFile(
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

        await new Promise((resolve) => setTimeout(resolve, 100));

        // Entee du fichier ordre de virement
        let headerOrdreVirement =
          "0302" +
          zoneInitialiseSpace.padEnd(16, " ") +
          "1" +
          zoneInitialiseSpace.padEnd(4, " ") +
          dateGenerationFichier +
          signaletique.raison_sociale.padEnd(24, " ") +
          zoneInitialiseSpace.padEnd(13, " ") +
          "Fra.LY" +
          (("0" + req.params.mois).slice(-2) +
            req.params.annee.toString().slice(-2)) +
          zoneInitialiseSpace.padEnd(9, " ") +
          numeroCompteBancaire +
          ")" +
          "2" +
          zoneInitialiseSpace.padEnd(45, " ") +
          "00" + banqueRib +
          villeRib +
          cleRib +
           "\r\n";

        await new Promise((resolve) => setTimeout(resolve, 100));

        await fs.writeFileSync(
          "download/ordre virement/Ordre Virement " +
            dateMonthName +
            " " +
            dateGenerationVirement.getFullYear() +
            ".txt",
          headerOrdreVirement,
          { flag: "a" },
          (error) => {
            if (error) {
              res.json({ message: error.message });
            }
          }
        );

        //set virement informations
        for (let i = 0; i < data.ordre_virement.length; i++) {
          let fullMontant;
          let montantGlobal = 0;

          // traitement d'identifiant du proprietaire
          let proprietaireIdentifiant = '';
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
          } else if (
            data.ordre_virement[i].cin != "" &&
            data.ordre_virement[i].carte_sejour != ""
          ) {
            proprietaireIdentifiant = data.ordre_virement[i].cin;
          } else if (
            data.ordre_virement[i].cin != "" &&
            data.ordre_virement[i].carte_sejour != "" &&
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

          for (let j = 0; j < data.ordre_virement.length; j++) {
            if (
              data.ordre_virement[i].cin == data.ordre_virement[j].cin &&
              data.ordre_virement[i].numero_contrat ==
                data.ordre_virement[j].numero_contrat &&
              !ordreVirementCalculé.includes(
                `${data.ordre_virement[i].cin}-${data.ordre_virement[i].numero_contrat}`
              )
            ) {
              //traitement du montant Net
              let montantNet = data.ordre_virement[j].montant_net;
              totalMontantsNet += montantNet;
              montantGlobal += montantNet;
              let addTwoNumbersAfterComma = montantGlobal.toFixed(2);
              let removePointFromMontant = addTwoNumbersAfterComma.replace(
                ".",
                ""
              );
              fullMontant = removePointFromMontant.toString();
            }
          }

          if (
            !ordreVirementCalculé.includes(
              `${data.ordre_virement[i].cin}-${data.ordre_virement[i].numero_contrat}`
            )
          ) {
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
              fullMontant.padStart(16, 0) +
              ")" +
              zoneInitialiseSpace.padEnd(12, " ") +
              "LOYER " +
              dateWithoutDay.padEnd(12, " ") +
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

            await fs.writeFileSync(
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

            ordreVirementCalculé.push(
              `${data.ordre_virement[i].cin}-${data.ordre_virement[i].numero_contrat}`
            );
            montantGlobal = 0;
          }
        }

        totalMontantsNet = totalMontantsNet.toFixed(2);
        let footerOrdreVirement =
          "0802" +
          zoneInitialiseSpace.padEnd(98, " ") +
          totalMontantsNet.toString().replace(".", "").padStart(16, 0) +
          zoneInitialiseSpace.padEnd(42, " ");

        await new Promise((resolve) => setTimeout(resolve, 100));

        await fs.writeFileSync(
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
      })
      .catch((error) => {
        console.log(error.message);
        res.status(402).send({
          message:
            "Aucun fichier a exporter sur cette date, merci de réessayer avec une autre date.",
        });
      });
  },
};