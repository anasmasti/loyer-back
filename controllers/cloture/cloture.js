const Contrat = require("../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../models/archive/archiveComptabilisation.schema");

module.exports = {
  clotureDuMois: async (req, res, next) => {
    let comptabilisationLoyerCrediter = [], montantDebiter = 0, comptabilisationLoyerDebiter = [], ordreVirement = [];

    //get current contrat of this month
    let contrat = await Contrat.find({
      deleted: false,
      "etat_contrat.libelle": { $in: ["Actif", "Résilié"] },
    })
      .populate("lieu")
      .populate({ path: "lieu", populate: { path: "proprietaire" } });

    // return res.json(contrat);

    //traitement pour date generation de comptabilisation
    let dateGenerationDeComptabilisation = null;
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
      let dateDebutLoyer = new Date(contrat[i].date_debut_loyer);
      let premierDateDePaiement = new Date(contrat[i].date_premier_paiement);
      let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation);
      let dateFinDeContrat = contrat[i].date_fin_contrat;
      let montant_avance_net = 0,
        montant_avance_brut = 0,
        montant_loyer_net = 0,
        montant_loyer_brut = 0;

      //traitement pour comptabiliser les contrats Actif
      if (contrat[i].etat_contrat.libelle == "Actif") {
        //traitement du periodicite Mensuelle
        if (contrat[i].periodicite_paiement == "mensuelle") {
          if (
            contrat[i].montant_avance > 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaires;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire;
                }

                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_avance_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_net: montant_avance_net,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_brut: montant_avance_brut,
                  date_comptabilisation: dateDebutLoyer,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              { date_comptabilisation: null, caution_versee: true }
            );
          }
          if (
            contrat[i].montant_avance == 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].catre_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: dateDebutLoyer,
                });

              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDebutLoyer.setMonth(
              dateDebutLoyer.getMonth() + 1
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == premierDateDePaiement.getMonth() + 1 &&
            req.body.annee == premierDateDePaiement.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                let dateDeComptabilisation = premierDateDePaiement;
                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: dateDeComptabilisation,
                });

              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = premierDateDePaiement.setMonth(
              premierDateDePaiement.getMonth() + 1
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
            req.body.annee == dateDeComptabilisation.getFullYear() &&
            req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
            req.body.annee <= dateFinDeContrat.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire.carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });
                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: dateDeComptabilisation,
                });

              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDeComptabilisation.setMonth(
              dateDeComptabilisation.getMonth() + 1
            );

            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
        }

        //traitement du periodicite trimestrielle
        if (contrat[i].periodicite_paiement == "trimestrielle") {
          if (
            contrat[i].montant_avance > 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaires;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_avance_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_brut: montant_avance_brut,
                  montant_net: montant_avance_net,
                  date_comptabilisation: dateDebutLoyer,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              { date_comptabilisation: null, caution_versee: true }
            );
          }
          if (
            contrat[i].montant_avance == 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: dateDebutLoyer,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDebutLoyer.setMonth(
              dateDebutLoyer.getMonth() + 3
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == premierDateDePaiement.getMonth() + 1 &&
            req.body.annee == premierDateDePaiement.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                })
                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: premierDateDePaiement,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = premierDateDePaiement.setMonth(
              premierDateDePaiement.getMonth() + 3
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
            req.body.annee == dateDeComptabilisation.getFullYear() &&
            req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
            req.body.annee <= dateFinDeContrat.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: premierDateDePaiement,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDeComptabilisation.setMonth(
              dateDeComptabilisation.getMonth() + 3
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              { date_comptabilisation: nextDateComptabilisation }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
        }
        //traitement pour la periodicite annuelle
        if (contrat[i].periodicite_paiement == "annuelle") {
          if (
            contrat[i].montant_avance > 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_avance_net =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire -
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaires;
                  montant_avance_brut =
                    contrat[i].lieu.proprietaire[j].montant_avance_proprietaire;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_avance_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_avance_proprietaire,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_brut: montant_avance_brut,
                  montant_net: montant_avance_net,
                  date_comptabilisation: dateDebutLoyer,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              { date_comptabilisation: null, caution_versee: true }
            );
          }
          if (
            contrat[i].montant_avance == 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: dateDebutLoyer,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDebutLoyer.setFullYear(dateDebutLoyer.getFullYear() + 1)
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == premierDateDePaiement.getMonth() + 1 &&
            req.body.annee == premierDateDePaiement.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: premierDateDePaiement,
                });
              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = premierDateDePaiement.setFullYear(
              premierDateDePaiement.getFullYear() + 1
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
              }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
          if (
            req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
            req.body.annee == dateDeComptabilisation.getFullYear() &&
            req.body.mois <= dateFinDeContrat.getMonth() + 1 &&
            req.body.annee <= dateFinDeContrat.getFullYear()
          ) {
            for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
              if (contrat[i].lieu.proprietaire[j].mandataire == true) {
                if (contrat[i].caution_versee == false) {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer +
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire;
                } else {
                  montant_loyer_net =
                    contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut =
                    contrat[i].lieu.proprietaire[j].montant_loyer;
                }
                ordreVirement.push({
                  type_enregistrement: "0602",
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                  numero_compte_bancaire:
                    contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                  banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                  ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                  cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                  mois: req.body.mois,
                  annee: req.body.annee,
                  montant_net: montant_loyer_net,
                });

                comptabilisationLoyerCrediter.push({
                  nom_de_piece: dateGenerationDeComptabilisation,
                  date_gl: dateGenerationDeComptabilisation,
                  date_operation: dateGenerationDeComptabilisation,
                  cin: contrat[i].lieu.proprietaire[j].cin,
                  passport: contrat[i].lieu.proprietaire[j].passport,
                  carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                  type: "LOY",
                  adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                  adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                  origine: "PAISOFT",
                  devises: "MAD",
                  intitule_lieu: contrat[i].lieu.intitule_lieu,
                  code_lieu: contrat[i].lieu.code_lieu,
                  etablissement: "01",
                  centre_de_cout: "NS",
                  direction_regional:
                    contrat[i].lieu.type_lieu == "Direction régionale"
                      ? contrat[i].lieu.code_lieu
                      : contrat[i].lieu.code_rattache_DR,
                  point_de_vente:
                    contrat[i].lieu.type_lieu == "Point de vente"
                      ? contrat[i].lieu.code_lieu
                      : "",
                  montant_brut: montant_loyer_brut,
                  montant_tax:
                    contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                  montant_caution:
                    contrat[i].lieu.proprietaire[j].caution_par_proprietaire,
                  montant_net: montant_loyer_net,
                  date_comptabilisation: premierDateDePaiement,
                });

              }
            }
            if (contrat[i].caution_versee == false) {
              montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
            } else {
              montantDebiter = contrat[i].montant_loyer
            }
            comptabilisationLoyerDebiter.push({
              intitule_lieu: contrat[i].lieu.intitule_lieu,
              montant_caution: contrat[i].montant_caution,
              direction_regional:
              contrat[i].lieu.type_lieu == "Direction régionale"
                  ? contrat[i].lieu.code_lieu
                  : contrat[i].lieu.code_rattache_DR,
              point_de_vente:
                contrat[i].lieu.type_lieu == "Point de vente"
                  ? contrat[i].lieu.code_lieu
                  : "",
              montant: montantDebiter
            })
            let nextDateComptabilisation = dateDeComptabilisation.setFullYear(
              dateDeComptabilisation.getFullYear() + 1
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              { date_comptabilisation: nextDateComptabilisation }
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }
        }
      }//end if

      //traitement pour comptabiliser les contrats Resilier (cas des cautions)
      if (contrat[i].etat_contrat.libelle == "Résilié") {
        console.log("date de comptabilisatino condition resilie", dateDeComptabilisation.getMonth());
        if (contrat[i].statut_caution == "Récupérée") {

          if (contrat[i].periodicite_paiement == "mensuelle") {
            if (
              req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
              req.body.annee == dateDeComptabilisation.getFullYear() &&
              dateDeComptabilisation <= contrat[i].etat_contrat.etat.date_resiliation
            ) {
              for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                if (contrat[i].lieu.proprietaire[j].mandataire == true) {

                  montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer;

                  ordreVirement.push({
                    type_enregistrement: "0602",
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                    numero_compte_bancaire:
                      contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                    banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                    ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                    cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                    mois: req.body.mois,
                    annee: req.body.annee,
                    montant_net: montant_loyer_net,
                  });

                  comptabilisationLoyerCrediter.push({
                    nom_de_piece: dateGenerationDeComptabilisation,
                    date_gl: dateGenerationDeComptabilisation,
                    date_operation: dateGenerationDeComptabilisation,
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    type: "LOY",
                    adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                    adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                    origine: "PAISOFT",
                    devises: "MAD",
                    intitule_lieu: contrat[i].lieu.intitule_lieu,
                    code_lieu: contrat[i].lieu.code_lieu,
                    etablissement: "01",
                    centre_de_cout: "NS",
                    direction_regional:
                      contrat[i].lieu.type_lieu == "Direction régionale"
                        ? contrat[i].lieu.code_lieu
                        : contrat[i].lieu.code_rattache_DR,
                    point_de_vente:
                      contrat[i].lieu.type_lieu == "Point de vente"
                        ? contrat[i].lieu.code_lieu
                        : "",
                    montant_brut: montant_loyer_brut,
                    montant_tax:
                      contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                    montant_net: montant_loyer_net,
                    date_comptabilisation: dateDeComptabilisation,
                  });

                }
              }
              if (contrat[i].caution_versee == false) {
                montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
              } else {
                montantDebiter = contrat[i].montant_loyer
              }
              comptabilisationLoyerDebiter.push({
                intitule_lieu: contrat[i].lieu.intitule_lieu,
                montant_caution: contrat[i].montant_caution,
                direction_regional:
                contrat[i].lieu.type_lieu == "Direction régionale"
                    ? contrat[i].lieu.code_lieu
                    : contrat[i].lieu.code_rattache_DR,
                point_de_vente:
                  contrat[i].lieu.type_lieu == "Point de vente"
                    ? contrat[i].lieu.code_lieu
                    : "",
                montant: montantDebiter
              })
              let nextDateComptabilisation = dateDeComptabilisation.setMonth(
                dateDeComptabilisation.getMonth() + 1
              );
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                { date_comptabilisation: nextDateComptabilisation }
              )
                .then(() => {
                  console.log("Date Comptabilisation Changed !");
                })
                .catch((error) => {
                  res.status(402).send({ message: error.message });
                });
            }
          }
          if (contrat[i].periodicite_paiement == "trimestrielle") {
            if (
              req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
              req.body.annee == dateDeComptabilisation.getFullYear() &&
              dateDeComptabilisation <= contrat[i].etat_contrat.etat.date_resiliation
            ) {
              for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                if (contrat[i].lieu.proprietaire[j].mandataire == true) {

                  montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer;

                  ordreVirement.push({
                    type_enregistrement: "0602",
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                    numero_compte_bancaire:
                      contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                    banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                    ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                    cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                    mois: req.body.mois,
                    annee: req.body.annee,
                    montant_net: montant_loyer_net,
                  });

                  comptabilisationLoyerCrediter.push({
                    nom_de_piece: dateGenerationDeComptabilisation,
                    date_gl: dateGenerationDeComptabilisation,
                    date_operation: dateGenerationDeComptabilisation,
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    type: "LOY",
                    adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                    adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                    origine: "PAISOFT",
                    devises: "MAD",
                    intitule_lieu: contrat[i].lieu.intitule_lieu,
                    code_lieu: contrat[i].lieu.code_lieu,
                    etablissement: "01",
                    centre_de_cout: "NS",
                    direction_regional:
                      contrat[i].lieu.type_lieu == "Direction régionale"
                        ? contrat[i].lieu.code_lieu
                        : contrat[i].lieu.code_rattache_DR,
                    point_de_vente:
                      contrat[i].lieu.type_lieu == "Point de vente"
                        ? contrat[i].lieu.code_lieu
                        : "",
                    montant_brut: montant_loyer_brut,
                    montant_tax:
                      contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                    montant_net: montant_loyer_net,
                    date_comptabilisation: dateDeComptabilisation,
                  });

                }
              }
              if (contrat[i].caution_versee == false) {
                montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
              } else {
                montantDebiter = contrat[i].montant_loyer
              }
              comptabilisationLoyerDebiter.push({
                intitule_lieu: contrat[i].lieu.intitule_lieu,
                montant_caution: contrat[i].montant_caution,
                direction_regional:
                contrat[i].lieu.type_lieu == "Direction régionale"
                    ? contrat[i].lieu.code_lieu
                    : contrat[i].lieu.code_rattache_DR,
                point_de_vente:
                  contrat[i].lieu.type_lieu == "Point de vente"
                    ? contrat[i].lieu.code_lieu
                    : "",
                montant: montantDebiter
              })
              let nextDateComptabilisation = dateDeComptabilisation.setMonth(
                dateDeComptabilisation.getMonth() + 3
              );
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                { date_comptabilisation: nextDateComptabilisation }
              )
                .then(() => {
                  console.log("Date Comptabilisation Changed !");
                })
                .catch((error) => {
                  res.status(402).send({ message: error.message });
                });
            }
          }
          if (contrat[i].periodicite_paiement == "annuelle") {
            if (
              req.body.mois == dateDeComptabilisation.getMonth() + 1 &&
              req.body.annee == dateDeComptabilisation.getFullYear() &&
              dateDeComptabilisation <= contrat[i].etat_contrat.etat.date_resiliation
            ) {
              for (let j = 0; j < contrat[i].lieu.proprietaire.length; j++) {
                if (contrat[i].lieu.proprietaire[j].mandataire == true) {

                  montant_loyer_net = contrat[i].lieu.proprietaire[j].montant_apres_impot;
                  montant_loyer_brut = contrat[i].lieu.proprietaire[j].montant_loyer;

                  ordreVirement.push({
                    type_enregistrement: "0602",
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    nom_prenom: contrat[i].lieu.proprietaire[j].nom_prenom,
                    numero_compte_bancaire:
                      contrat[i].lieu.proprietaire[j].n_compte_bancaire,
                    banque_rib: contrat[i].lieu.proprietaire[j].banque_rib,
                    ville_rib: contrat[i].lieu.proprietaire[j].ville_rib,
                    cle_rib: contrat[i].lieu.proprietaire[j].cle_rib,
                    mois: req.body.mois,
                    annee: req.body.annee,
                    montant_net: montant_loyer_net,
                  });

                  comptabilisationLoyerCrediter.push({
                    nom_de_piece: dateGenerationDeComptabilisation,
                    date_gl: dateGenerationDeComptabilisation,
                    date_operation: dateGenerationDeComptabilisation,
                    cin: contrat[i].lieu.proprietaire[j].cin,
                    passport: contrat[i].lieu.proprietaire[j].passport,
                    carte_sejour: contrat[i].lieu.proprietaire[j].carte_sejour,
                    type: "LOY",
                    adresse_proprietaire: contrat[i].lieu.proprietaire[j].adresse,
                    adresse_lieu: contrat[i].lieu.proprietaire[j].adresse,
                    origine: "PAISOFT",
                    devises: "MAD",
                    intitule_lieu: contrat[i].lieu.intitule_lieu,
                    code_lieu: contrat[i].lieu.code_lieu,
                    etablissement: "01",
                    centre_de_cout: "NS",
                    direction_regional:
                      contrat[i].lieu.type_lieu == "Direction régionale"
                        ? contrat[i].lieu.code_lieu
                        : contrat[i].lieu.code_rattache_DR,
                    point_de_vente:
                      contrat[i].lieu.type_lieu == "Point de vente"
                        ? contrat[i].lieu.code_lieu
                        : "",
                    montant_brut: montant_loyer_brut,
                    montant_tax:
                      contrat[i].lieu.proprietaire[j].tax_par_periodicite,
                    montant_net: montant_loyer_net,
                    date_comptabilisation: dateDeComptabilisation,
                  });

                }
              }
              if (contrat[i].caution_versee == false) {
                montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution
              } else {
                montantDebiter = contrat[i].montant_loyer
              }
              comptabilisationLoyerDebiter.push({
                intitule_lieu: contrat[i].lieu.intitule_lieu,
                montant_caution: contrat[i].montant_caution,
                direction_regional:
                contrat[i].lieu.type_lieu == "Direction régionale"
                    ? contrat[i].lieu.code_lieu
                    : contrat[i].lieu.code_rattache_DR,
                point_de_vente:
                  contrat[i].lieu.type_lieu == "Point de vente"
                    ? contrat[i].lieu.code_lieu
                    : "",
                montant: montantDebiter
              })
              let nextDateComptabilisation = dateDeComptabilisation.setFullYear(
                dateDeComptabilisation.getFullYear() + 1
              );
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                { date_comptabilisation: nextDateComptabilisation }
              )
                .then(() => {
                  console.log("Date Comptabilisation Changed !");
                })
                .catch((error) => {
                  res.status(402).send({ message: error.message });
                });
            }
          }
        }
      }//end for
    }
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
            res.json(true);
          })
          .catch((error) => {
            res.status(402).send({ message: error.message });
          });
      })
      .catch((error) => {
        res.status(401).send({ message: error.message });
      });
  },

  getClotureDate: async (req, res) => {
    let nextCloture;
    await archiveComptabilisation
      .find()
      .sort({ date_generation_de_comptabilisation: "desc" })
      .then((data) => {
        // nextCloture = new Date(data[0].date_generation_de_comptabilisation)
        nextCloture = new Date()
        res.json({ mois: nextCloture.getMonth() + 1 , annee: nextCloture.getFullYear() });
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
};
