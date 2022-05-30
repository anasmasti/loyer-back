const Contrat = require("../../../../models/contrat/contrat.model");
const ContratHelper = require("../../contrat");
const archiveComptabilisation = require("../../../../models/archive/archiveComptabilisation.schema");
const archiveVirement = require("../../../../models/archive/archiveVirement.schema");

module.exports = {
  aggrigateOrderVirementObjects: async (orderVirements) => {
    let aggrigatedOrderVirements = [];
    for (let index = 0; index < orderVirements.length; index++) {
      let montant_net_total = 0,
        montant_brut_total = 0,
        montant_taxe_total = 0;
      let aggrigatedList = [];

      if (!aggrigatedList.includes(orderVrmt.cin)) {
        for (let j = 0; j < orderVirements.length; j++) {
          const orderVrmt = orderVirements[j];
          montant_net_total += orderVrmt.montant_net;
          montant_brut_total += orderVrmt.montant_brut;
          montant_taxe_total += orderVrmt.montant_taxe;
          aggrigatedList.push(orderVrmt.cin);
        }

        aggrigatedOrderVirements.push({
          type_enregistrement: orderVirements[index].type_enregistrement,
          cin: orderVirements[index].cin,
          passport: orderVirements[index].passport,
          carte_sejour: orderVirements[index].carte_sejour,
          nom_prenom: orderVirements[index].nom_prenom,
          numero_compte_bancaire: orderVirements[index].numero_compte_bancaire,
          mois: orderVirements[index].mois,
          annee: orderVirements[index].annee,
          nom_agence_bancaire: orderVirements[index].nom_agence_bancaire,
          banque: orderVirements[index].banque,
          intitule_lieu: orderVirements[index].intitule_lieu,
          type_lieu: orderVirements[index].type_lieu,
          numero_contrat: orderVirements[index].numero_contrat,
          periodicite: orderVirements[index].periodicite,
          montant_net: montant_net_total,
          montant_brut: montant_brut_total,
          montant_taxe: montant_taxe_total,
          updatedAt: orderVirements[index].updatedAt,
        });
      }
    }

    return aggrigatedOrderVirements;
  },

  aggrigateLoyerComptObjects: async (cmptLoyer) => {
    let aggrigatedCmptLoyer = [];
    for (let index = 0; index < cmptLoyer.length; index++) {
      let montant_net_total = 0,
        montant_tax_total = 0,
        montant_caution_total = 0,
        montant_brut_total = 0,
        montant_brut_loyer_total = 0,
        caution_proprietaire_total = 0,
        tax_avance_proprietaire_total = 0,
        tax_loyer_total = 0,
        montant_loyer_total = 0,
        montant_avance_proprietaire_total = 0,
        retenue_source_total = 0,
        montant_net_without_caution_total = 0;
      let aggrigatedList = [];

      if (!aggrigatedList.includes(orderVirements[index].cin)) {
        for (let j = 0; j < cmptLoyer.length; j++) {
          const _cmptLoyer = cmptLoyer[j];

          montant_net_total = _cmptLoyer.montant_net;
          montant_tax_total = _cmptLoyer.montant_tax;
          montant_caution_total = _cmptLoyer.montant_caution;
          montant_brut_total = _cmptLoyer.montant_brut;
          montant_brut_loyer_total = _cmptLoyer.montant_brut_loyer;
          caution_proprietaire_total = _cmptLoyer.caution_proprietaire;
          tax_avance_proprietaire_total = _cmptLoyer.tax_avance_proprietaire;
          tax_loyer_total = _cmptLoyer.tax_loyer;
          montant_loyer_total = _cmptLoyer.montant_loyer;
          montant_avance_proprietaire_total =
            _cmptLoyer.montant_avance_proprietaire;
          retenue_source_total = _cmptLoyer.retenue_source;
          montant_net_without_caution_total =
            _cmptLoyer.montant_net_without_caution;

          aggrigatedList.push(_cmptLoyer.cin);
        }

        aggrigatedCmptLoyer.push({
          nom_de_piece: cmptLoyer[index].nom_de_piece,
          nom_prenom: cmptLoyer[index].nom_prenom,
          date_gl: cmptLoyer[index].date_gl,
          date_operation: cmptLoyer[index].date_operation,
          cin: cmptLoyer[index].cin,
          passport: cmptLoyer[index].passport,
          carte_sejour: cmptLoyer[index].carte_sejour,
          type: cmptLoyer[index].type,
          adresse_proprietaire: cmptLoyer[index].adresse_proprietaire,
          adresse_lieu: cmptLoyer[index].adresse_lieu,
          origine: cmptLoyer[index].origine,
          devises: cmptLoyer[index].devises,
          intitule_lieu: cmptLoyer[index].intitule_lieu,
          type_lieu: cmptLoyer[index].type_lieu,
          code_lieu: cmptLoyer[index].code_lieu,
          etablissement: cmptLoyer[index].etablissement,
          centre_de_cout: cmptLoyer[index].centre_de_cout,
          direction_regional: cmptLoyer[index].direction_regional,
          point_de_vente: cmptLoyer[index].point_de_vente,
          numero_contrat: cmptLoyer[index].numero_contrat,
          periodicite: cmptLoyer[index].periodicite,
          taux_impot: cmptLoyer[index].taux_impot,
          date_comptabilisation: cmptLoyer[index].date_comptabilisation,
          updatedAt: cmptLoyer[index].updatedAt,
          declaration_option: cmptLoyer[index].declaration_option,
          caution_versee: cmptLoyer[index].caution_versee,
          avance_versee: cmptLoyer[index].avance_versee,
          mois: cmptLoyer[index].mois,
          annee: cmptLoyer[index].annee,
          is_late: cmptLoyer[index].is_late,
          // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::
          montant_net: montant_net_total,
          montant_tax: montant_tax_total,
          montant_caution: montant_caution_total,
          montant_brut: montant_brut_total,
          montant_brut_loyer: montant_brut_loyer_total,
          caution_proprietaire: caution_proprietaire_total,
          tax_avance_proprietaire: tax_avance_proprietaire_total,
          tax_loyer: tax_loyer_total,
          montant_loyer: montant_loyer_total,
          montant_avance_proprietaire: montant_avance_proprietaire_total,
          retenue_source: retenue_source_total,
          montant_net_without_caution: montant_net_without_caution_total,
        });
      }
    }

    return aggrigatedCmptLoyer;
  },
};
