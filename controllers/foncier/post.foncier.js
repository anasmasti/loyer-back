const Foncier = require("../../models/foncier/foncier.model");
const FilesHelper = require("../helpers/files");
module.exports = {
  ajouterFoncier: async (req, res, next) => {
    let lieu = [],
      data = null;
    try {
      data = await JSON.parse(req.body.data);
      // data = req.body.data;
      // return console.log(data);
    } catch (error) {
      return res.status(422).send({ message: error.message });
    }

    lieu.push({
      lieu: data.lieu,
      deleted: false,
      // transferer: false,
      etat_lieu: "Occupé",
    });

    if (data.has_amenagements == true) {
      let amenagements = [],
        imagesLieu = [],
        // fournisseur = [],
        imagesAmenagement = [],
        imagesCroquis = [];

      if (req.files) {
        imagesLieu = await FilesHelper.storeFiles(req, "imgs_lieu_entrer");
        // if (req.files.imgs_lieu_entrer) {
        //   for (item in req.files.imgs_lieu_entrer) {
        //     imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
        //   }
        // }
      }
      //add amenagements in array
      for (item in data.amenagement) {
        let idmData = data.amenagement[item].idm;
        let idm = idmData.replace(".pdf", "");
        //add fournisseurs in amenagements array
        // for (let j in data.amenagement[item].fournisseur) {
        //   fournisseur.push({
        //     nom: data.amenagement[item].fournisseur[j].nom,
        //     prenom: data.amenagement[item].fournisseur[j].prenom,
        //     amenagements_effectuer:
        //       data.amenagement[item].fournisseur[j].amenagements_effectuer,
        //   });
        // }
        if (req.files) {
          if (req.files.imgs_amenagement) {
            for (let i in req.files.imgs_amenagement) {
              if (
                req.files.imgs_amenagement[i].originalname ==
                data.amenagement[item].idm
              )
                imagesAmenagement.push({
                  image: req.files.imgs_amenagement[i].path,
                  image_idm: idm,
                });
            }
          }
          if (req.files.imgs_croquis) {
            for (let k in req.files.imgs_croquis) {
              if (
                req.files.imgs_croquis[k].originalname ==
                data.amenagement[item].idm
              ) {
                imagesCroquis.push({
                  image: req.files.imgs_croquis[k].path,
                  image_idm: idm,
                });
              }
            }
          }
        }
        // if (req.files) {
        //   imagesAmenagement = await FilesHelper.storeAmngmentFiles(
        //     req,
        //     "imgs_amenagement",
        //     data.amenagement[item].idm
        //   );
        //   // if (req.files.imgs_amenagement) {
        //   // for (let i in req.files.imgs_amenagement) {
        //   //   if (
        //   //     req.files.imgs_amenagement[i].originalname ==
        //   //     data.amenagement[item].idm
        //   //   )
        //   //     imagesAmenagement.push({
        //   //       image: req.files.imgs_amenagement[i].path,
        //   //       image_idm: idm,
        //   //     });
        //   // }
        //   // }
        //   imagesCroquis = await FilesHelper.storeAmngmentFiles(
        //     req,
        //     "imgs_croquis",
        //     data.amenagement[item].idm
        //   );

        //   // if (req.files.imgs_croquis) {
        //   //   for (let k in req.files.imgs_croquis) {
        //   //     if (
        //   //       req.files.imgs_croquis[k].originalname ==
        //   //       data.amenagement[item].idm
        //   //     ) {
        //   //       imagesCroquis.push({
        //   //         image: req.files.imgs_croquis[k].path,
        //   //         image_idm: idm,
        //   //       });
        //   //     }
        //   //   }
        //   // }
        // }
        amenagements.push({
          idm: idm,
          nature_amenagement: data.amenagement[item].nature_amenagement,
          montant_amenagement: data.amenagement[item].montant_amenagement,
          valeur_nature_chargeProprietaire:
            data.amenagement[
              item
            ].valeur_nature_chargeProprietaire.toUpperCase(),
          valeur_nature_chargeFondation:
            data.amenagement[item].valeur_nature_chargeFondation.toUpperCase(),
          numero_facture: data.amenagement[item].numero_facture.toUpperCase(),
          numero_bon_commande:
            data.amenagement[item].numero_bon_commande.toUpperCase(),
          date_passation_commande:
            data.amenagement[item].date_passation_commande,
          evaluation_fournisseur:
            data.amenagement[item].evaluation_fournisseur.toUpperCase(),
          date_fin_travaux: data.amenagement[item].date_fin_travaux,
          date_livraison_local: data.amenagement[item].date_livraison_local,
          fournisseur: data.amenagement[item].fournisseur.toUpperCase(),
          images_apres_travaux: imagesAmenagement,
          croquis_travaux: imagesCroquis,
        });
        // fournisseur = [];
        imagesAmenagement = [];
        imagesCroquis = [];
      }

      const foncier = new Foncier({
        adresse: data.adresse.toUpperCase(),
        ville: data.ville,
        desc_lieu_entrer: data.desc_lieu_entrer,
        imgs_lieu_entrer: imagesLieu,
        has_amenagements: data.has_amenagements,
        amenagement: amenagements,
        superficie: data.superficie,
        etage: data.etage.toUpperCase(),
        lieu: lieu,
        type_lieu: data.type_lieu,
        // etat: data.etat,
      });
      await foncier
        .save()
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
    } else {
      let imagesLieu = [],
        item = 0;

      if (req.files) {
        imagesLieu = await FilesHelper.storeFiles(req, "imgs_lieu_entrer");

        // if (req.files.imgs_lieu_entrer) {
        //   for (item in req.files.imgs_lieu_entrer) {
        //     imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
        //   }
        // }
      }
      const foncier = new Foncier({
        adresse: data.adresse.toUpperCase(),
        ville: data.ville,
        desc_lieu_entrer: data.desc_lieu_entrer,
        imgs_lieu_entrer: imagesLieu,
        has_amenagements: data.has_amenagements,
        superficie: data.superficie,
        etage: data.etage.toUpperCase(),
        lieu: lieu,
        type_lieu: data.type_lieu,
        contrat: null,
        // etat: data.etat,
      });
      await foncier
        .save()
        .then((data) => {
          res.json(data._id);
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
    }
  },
};
