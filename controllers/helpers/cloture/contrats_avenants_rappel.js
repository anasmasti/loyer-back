const createObjectHelper = require("../shared/create_objects");

const lateAvenantTreatment = async (
  res,
  Contrat,
  ContratSchema,
  Cloture,
  treatmentMonth,
  treatmentAnnee
) => {
  let comptabilisationLoyerCrediter = [],
    ordreVirement = [];
  let montantBrutMandataire = 0;
  let montantTaxeMandataire = 0;
  let montantNetMandataire = 0;
  let dateDebutLoyer;
  try {
    console.log("==========");

    Contrat.proprietaires.forEach((proprietaire) => {
      for (let g = 0; g < Contrat.foncier.lieu.length; g++) {
        if (Contrat.foncier.lieu[g].deleted == false) {
          if (proprietaire.is_mandataire) {
            dateDebutLoyer = Contrat.date_debut_loyer;
            montantBrutMandataire =
              (proprietaire.part_proprietaire *
                Contrat.etat_contrat.etat
                  .etat_contrat_rappel_montant_loyer_ma) /
              Contrat.nombre_part;
            montantTaxeMandataire =
              (proprietaire.part_proprietaire *
                Contrat.etat_contrat.etat.etat_contrat_rappel_montant_taxe_ma) /
              Contrat.nombre_part;
            montantNetMandataire =
              montantBrutMandataire - montantTaxeMandataire;
            console.log(Contrat.foncier.lieu[g]);
            comptabilisationLoyerCrediter.push(
              createObjectHelper.createComptLoyerCredObject(
                Contrat,
                proprietaire,
                Contrat.foncier.lieu[g],
                null,
                montantNetMandataire,
                montantTaxeMandataire,
                montantBrutMandataire,
                0,
                dateDebutLoyer,
                0,
                montantNetMandataire,
                treatmentMonth,
                treatmentAnnee,
                false,
                true,
                true,
                true
              )
            );
            if (proprietaire.proprietaire_list.length != 0) {
              for (let k = 0; k < proprietaire.proprietaire_list.length; k++) {
                let montantBrut = 0;
                let montantTaxe = 0;
                let montantNet = 0;

                montantBrut =
                  (proprietaire.proprietaire_list[k].part_proprietaire *
                    Contrat.etat_contrat.etat
                      .etat_contrat_rappel_montant_loyer_ma) /
                  Contrat.nombre_part;
                montantTaxe =
                  (proprietaire.proprietaire_list[k].part_proprietaire *
                    Contrat.etat_contrat.etat
                      .etat_contrat_rappel_montant_taxe_ma) /
                  Contrat.nombre_part;
                montantNet = +montantBrut.toFixed(2) - +montantTaxe.toFixed(2);

                montantBrutMandataire += +montantBrut.toFixed(2);
                montantTaxeMandataire += +montantTaxe.toFixed(2);
                montantNetMandataire += +montantNet.toFixed(2);

                comptabilisationLoyerCrediter.push(
                  createObjectHelper.createComptLoyerCredObject(
                    Contrat,
                    proprietaire.proprietaire_list[k],
                    Contrat.foncier.lieu[g],
                    null,
                    montantNet,
                    montantTaxe,
                    montantBrut,
                    0,
                    dateDebutLoyer,
                    0,
                    montantNet,
                    treatmentMonth,
                    treatmentAnnee,
                    false,
                    true,
                    true,
                    true
                  )
                );
              }
            }

            ordreVirement.push(
              createObjectHelper.createOrderVirementObject(
                Contrat.foncier.lieu[g],
                proprietaire,
                Contrat.numero_contrat,
                Contrat.periodicite_paiement,
                treatmentMonth,
                treatmentAnnee,
                montantNetMandataire,
                montantBrutMandataire,
                montantTaxeMandataire,
                Contrat.updatedAt,
                true
              )
            );
          }
        }
      }
    });

    if (Cloture) {
      let etatContrat = {
        libelle: Contrat.etat_contrat.libelle,
        etat: Contrat.etat_contrat.etat,
      };

      etatContrat.etat.is_overdued_av = false;
      await ContratSchema.findByIdAndUpdate(Contrat._id, {
        etat_contrat: etatContrat,
      }).catch((error) => {
        console.log("Error : ", error);
      });
    }
  } catch (error) {
    console.log(error);
  }

  return {
    comptabilisationLoyerCrediter,
    ordreVirement,
  };
};

module.exports = lateAvenantTreatment;
