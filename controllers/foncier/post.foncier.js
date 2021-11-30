const Foncier = require("../../models/foncier/foncier.model");

module.exports = {
  ajouterFoncier: async (req, res, next) => {
    let lieu = [],
      data = null;
    try {
      data = await JSON.parse(req.body.data);
    } catch (error) {
      return res.status(422).send({ message: error.message });
    }
    console.log(data);

    lieu.push({
      lieu: data.lieu,
      deleted: false,
      transferer: false,
    });

    if (data.has_amenagements == true) {
      let amenagements = [],
        imagesLieu = [],
        fournisseur = [],
        imagesAmenagement = [],
        imagesCroquis = [];

      if (req.files) {
        if (req.files.imgs_lieu_entrer) {
          for (item in req.files.imgs_lieu_entrer) {
            imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
          }
        }
      }
      //add amenagements in array
      for (item in data.amenagement) {
        let idmData = data.amenagement[item].idm;
        let idm = idmData.replace(".pdf", "");
        //add fournisseurs in amenagements array
        for (let j in data.amenagement[item].fournisseur) {
          fournisseur.push({
            nom: data.amenagement[item].fournisseur[j].nom,
            prenom: data.amenagement[item].fournisseur[j].prenom,
            amenagements_effectuer:
              data.amenagement[item].fournisseur[j].amenagements_effectuer,
          });
        }
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
        amenagements.push({
          idm: idm,
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

      const foncier = new Foncier({
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
        if (req.files.imgs_lieu_entrer) {
          for (item in req.files.imgs_lieu_entrer) {
            imagesLieu.push({ image: req.files.imgs_lieu_entrer[item].path });
          }
        }
      }

      const foncier = new Foncier({
        adresse: data.adresse,
        ville: data.ville,
        desc_lieu_entrer: data.desc_lieu_entrer,
        imgs_lieu_entrer: imagesLieu,
        has_amenagements: data.has_amenagements,
        superficie: data.superficie,
        etage: data.etage,
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
    }
  },
};
