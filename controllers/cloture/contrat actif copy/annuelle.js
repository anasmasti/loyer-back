const Contrat = require("../../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");

module.exports = {
  traitementAnnuelle: async (req, res, next) => {
    try {
        //traitement pour comptabiliser les contrats Actif
        if (contrat[i].etat_contrat.libelle == "Actif") {
          //traitement pour la periodicite annuelle
          if (contrat[i].periodicite_paiement == "annuelle") {
            if (
              contrat[i].montant_avance > 0 &&
              req.body.mois == dateDebutLoyer.getMonth() + 1 &&
              req.body.annee == dateDebutLoyer.getFullYear()
            ) {
              for (let g = 0; g < contrat[i].foncier.lieu.length; g++) {
                if (contrat[i].foncier.lieu[g].deleted == false) {

                  for (let j = 0; j < contrat[i].foncier.proprietaire.length; j++) {
                    if (contrat[i].foncier.proprietaire[j].is_mandataire == true) {
                      montant_loyer_net_mandataire = (contrat[i].foncier.proprietaire[j].montant_avance_proprietaire -
                        contrat[i].foncier.proprietaire[j].tax_avance_proprietaire) +
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire + contrat[i].foncier.proprietaire[j].montant_apres_impot;

                      montant_loyer_brut_mandataire = (contrat[i].foncier.proprietaire[j].montant_avance_proprietaire +
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire +
                        contrat[i].foncier.proprietaire[j].montant_loyer);

                      montant_tax_mandataire = contrat[i].foncier.proprietaire[j].tax_avance_proprietaire + contrat[i].foncier.proprietaire[j].tax_par_periodicite;

                      montant_a_verse = montant_loyer_net_mandataire

                      comptabilisationLoyerCrediter.push({
                        nom_de_piece: dateGenerationDeComptabilisation,
                        date_gl: dateGenerationDeComptabilisation,
                        date_operation: dateGenerationDeComptabilisation,
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        type: "LOY",
                        adresse_proprietaire: contrat[i].foncier.proprietaire[j].adresse,
                        adresse_lieu: contrat[i].foncier.adresse,
                        origine: "PAISOFT",
                        devises: "MAD",
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                        etablissement: "01",
                        centre_de_cout: "NS",
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant_net: montant_loyer_net_mandataire,
                        montant_tax: montant_tax_mandataire,
                        montant_caution:
                          contrat[i].foncier.proprietaire[j].caution_par_proprietaire,
                        montant_brut: montant_loyer_brut_mandataire,
                        date_comptabilisation: dateDebutLoyer,
                      });
                      if (contrat[i].foncier.proprietaire[j].proprietaire_list.length !== 0) {

                        for (let k = 0; k < contrat[i].foncier.proprietaire[j].proprietaire_list.length; k++) {
                          montant_loyer_net =+ montant_loyer_net_mandataire + (contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_avance_proprietaire -
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_avance_proprietaire) +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_apres_impot;

                          montant_loyer_brut =+ montant_loyer_brut_mandataire +
                            (contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_avance_proprietaire +
                              contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                              contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_loyer);

                          montant_tax =+ montant_tax_mandataire + contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_avance_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_par_periodicite;

                          montant_a_verse =+ montant_loyer_net;

                          comptabilisationLoyerCrediter.push({
                            nom_de_piece: dateGenerationDeComptabilisation,
                            date_gl: dateGenerationDeComptabilisation,
                            date_operation: dateGenerationDeComptabilisation,
                            cin: contrat[i].foncier.proprietaire[j].proprietaire_list[k].cin,
                            passport: contrat[i].foncier.proprietaire[j].proprietaire_list[k].passport,
                            carte_sejour: contrat[i].foncier.proprietaire[j].proprietaire_list[k].carte_sejour,
                            type: "LOY",
                            adresse_proprietaire: contrat[i].foncier.proprietaire[j].proprietaire_list[k].adresse,
                            adresse_lieu: contrat[i].foncier.adresse,
                            origine: "PAISOFT",
                            devises: "MAD",
                            intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                            code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                            etablissement: "01",
                            centre_de_cout: "NS",
                            direction_regional:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                            point_de_vente:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : "",
                            montant_net: montant_loyer_net,
                            montant_tax: montant_tax,

                            montant_caution:
                              contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire,
                            montant_brut: montant_loyer_brut,
                            date_comptabilisation: dateDebutLoyer,
                          });
                          montant_loyer_net = 0;
                          montant_loyer_brut = 0;
                          montant_tax = 0;
                        }
                      }

                      montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution;

                      comptabilisationLoyerDebiter.push({
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        montant_caution: contrat[i].montant_caution,
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant: montantDebiter
                      })

                      ordreVirement.push({
                        type_enregistrement: "0602",
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        nom_prenom: contrat[i].foncier.proprietaire[j].nom_prenom,
                        numero_compte_bancaire:
                          contrat[i].foncier.proprietaire[j].n_compte_bancaire,
                        // banque_rib: contrat[i].foncier.proprietaire[j].banque_rib,
                        // ville_rib: contrat[i].foncier.proprietaire[j].ville_rib,
                        // cle_rib: contrat[i].foncier.proprietaire[j].cle_rib,
                        mois: req.body.mois,
                        annee: req.body.annee,
                        nom_agence_bancaire: contrat[i].foncier.proprietaire[j].nom_agence_bancaire,
                        montant_net: montant_a_verse,
                      });
                    }
                  }
                }
              }
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                { date_comptabilisation: null, caution_versee: true, avance_versee: true }
              );
            }
            if (
              contrat[i].montant_avance == 0 &&
              req.body.mois == dateDebutLoyer.getMonth() + 1 &&
              req.body.annee == dateDebutLoyer.getFullYear()
            ) {
              for (let g = 0; g < contrat[i].foncier.lieu.length; g++) {
                if (contrat[i].foncier.lieu[g].deleted == false) {

                  for (let j = 0; j < contrat[i].foncier.proprietaire.length; j++) {
                    if (contrat[i].foncier.proprietaire[j].is_mandataire == true) {
                      montant_loyer_net_mandataire =
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire +
                        contrat[i].foncier.proprietaire[j].montant_apres_impot;

                      montant_loyer_brut_mandataire =
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire +
                        contrat[i].foncier.proprietaire[j].montant_loyer;

                      montant_tax_mandataire = contrat[i].foncier.proprietaire[j].tax_par_periodicite;

                      montant_a_verse = montant_loyer_net_mandataire

                      comptabilisationLoyerCrediter.push({
                        nom_de_piece: dateGenerationDeComptabilisation,
                        date_gl: dateGenerationDeComptabilisation,
                        date_operation: dateGenerationDeComptabilisation,
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        type: "LOY",
                        adresse_proprietaire: contrat[i].foncier.proprietaire[j].adresse,
                        adresse_lieu: contrat[i].foncier.adresse,
                        origine: "PAISOFT",
                        devises: "MAD",
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                        etablissement: "01",
                        centre_de_cout: "NS",
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant_net: montant_loyer_net_mandataire,
                        montant_tax: montant_tax_mandataire,
                        montant_caution:
                          contrat[i].foncier.proprietaire[j].caution_par_proprietaire,
                        montant_brut: montant_loyer_brut_mandataire,
                        date_comptabilisation: dateDebutLoyer,
                      });
                      if (contrat[i].foncier.proprietaire[j].proprietaire_list.length !== 0) {

                        for (let k = 0; k < contrat[i].foncier.proprietaire[j].proprietaire_list.length; k++) {
                          montant_loyer_net =+ montant_loyer_net_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_apres_impot;

                          montant_loyer_brut =+ montant_loyer_brut_mandataire +

                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_loyer;

                          montant_tax =+ montant_tax_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_par_periodicite;

                          montant_a_verse =+ montant_loyer_net;

                          comptabilisationLoyerCrediter.push({
                            nom_de_piece: dateGenerationDeComptabilisation,
                            date_gl: dateGenerationDeComptabilisation,
                            date_operation: dateGenerationDeComptabilisation,
                            cin: contrat[i].foncier.proprietaire[j].proprietaire_list[k].cin,
                            passport: contrat[i].foncier.proprietaire[j].proprietaire_list[k].passport,
                            carte_sejour: contrat[i].foncier.proprietaire[j].proprietaire_list[k].carte_sejour,
                            type: "LOY",
                            adresse_proprietaire: contrat[i].foncier.proprietaire[j].proprietaire_list[k].adresse,
                            adresse_lieu: contrat[i].foncier.adresse,
                            origine: "PAISOFT",
                            devises: "MAD",
                            intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                            code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                            etablissement: "01",
                            centre_de_cout: "NS",
                            direction_regional:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                            point_de_vente:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : "",
                            montant_net: montant_loyer_net,
                            montant_tax: montant_tax,

                            montant_caution:
                              contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire,
                            montant_brut: montant_loyer_brut,
                            date_comptabilisation: dateDebutLoyer,
                          });
                          montant_loyer_net = 0;
                          montant_loyer_brut = 0;
                          montant_tax = 0;
                        }
                      }

                      montantDebiter = contrat[i].montant_loyer + contrat[i].montant_caution;

                      comptabilisationLoyerDebiter.push({
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        montant_caution: contrat[i].montant_caution,
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant: montantDebiter
                      })

                      ordreVirement.push({
                        type_enregistrement: "0602",
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        nom_prenom: contrat[i].foncier.proprietaire[j].nom_prenom,
                        numero_compte_bancaire:
                          contrat[i].foncier.proprietaire[j].n_compte_bancaire,
                        // banque_rib: contrat[i].foncier.proprietaire[j].banque_rib,
                        // ville_rib: contrat[i].foncier.proprietaire[j].ville_rib,
                        // cle_rib: contrat[i].foncier.proprietaire[j].cle_rib,
                        mois: req.body.mois,
                        annee: req.body.annee,
                        nom_agence_bancaire: contrat[i].foncier.proprietaire[j].nom_agence_bancaire,
                        montant_net: montant_a_verse,
                      });
                    }
                  }
                }

              }
              let nextDateComptabilisation = dateDebutLoyer.setFullYear(dateDebutLoyer.getFullYear() + 1)
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                {
                  date_comptabilisation: nextDateComptabilisation,
                  caution_versee: true, avance_versee: true
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
              for (let g = 0; g < contrat[i].foncier.lieu.length; g++) {
                if (contrat[i].foncier.lieu[g].deleted == false) {

                  for (let j = 0; j < contrat[i].foncier.proprietaire.length; j++) {
                    if (contrat[i].foncier.proprietaire[j].is_mandataire == true) {
                      montant_loyer_net_mandataire =
                        contrat[i].foncier.proprietaire[j].montant_apres_impot;

                      montant_loyer_brut_mandataire =
                        contrat[i].foncier.proprietaire[j].montant_loyer;

                      montant_tax_mandataire = contrat[i].foncier.proprietaire[j].tax_par_periodicite;

                      montant_a_verse = montant_loyer_net_mandataire

                      comptabilisationLoyerCrediter.push({
                        nom_de_piece: dateGenerationDeComptabilisation,
                        date_gl: dateGenerationDeComptabilisation,
                        date_operation: dateGenerationDeComptabilisation,
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        type: "LOY",
                        adresse_proprietaire: contrat[i].foncier.proprietaire[j].adresse,
                        adresse_lieu: contrat[i].foncier.adresse,
                        origine: "PAISOFT",
                        devises: "MAD",
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                        etablissement: "01",
                        centre_de_cout: "NS",
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant_net: montant_loyer_net_mandataire,
                        montant_tax: montant_tax_mandataire,
                        montant_caution: 0,
                        montant_brut: montant_loyer_brut_mandataire,
                        date_comptabilisation: dateDebutLoyer,
                      });
                      if (contrat[i].foncier.proprietaire[j].proprietaire_list.length !== 0) {

                        for (let k = 0; k < contrat[i].foncier.proprietaire[j].proprietaire_list.length; k++) {
                          montant_loyer_net =+ montant_loyer_net_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_apres_impot;

                          montant_loyer_brut =+ montant_loyer_brut_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_loyer;

                          montant_tax =+ montant_tax_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_par_periodicite;

                          montant_a_verse =+ montant_loyer_net;

                          comptabilisationLoyerCrediter.push({
                            nom_de_piece: dateGenerationDeComptabilisation,
                            date_gl: dateGenerationDeComptabilisation,
                            date_operation: dateGenerationDeComptabilisation,
                            cin: contrat[i].foncier.proprietaire[j].proprietaire_list[k].cin,
                            passport: contrat[i].foncier.proprietaire[j].proprietaire_list[k].passport,
                            carte_sejour: contrat[i].foncier.proprietaire[j].proprietaire_list[k].carte_sejour,
                            type: "LOY",
                            adresse_proprietaire: contrat[i].foncier.proprietaire[j].proprietaire_list[k].adresse,
                            adresse_lieu: contrat[i].foncier.adresse,
                            origine: "PAISOFT",
                            devises: "MAD",
                            intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                            code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                            etablissement: "01",
                            centre_de_cout: "NS",
                            direction_regional:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                            point_de_vente:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : "",
                            montant_net: montant_loyer_net,
                            montant_tax: montant_tax,
                            montant_caution: 0,
                            montant_brut: montant_loyer_brut,
                            date_comptabilisation: dateDebutLoyer,
                          });
                          montant_loyer_net = 0;
                          montant_loyer_brut = 0;
                          montant_tax = 0;
                        }
                      }

                      montantDebiter = contrat[i].montant_loyer;

                      comptabilisationLoyerDebiter.push({
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        montant_caution: contrat[i].montant_caution,
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant: montantDebiter
                      })

                      ordreVirement.push({
                        type_enregistrement: "0602",
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        nom_prenom: contrat[i].foncier.proprietaire[j].nom_prenom,
                        numero_compte_bancaire:
                          contrat[i].foncier.proprietaire[j].n_compte_bancaire,
                        // banque_rib: contrat[i].foncier.proprietaire[j].banque_rib,
                        // ville_rib: contrat[i].foncier.proprietaire[j].ville_rib,
                        // cle_rib: contrat[i].foncier.proprietaire[j].cle_rib,
                        mois: req.body.mois,
                        annee: req.body.annee,
                        nom_agence_bancaire: contrat[i].foncier.proprietaire[j].nom_agence_bancaire,
                        montant_net: montant_a_verse,
                      });
                    }
                  }
                }
              }
              let nextDateComptabilisation = premierDateDePaiement.setFullYear(
                premierDateDePaiement.getFullYear() + 1
              );
              await Contrat.findByIdAndUpdate(
                { _id: contrat[i]._id },
                {
                  date_comptabilisation: nextDateComptabilisation,

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
              for (let g = 0; g < contrat[i].foncier.lieu.length; g++) {
                if (contrat[i].foncier.lieu[g].deleted == false) {

                  for (let j = 0; j < contrat[i].foncier.proprietaire.length; j++) {
                    if (contrat[i].foncier.proprietaire[j].is_mandataire == true) {
                      montant_loyer_net_mandataire =
                        contrat[i].foncier.proprietaire[j].montant_apres_impot;

                      montant_loyer_brut_mandataire =
                        contrat[i].foncier.proprietaire[j].montant_loyer;

                      montant_tax_mandataire = contrat[i].foncier.proprietaire[j].tax_par_periodicite;

                      montant_a_verse = montant_loyer_net_mandataire

                      comptabilisationLoyerCrediter.push({
                        nom_de_piece: dateGenerationDeComptabilisation,
                        date_gl: dateGenerationDeComptabilisation,
                        date_operation: dateGenerationDeComptabilisation,
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        type: "LOY",
                        adresse_proprietaire: contrat[i].foncier.proprietaire[j].adresse,
                        adresse_lieu: contrat[i].foncier.adresse,
                        origine: "PAISOFT",
                        devises: "MAD",
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                        etablissement: "01",
                        centre_de_cout: "NS",
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant_net: montant_loyer_net_mandataire,
                        montant_tax: montant_tax_mandataire,
                        montant_caution: 0,
                        montant_brut: montant_loyer_brut_mandataire,
                        date_comptabilisation: dateDebutLoyer,
                      });
                      if (contrat[i].foncier.proprietaire[j].proprietaire_list.length !== 0) {

                        for (let k = 0; k < contrat[i].foncier.proprietaire[j].proprietaire_list.length; k++) {
                          montant_loyer_net =+ montant_loyer_net_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_apres_impot;

                          montant_loyer_brut =+ montant_loyer_brut_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_loyer;

                          montant_tax =+ montant_tax_mandataire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_par_periodicite;

                          montant_a_verse =+ montant_loyer_net;

                          comptabilisationLoyerCrediter.push({
                            nom_de_piece: dateGenerationDeComptabilisation,
                            date_gl: dateGenerationDeComptabilisation,
                            date_operation: dateGenerationDeComptabilisation,
                            cin: contrat[i].foncier.proprietaire[j].proprietaire_list[k].cin,
                            passport: contrat[i].foncier.proprietaire[j].proprietaire_list[k].passport,
                            carte_sejour: contrat[i].foncier.proprietaire[j].proprietaire_list[k].carte_sejour,
                            type: "LOY",
                            adresse_proprietaire: contrat[i].foncier.proprietaire[j].proprietaire_list[k].adresse,
                            adresse_lieu: contrat[i].foncier.adresse,
                            origine: "PAISOFT",
                            devises: "MAD",
                            intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                            code_lieu: contrat[i].foncier.lieu[g].lieu.code_lieu,
                            etablissement: "01",
                            centre_de_cout: "NS",
                            direction_regional:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                            point_de_vente:
                              contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                                ? contrat[i].foncier.lieu[g].lieu.code_lieu
                                : "",
                            montant_net: montant_loyer_net,
                            montant_tax: montant_tax,
                            montant_caution: 0,
                            montant_brut: montant_loyer_brut,
                            date_comptabilisation: dateDebutLoyer,
                          });
                          montant_loyer_net = 0;
                          montant_loyer_brut = 0;
                          montant_tax = 0;
                        }
                      }

                      montantDebiter = contrat[i].montant_loyer;

                      comptabilisationLoyerDebiter.push({
                        intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                        montant_caution: contrat[i].montant_caution,
                        direction_regional:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Direction régionale"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : contrat[i].foncier.lieu[g].lieu.code_rattache_DR,
                        point_de_vente:
                          contrat[i].foncier.lieu[g].lieu.type_lieu == "Point de vente"
                            ? contrat[i].foncier.lieu[g].lieu.code_lieu
                            : "",
                        montant: montantDebiter
                      })

                      ordreVirement.push({
                        type_enregistrement: "0602",
                        cin: contrat[i].foncier.proprietaire[j].cin,
                        passport: contrat[i].foncier.proprietaire[j].passport,
                        carte_sejour: contrat[i].foncier.proprietaire[j].carte_sejour,
                        nom_prenom: contrat[i].foncier.proprietaire[j].nom_prenom,
                        numero_compte_bancaire:
                          contrat[i].foncier.proprietaire[j].n_compte_bancaire,
                        // banque_rib: contrat[i].foncier.proprietaire[j].banque_rib,
                        // ville_rib: contrat[i].foncier.proprietaire[j].ville_rib,
                        // cle_rib: contrat[i].foncier.proprietaire[j].cle_rib,
                        mois: req.body.mois,
                        annee: req.body.annee,
                        nom_agence_bancaire: contrat[i].foncier.proprietaire[j].nom_agence_bancaire,
                        montant_net: montant_a_verse,
                      });
                    }
                  }
                }
              }
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

    } catch (error) {
      res.status(402).json({ message: error.message })
    }
  },
};
