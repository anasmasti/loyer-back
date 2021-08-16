const Contrat = require("../../models/contrat/contrat.model");

module.exports = {
  modifierContrat: async (req, res) => {
    let item = 0, piece_joint = [], images_etat_lieu_sortie = [], lettre_res_piece_jointe = [], piece_jointe_avenant = []

    if (req.files) {
      if (req.files.piece_joint) {
        piece_joint.push({
          image: req.files.piece_joint.path
        })
      }
      if (req.files.images_etat_lieu_sortie) {
        images_etat_lieu_sortie.push({
          image: req.files.images_etat_lieu_sortie.path
        })
      }
      if (req.files.lettre_res_piece_jointe) {
        lettre_res_piece_jointe.push({
          image: req.files.lettre_res_piece_jointe.path
        })
      }
      if (req.files.piece_jointe_avenant) {
        piece_jointe_avenant.push({
          image: req.files.piece_jointe_avenant.path
        })
      }
    }
  },
}