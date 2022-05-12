const Lieu = require("../../models/lieu/lieu.model");

module.exports = {
  ajouterLieu: async (req, res, next) => {
    //check code lieu if already exist
    const codeLieuExist = await Lieu.findOne({
      deleted: false,
      code_lieu: req.body.code_lieu,
    });

    if (
      codeLieuExist &&
      codeLieuExist.code_lieu != "" &&
      codeLieuExist.code_lieu != null
    ) {
      return res.status(422).send({ message: "Le code lieu est deja pris" });
    }

    //check intitulé lieu if already exist
    const intituleLieuExist = await Lieu.findOne({
      deleted: false,
      intitule_lieu: req.body.intitule_lieu.toUpperCase(),
    });

    if (
      intituleLieuExist &&
      intituleLieuExist.intitule_lieu != "" &&
      intituleLieuExist.intitule_lieu != null
    ) {
      return res.status(422).send({ message: "L'intitulé lieu est deja pris" });
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

    // if (req.body.type_lieu == "Logement de fonction") {
    //   const directionRegional = await Lieu.findOne({ code_lieu: req.body.code_rattache_DR });

    //   if (directionRegional) {
    //     intituleLieu = `LF/${directionRegional.intitule_lieu}`;
    //   }
    //   else res.status(422).send({ message: "DR n'existe pas" });
    // }
    // else intituleLieu = req.body.intitule_lieu

    const lieu = new Lieu({
      code_lieu: req.body.code_lieu,
      intitule_lieu: req.body.intitule_lieu.toUpperCase(),
      code_localite: req.body.code_localite,
      telephone: req.body.telephone,
      fax: req.body.fax,
      type_lieu: req.body.type_lieu,
      // code_rattache_DR: req.body.code_rattache_DR,
      attached_DR: req.body.attached_DR,
      attached_SUP: req.body.attached_SUP,
      // code_rattache_SUP: req.body.code_rattache_SUP,
      // intitule_rattache_SUP_PV: req.body.intitule_rattache_SUP_PV,
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
