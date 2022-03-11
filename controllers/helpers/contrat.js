const Contrat = require("../../models/contrat/contrat.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");

module.exports = {
  createContratAV: async (
    req,
    res,
    ContratData,
    numeroContrat,
    piece_jointe_avenant
  ) => {
    // Update ( montant loyer )
    mntLoyer = ContratData.montant_loyer;
    ContratData.etat_contrat.etat.motif.forEach((motif) => {
      if (motif.type_motif == "Révision du prix du loyer") {
        mntLoyer = motif.montant_nouveau_loyer;
      }
    });

    const nouveauContrat = new Contrat({
      numero_contrat: numeroContrat,
      date_debut_loyer: ContratData.date_debut_loyer,
      date_fin_contrat: ContratData.date_fin_contrat,
      date_reprise_caution: ContratData.date_reprise_caution,
      date_premier_paiement: ContratData.date_premier_paiement,
      montant_loyer: mntLoyer,
      taxe_edilite_loyer: ContratData.taxe_edilite_loyer,
      taxe_edilite_non_loyer: ContratData.taxe_edilite_non_loyer,
      periodicite_paiement: ContratData.periodicite_paiement,
      duree_location: ContratData.duree_location,
      declaration_option: ContratData.declaration_option,
      taux_impot: ContratData.taux_impot,
      duree: ContratData.duree,
      retenue_source_par_mois: ContratData.retenue_source_par_mois,
      total_montant_brut_loyer: ContratData.total_montant_brut_loyer,
      total_montant_net_loyer: ContratData.total_montant_net_loyer,
      retenue_source: ContratData.retenue_source,
      montant_apres_impot: ContratData.montant_apres_impot,
      montant_caution: ContratData.montant_caution,
      duree_caution: ContratData.duree_caution,
      statut_caution: ContratData.statut_caution,
      montant_avance: ContratData.montant_avance,
      date_fin_avance: ContratData.date_fin_avance,
      duree_avance: ContratData.duree_avance,
      n_engagement_depense: ContratData.n_engagement_depense,
      echeance_revision_loyer: ContratData.echeance_revision_loyer,
      // date_comptabilisation: ContratData.date_comptabilisation,
      date_comptabilisation: null, // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      foncier: ContratData.foncier,
      // etat_contrat: {
      //   libelle: "En cours de validation",
      //   etat: ContratData.etat_contrat.etat,
      // },
      etat_contrat: {
        libelle: "En cours de validation",
        etat: {
          n_avenant: ContratData.etat_contrat.etat.n_avenant,
          motif: ContratData.etat_contrat.etat.motif,
          date_effet_av: ContratData.etat_contrat.etat.date_effet_av,
          piece_jointe_avenant: piece_jointe_avenant,
          deleted_proprietaires:
            ContratData.etat_contrat.etat.deleted_proprietaires,
        },
      },
      old_contrat: [
        {
          contrat: req.params.Id,
        },
      ],
      piece_joint_contrat: piece_jointe_avenant,
    });

    await nouveauContrat
      .save()
      // .then(async(data) => {
      //     // await Foncier.findByIdAndUpdate({ _id: req.params.IdFoncier }, { contrat: data._id });
      //     // res.json(data)
      // })
      .catch((error) => {
        console.log("error here");
        res.status(400).send({ message: error.message });
      });
  },

  deleteProprietaire: async (req, res, proprietareId) => {
    await Proprietaire.findByIdAndUpdate(proprietareId, {
      deleted: true,
    }).catch((error) => {
      res.status(400).send({ message: error.message });
    });
    // console.log("Done", proprietareId);
  },

  storeFiles: async (req, fileName) => {
    let storedFiles = [];
    for (let i = 0; i < 8; i++) {
      let file = req.files[`${fileName}${i + 1}`];
      console.log(`${fileName}${i + 1}`, req.files[`${fileName}${i + 1}`]);
      if (file) {
        storedFiles.push({
          image: file[0].path,
        });
      }
    }
    return storedFiles;
  },
};
