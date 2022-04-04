module.exports = {
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
    console.log("storedFiles");
    console.log(storedFiles);
    return storedFiles;
  },

  storeAmngmentFiles: async (req, fileName, idm) => {
    let storedFiles = [];
    for (let i = 0; i < 8; i++) {
      let file = req.files[`${fileName}${i + 1}`];
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

  storeUpdateAmngmentFiles: async (req, fileName, idm, amenagement) => {
    let storedFiles = [];
    for (let i = 0; i < 8; i++) {
      let file = req.files[`${fileName}${i + 1}`];
      if (file) {
        let originalName = file[0].originalname ? file[0].originalname.replace(".pdf", "") : "";
        // if (originalName == idm) {
          if (amenagement.deleted == false) {
            storedFiles.push({
              image: file[0].path,
              image_idm: idm,
            });
          } else if (amenagement.deleted == true) {
            storedFiles.push({
              image: file[0].path,
              image_idm: idm,
              deleted: true,
            });
          // }
        }
      }
    }
    return storedFiles;
  },
};
