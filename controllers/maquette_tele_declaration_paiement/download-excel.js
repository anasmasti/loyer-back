module.exports = {
  downloadExcelFile: async (req, res) => {
    let path = `download/les maquettes DGI/les fichiers excel/annex 2/maquette_teledeclaration_${req.params.annee}.xlsx`;
    res.download(path);
  },
};
