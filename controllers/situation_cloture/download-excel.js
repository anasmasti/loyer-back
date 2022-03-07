module.exports = {
  downloadExcelFile: async (req, res) => {
    let path = `download/generated situation/${req.params.etatType}_xlsx/${req.params.etatType}_${req.params.mois}_${req.params.annee}.xlsx` 
    res.download(path);
  },
};