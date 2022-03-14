const Foncier = require("../../models/foncier/foncier.model");
const FilesHelper = require("../helpers/files");

module.exports = {
  modifierFoncier: async (req, res, next) => {
    let lieu = [],
      data = null;

    try {
      data = await JSON.parse(req.body.data);
    } catch (error) {
      return res.status(422).send({ message: error.message });
    }

    for (let i in data.lieu) {
      lieu.push(data.lieu[i]);
    }

    if (data.has_amenagements == true) {
      let amenagements = [],
        imagesLieu = [],
        fournisseur = [],
        imagesAmenagement = [],
        imagesCroquis = [];

      if (req.files) {
        imagesLieu = await FilesHelper.storeFiles(req, "imgs_lieu_entrer");
        // if (req.files.imgs_lieu_entrer) {
        //     for (let item in req.files.imgs_lieu_entrer) {
        //       imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
        //     }
        //   }
      }

      //add the existing file paths
      for (let item in data.imgs_lieu_entrer) {
        imagesLieu.push(data.imgs_lieu_entrer[item]);
      }

      for (let item in data.amenagement) {
        let idmData = data.amenagement[item].idm;
        let idm = idmData.replace(".pdf", "");

        //update fournisseurs in amenagements array
        for (let j in data.amenagement[item].fournisseur) {
          if (data.amenagement[item].deleted == false) {
            fournisseur.push({
              nom: data.amenagement[item].fournisseur[j].nom,
              prenom: data.amenagement[item].fournisseur[j].prenom,
              amenagements_effectuer:
                data.amenagement[item].fournisseur[j].amenagements_effectuer,
              deleted: data.amenagement[item].fournisseur[j].deleted || false,
            });
          } else if (data.amenagement[item].deleted == true) {
            fournisseur.push({
              nom: data.amenagement[item].fournisseur[j].nom,
              prenom: data.amenagement[item].fournisseur[j].prenom,
              amenagements_effectuer:
                data.amenagement[item].fournisseur[j].amenagements_effectuer,
              deleted: true,
            });
          }
        }
        // if (false) {

        if (req.files) {
          // imagesAmenagement = await FilesHelper.storeUpdateAmngmentFiles(
          //   req,
          //   "imgs_amenagement",
          //   idm,
          //   data.amenagement[item]
          // );

          if (req.files.imgs_amenagement) {
            for (let i in req.files.imgs_amenagement) {
              let fileData = req.files.imgs_amenagement[i].originalname;
              let originalName = fileData.replace(".pdf", "");
              if (originalName == idm) {
                if (data.amenagement[item].deleted == false) {
                  imagesAmenagement.push({
                    image: req.files.imgs_amenagement[i].path,
                    image_idm: idm,
                  });
                } else if (data.amenagement[item].deleted == true) {
                  imagesAmenagement.push({
                    image: req.files.imgs_amenagement[i].path,
                    image_idm: idm,
                    deleted: true,
                  });
                }
              }
            }
          }
          // imagesCroquis = await FilesHelper.storeUpdateAmngmentFiles(
          //   req,
          //   "imgs_croquis",
          //   idm,
          //   data.amenagement[item]
          // );
          if (req.files.imgs_croquis) {
            for (let k in req.files.imgs_croquis) {
              let fileData = req.files.imgs_croquis[k].originalname;
              let originalName = fileData.replace(".pdf", "");
              if (originalName == idm) {
                if (data.amenagement[item].deleted == false) {
                  imagesCroquis.push({
                    image: req.files.imgs_croquis[k].path,
                    image_idm: idm,
                  });
                } else if (data.amenagement[item].deleted == true) {
                  imagesCroquis.push({
                    image: req.files.imgs_croquis[k].path,
                    image_idm: idm,
                    deleted: true,
                  });
                }
              }
            }
          }
        }

        for (let h in data.amenagement[item].images_apres_travaux) {
          // console.log('test1');
          imagesAmenagement.push(
            data.amenagement[item].images_apres_travaux[h]
          );
        }

        for (let t in data.amenagement[item].croquis_travaux) {
          // console.log('test2');
          imagesCroquis.push(data.amenagement[item].croquis_travaux[t]);
        }

        amenagements.push({
          idm: idm,
          deleted: data.amenagement[item].deleted || false,
          nature_amenagement: data.amenagement[item].nature_amenagement,
          montant_amenagement: data.amenagement[item].montant_amenagement,
          valeur_nature_chargeProprietaire:
            data.amenagement[item].valeur_nature_chargeProprietaire,
          valeur_nature_chargeFondation:
            data.amenagement[item].valeur_nature_chargeFondation,
          numero_facture: data.amenagement[item].numero_facture,
          numero_bon_commande: data.amenagement[item].numero_bon_commande,
          date_passation_commande:
            data.amenagement[item].date_passation_commande,
          evaluation_fournisseur: data.amenagement[item].evaluation_fournisseur,
          date_fin_travaux: data.amenagement[item].date_fin_travaux,
          date_livraison_local: data.amenagement[item].date_livraison_local,
          images_apres_travaux: imagesAmenagement,
          croquis_travaux: imagesCroquis,
          fournisseur: fournisseur,
        });
        fournisseur = [];
        imagesAmenagement = [];
        imagesCroquis = [];
      }

      await Foncier.findByIdAndUpdate(
        req.params.IdFoncier,
        {
          adresse: data.adresse,
          ville: data.ville,
          desc_lieu_entrer: data.desc_lieu_entrer,
          imgs_lieu_entrer: imagesLieu,
          has_amenagements: data.has_amenagements,
          amenagement: amenagements,
          superficie: data.superficie,
          etage: data.etage,
          lieu: lieu,
          type_lieu: data.type_lieu,
          // etat: data.etat,
        },
        { new: true }
      )
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
      //else
    } else if (data.has_amenagements == false) {
      let amenagements = [],
        imagesLieu = [],
        fournisseur = [],
        imagesAmenagement = [],
        imagesCroquis = [];

      if (req.files) {
        imagesLieu = await FilesHelper.storeFiles(req, "imgs_lieu_entrer");
        // if (req.files.imgs_lieu_entrer) {
        //   for (let item in req.files.imgs_lieu_entrer) {
        //     imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
        //   }
        // }
      }

      for (let item in data.amenagement) {
        //update fournisseurs in amenagements array
        for (let j in data.amenagement[item].fournisseur) {
          fournisseur.push({
            nom: data.amenagement[item].fournisseur[j].nom,
            prenom: data.amenagement[item].fournisseur[j].prenom,
            amenagements_effectuer:
              data.amenagement[item].fournisseur[j].amenagements_effectuer,
            deleted: true,
          });
        }

        for (let i in data.amenagement[item].imgs_amenagement) {
          imagesAmenagement = await FilesHelper.storeFiles(
            req,
            "imgs_amenagement"
          );

          // imagesAmenagement.push({
          //   image: data.amenagement[item].imgs_amenagement[i].image,
          //   deleted: true,
          // });
        }

        for (let k in data.amenagement[item].imgs_croquis) {
          imagesCroquis = await FilesHelper.storeFiles(req, "imgs_croquis");

          // imagesCroquis.push({
          //   image: data.amenagement[item].imgs_croquis[k].image,
          //   deleted: true,
          // });
        }

        amenagements.push({
          deleted: true,
          nature_amenagement: data.amenagement[item].nature_amenagement,
          montant_amenagement: data.amenagement[item].montant_amenagement,
          valeur_nature_chargeProprietaire:
            data.amenagement[item].valeur_nature_chargeProprietaire,
          valeur_nature_chargeFondation:
            data.amenagement[item].valeur_nature_chargeFondation,
          numero_facture: data.amenagement[item].numero_facture,
          numero_bon_commande: data.amenagement[item].numero_bon_commande,
          date_passation_commande:
            data.amenagement[item].date_passation_commande,
          evaluation_fournisseur: data.amenagement[item].evaluation_fournisseur,
          date_fin_travaux: data.amenagement[item].date_fin_travaux,
          date_livraison_local: data.amenagement[item].date_livraison_local,
          images_apres_travaux: imagesAmenagement,
          croquis_travaux: imagesCroquis,
          fournisseur: fournisseur,
        });
        fournisseur = [];
      }

      await Foncier.findByIdAndUpdate(
        req.params.IdFoncier,
        {
          adresse: data.adresse,
          ville: data.ville,
          desc_lieu_entrer: data.desc_lieu_entrer,
          imgs_lieu_entrer: imagesLieu,
          has_amenagements: data.has_amenagements,
          amenagement: amenagements,
          superficie: data.superficie,
          etage: data.etage,
          lieu: lieu,
          type_lieu: data.type_lieu,
          // etat: data.etat,
        },
        { new: true }
      )
        .then((data) => {
          res.json(data);
        })
        .catch((error) => {
          res.status(402).send({ message: error.message });
        });
    }
  },
};
