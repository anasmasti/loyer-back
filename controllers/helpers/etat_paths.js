const etatPaths = require("../../models/situation_cloture/etatPaths.schema");
// const Reporting = require("../../models/reporting/reporting.model");

async function storePaths(mois, annee, extentionSent, dateToString, etatType) {
  let reportingPaths = [];
  let extention = extentionSent == "xlsx" ? "excel" : extentionSent;

  await etatPaths
    .find({
      mois: mois,
      annee: annee,
    })
    .then(async (data) => {
      // return console.log(data);
      try {
        if (data.length == 0) {
          reportingPaths.push({
            [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extentionSent}/${etatType}_${dateToString}.${extentionSent}`,
            // extention: extention,
          });
          let etat_paths = new etatPaths({
            etat_paths: reportingPaths,
            mois: mois,
            annee: annee,
          });
          return await etat_paths.save();
        } else {
          console.log("test 4");
          for (let i = 0; i < data[0].etat_paths.length; i++) {
            // for (j in data[0].etat_paths[i]) {
            //   if (
            //     data[0].etat_paths[i][j] ==
            //     `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`
            //   ) {
            //     reportingPaths.push({
            //       [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extention}/${etatType}_${dateToString}.${extention}`,
            //     });
            //   } else {
            reportingPaths.push(data[0].etat_paths[i]);
            // }
            // }
          }
          let pathExist = false;
          for (let k = 0; k < reportingPaths.length; k++) {
            if (
              Object.keys(reportingPaths[k])[0] == `${etatType}_${extention}`
            ) {
              pathExist = true;
            }
          }

          if (pathExist == false) {
            reportingPaths.push({
              [`${etatType}_${extention}`]: `download/generated situation/${etatType}_${extentionSent}/${extention}/${etatType}_${dateToString}.${extentionSent}`,
            });
          }

          await etatPaths.findOneAndUpdate(
            { mois: mois, annee: annee },
            {
              etat_paths: reportingPaths,
              mois: data[0].mois,
              annee: data[0].annee,
            }
          );
        }
      } catch (error) {
        throw error;
      }
    })
    .catch((error) => {
      // res.status(402).send({ message: error.message })
      console.log(error);
    });
}

module.exports = storePaths;
