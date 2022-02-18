const Contrat = require("../../../models/contrat/contrat.model");
const ordreVirementArchive = require("../../../models/archive/archiveVirement.schema");
const archiveComptabilisation = require("../../../models/archive/archiveComptabilisation.schema");

function createComptLoyerCredObject (
     proprietaire,
     lieu,
     dateGenerationDeComptabilisation, 
     montant_loyer_net, 
     montant_tax, 
     montant_loyer_brut, 
     dateDebutLoyer, 
     montant_caution 
     ) {
        let comptabilisationLoyerCrediter = {
            nom_de_piece: dateGenerationDeComptabilisation,
            date_gl: dateGenerationDeComptabilisation,
            date_operation: dateGenerationDeComptabilisation,
            cin: proprietaire.cin,
            passport: proprietaire.passport,
            carte_sejour: proprietaire.carte_sejour,
            type: "LOY",
            adresse_proprietaire: proprietaire.adresse,
            adresse_lieu: Contrat.foncier.adresse,
            origine: "PAISOFT",
            devises: "MAD",
            intitule_lieu: lieu.lieu.intitule_lieu,
            code_lieu: lieu.lieu.code_lieu,
            etablissement: "01",
            centre_de_cout: "NS",
            direction_regional: lieu.lieu.type_lieu == "Direction régionale" ? lieu.lieu.code_lieu : lieu.lieu.code_rattache_DR,
            point_de_vente: lieu.lieu.type_lieu == "Point de vente" ? lieu.lieu.code_lieu : "",
            montant_net: montant_loyer_net,
            montant_tax: montant_tax,
            // montant_caution: proprietaire.caution_par_proprietaire,
            montant_caution: montant_caution,
            montant_brut: montant_loyer_brut,
            date_comptabilisation: dateDebutLoyer,
        };
        return comptabilisationLoyerCrediter;
}

module.exports = {
    traitementMensuelle: async (req, res) => {
        let comptabilisationLoyerCrediter = [], montantDebiter = 0, comptabilisationLoyerDebiter = [], ordreVirement = [];

        let dateDebutLoyer = new Date(contrat[i].date_debut_loyer);
        let premierDateDePaiement = new Date(contrat[i].date_premier_paiement);
        let dateDeComptabilisation = new Date(contrat[i].date_comptabilisation);
        let dateFinDeContrat = contrat[i].date_fin_contrat;

        let montant_loyer_net,
          montant_loyer_brut,
          montant_tax = 0;
        let montant_loyer_net_mandataire,
          montant_loyer_brut_mandataire,
          montant_tax_mandataire = 0;
        let montant_a_verse = 0;
        

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
               
                    comptabilisationLoyerCrediter.push(
                        createComptLoyerCredObject(
                        contrat[i].foncier.proprietaire[j],
                        contrat[i].foncier.lieu[g],
                        dateGenerationDeComptabilisation,
                        montant_loyer_net_mandataire,
                        montant_tax_mandataire,
                        montant_loyer_brut_mandataire,
                        dateDebutLoyer,
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire
                        )
                    );
                    if (contrat[i].foncier.proprietaire[j].proprietaire_list.length != 0) {


                      for (let k = 0; k < contrat[i].foncier.proprietaire[j].proprietaire_list.length; k++) {
                        montant_loyer_net =+ (montant_loyer_net_mandataire + (contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_avance_proprietaire -
                          contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_avance_proprietaire) +
                          contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                          contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_apres_impot);

                        montant_loyer_brut =+ montant_loyer_brut_mandataire +
                          (contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_avance_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire +
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].montant_loyer);

                        montant_tax =+ montant_tax_mandataire + contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_avance_proprietaire +
                          contrat[i].foncier.proprietaire[j].proprietaire_list[k].tax_par_periodicite;

                        montant_a_verse =+ montant_loyer_net;
                            
                        comptabilisationLoyerCrediter.push(
                            createComptLoyerCredObject(
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k],
                            contrat[i].foncier.lieu[g],
                            dateGenerationDeComptabilisation,
                            montant_loyer_net,
                            montant_tax,
                            montant_loyer_brut,
                            dateDebutLoyer,
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire
                            )
                        );
                        montant_loyer_net = 0;
                        montant_loyer_brut = 0;
                        montant_tax = 0;
                      }
                    }

                    montantDebiter = contrat[i].montant_loyer + contrat[i].montant_avance + contrat[i].montant_caution;

                    comptabilisationLoyerDebiter.push({
                      intitule_lieu: contrat[i].foncier.lieu[g].lieu.intitule_lieu,
                      montant_caution: contrat[i].montant_caution,
                      numero_contrat: contrat[i].numero_contrat,
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
          }//end if

          if (
            contrat[i].montant_avance == 0 &&
            req.body.mois == dateDebutLoyer.getMonth() + 1 &&
            req.body.annee == dateDebutLoyer.getFullYear()
          ) {
            console.log('2->', true);
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

                    comptabilisationLoyerCrediter.push(
                        createComptLoyerCredObject(
                        contrat[i].foncier.proprietaire[j],
                        contrat[i].foncier.lieu[g],
                        dateGenerationDeComptabilisation,
                        montant_loyer_net_mandataire,
                        montant_tax_mandataire,
                        montant_loyer_brut_mandataire,
                        dateDebutLoyer,
                        contrat[i].foncier.proprietaire[j].caution_par_proprietaire
                        )
                    );
                    
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

                        comptabilisationLoyerCrediter.push(
                            createComptLoyerCredObject(
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k],
                            contrat[i].foncier.lieu[g],
                            dateGenerationDeComptabilisation,
                            montant_loyer_net,
                            montant_tax,
                            montant_loyer_brut,
                            dateDebutLoyer,
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k].caution_par_proprietaire
                            )
                        );
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

            let nextDateComptabilisation = dateDebutLoyer.setMonth(
              dateDebutLoyer.getMonth() + 1
            );
            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {
                date_comptabilisation: nextDateComptabilisation,
                caution_versee: true,
                avance_versee: true
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
            console.log('3->', true);
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

                    comptabilisationLoyerCrediter.push(
                        createComptLoyerCredObject(
                        contrat[i].foncier.proprietaire[j],
                        contrat[i].foncier.lieu[g],
                        dateGenerationDeComptabilisation,
                        montant_loyer_net_mandataire,
                        montant_tax_mandataire,
                        montant_loyer_brut_mandataire,
                        dateDebutLoyer,
                        0
                        )
                    );

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
                        comptabilisationLoyerCrediter.push(
                            createComptLoyerCredObject(
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k],
                            contrat[i].foncier.lieu[g],
                            dateGenerationDeComptabilisation,
                            montant_loyer_net,
                            montant_tax,
                            montant_loyer_brut,
                            dateDebutLoyer,
                            0
                            )
                        );
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
            let nextDateComptabilisation = premierDateDePaiement.setMonth(
              premierDateDePaiement.getMonth() + 1
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
            console.log('4->', true);
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

                    comptabilisationLoyerCrediter.push(
                        createComptLoyerCredObject(
                        contrat[i].foncier.proprietaire[j],
                        contrat[i].foncier.lieu[g],
                        dateGenerationDeComptabilisation,
                        montant_loyer_net_mandataire,
                        montant_tax_mandataire,
                        montant_loyer_brut_mandataire,
                        dateDebutLoyer,
                        0
                        )
                    );

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
                        comptabilisationLoyerCrediter.push(
                            createComptLoyerCredObject(
                            contrat[i].foncier.proprietaire[j].proprietaire_list[k],
                            contrat[i].foncier.lieu[g],
                            dateGenerationDeComptabilisation,
                            montant_loyer_net,
                            montant_tax,
                            montant_loyer_brut,
                            dateDebutLoyer,
                            0
                            )
                        );
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

            let nextDateComptabilisation = dateDeComptabilisation.setMonth(
              dateDeComptabilisation.getMonth() + 1
            );

            await Contrat.findByIdAndUpdate(
              { _id: contrat[i]._id },
              {date_comptabilisation: nextDateComptabilisation}
            )
              .then(() => {
                console.log("Date Comptabilisation Changed !");
              })
              .catch((error) => {
                res.status(402).send({ message: error.message });
              });
          }

          return {
              ordre_virement: ordreVirement,
              cmptLoyerCrdt: comptabilisationLoyerCrediter,
              cmptLoyerCebt: comptabilisationLoyerDebiter,
          }
    }
}