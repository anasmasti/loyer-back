module.exports = {
  downloadSituationExcel: async (req, res) => {
    let path = `download/generated situation/${req.params.etatType}_xlsx/${req.params.etatType}_${req.params.mois}_${req.params.annee}.xlsx`;
    res.download(path);
  },

  downloadAnnexExcel: async (req, res) => {
    let path = `download/les maquettes DGI/les fichiers excel/annex 2/maquette_teledeclaration_${req.params.annee}.xlsx`;
    res.download(path);
  },
};
