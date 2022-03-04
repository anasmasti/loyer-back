module.exports = {
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
    console.log(storedFiles);
    return storedFiles;
  },

  storeAmngmentFiles: async (req, fileName, idm) => {
    let storedFiles = [];
    for (let i = 0; i < 8; i++) {
      let file = req.files[`${fileName}${i + 1}`];
      console.log(`${fileName}${i + 1}`, req.files[`${fileName}${i + 1}`]);
      if (file) {
        if (file[0].originalname == idm) {
          storedFiles.push({
            image: file[0].path,
          });
        }
      }
    }
    return storedFiles;
  },
};
