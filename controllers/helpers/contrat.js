const Contrat = require("../../models/contrat/contrat.model");
const User = require("../../models/roles/roles.model");
const Proprietaire = require("../../models/proprietaire/proprietaire.model");
const ProprietaireHelper = require("./proprietaire")
const mail = require("../../helpers/mail.send");

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
      date_comptabilisation: ContratData.date_comptabilisation, // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      foncier: ContratData.foncier,
      is_avenant: true,
      nombre_part: ContratData.nombre_part,
      etat_contrat: {
        libelle: "Initié",
        etat: {
          n_avenant: ContratData.etat_contrat.etat.n_avenant,
          is_avenant: true,
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

    ProprietaireHelper.proprietaireASupprimer(ContratData);

    await nouveauContrat
      .save()
      .catch((error) => {
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
      if (file) {
        storedFiles.push({
          image: file[0].path,
        });
      }
    }
    return storedFiles;
  },

  sendMailToAll: async (contratId) => {
    await Contrat.findOne({ _id: contratId, deleted: false })
      .populate({
        path: "foncier",
        populate: {
          path: "proprietaire",
          populate: { path: "proprietaire_list" },
        },
      })
      .then(async (contrat) => {
        await User.aggregate([
          {
            $match: {
              deleted: false,
              userRoles: {
                $elemMatch: {
                  deleted: false,
                  $or: [
                    {
                      roleCode: "DAJC",
                    },
                    {
                      roleCode: "CDGSP",
                    },
                    {
                      roleCode: "CSLA",
                    },
                  ],
                },
              },
            },
          },
        ])
          .then(async (data_) => {
            let DAJCemailsList = [];
            for (let i = 0; i < data_.length; i++) {
              DAJCemailsList.push(data_[i].email);
            }

            let contratName;
            if (contrat.is_avenant) {
              contratName = 'Avenant'
            }
            if (!contrat.is_avenant) {
              contratName = 'Le contrat'
            }

            let DAJCmailData = {
              message:
                `${contratName} n°${contrat.numero_contrat} ( ${contrat.foncier.type_lieu} ) a été validé.`,
            };

            if (DAJCemailsList.length > 0) {
              mail.sendMail(
                `${DAJCemailsList.join()}`,
                "Contrat validé",
                "validation1",
                DAJCmailData
              );
            }
          })
          .catch((error) => {
            console.log(error);
            res.status(400).send({ message: error.message });
          });
      });
  },
};
