const Lieu = require("../../models/lieu/lieu.model");

module.exports = {
  ajouterLieu: async (req, res, next) => {
    //check lieu if already exist
    const codeLieuExist = await Lieu.findOne({ code_lieu: req.body.code_lieu });

    if (
      codeLieuExist &&
      codeLieuExist.code_lieu != "" &&
      codeLieuExist.code_lieu != null
    ) {
      return res.status(422).send({ message: "Le code lieu est deja pris" });
    }

    let directeurRegional = [],
      item = 0;

    for (item in req.body.directeur_regional) {
      directeurRegional.push({
        matricule: req.body.directeur_regional[item].matricule,
        nom: req.body.directeur_regional[item].nom,
        prenom: req.body.directeur_regional[item].prenom,
        deleted_directeur: false,
      });
    }

    const lieu = new Lieu({
      code_lieu: req.body.code_lieu,
      intitule_lieu: req.body.intitule_lieu,
      code_localite: req.body.code_localite,
      telephone: req.body.telephone,
      fax: req.body.fax,
      type_lieu: req.body.type_lieu,
      code_rattache_DR: req.body.code_rattache_DR,
      code_rattahce_SUP: req.body.code_rattahce_SUP,
      intitule_rattache_SUP_PV: req.body.intitule_rattache_SUP_PV,
      centre_cout_siege: req.body.centre_cout_siege,
      categorie_pointVente: req.body.categorie_pointVente,
      etat_logement_fonction: req.body.etat_logement_fonction,
      directeur_regional: directeurRegional,
      deleted: false,
    });
    await lieu
      .save()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(402).send({ message: error.message });
      });
  },
};
