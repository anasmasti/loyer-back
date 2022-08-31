const Contrat = require("../../models/contrat/contrat.model");
const Lieu = require("../../models/lieu/lieu.model");
const Foncier = require("../../models/foncier/foncier.model");
const FilesHelper = require("../helpers/files");
const TreatmentDate = require("../helpers/shared/treatmentDate");

module.exports = {
  ajouterContrat: async (req, res) => {
    // variables
    let piece_joint_contrat = [],
      data,
      idLieu,
      requestedLieu = null;

    // fill the required fields
    if (Object.keys(req.body).length === 0)
      return res
        .status(402)
        .send({ message: "Merci de remplir tous les champs obligatoires !" });

    //controlling the incoming form-data and return error if it exist
    try {
      // parse incoming data to json
      data = await JSON.parse(req.body.data);
      // data = await req.body.data;
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }

    //stock file in array
    if (req.files) {
      piece_joint_contrat = await FilesHelper.storeFiles(
        req,
        "piece_joint_contrat"
      );
    }

    //filter id_lieu in the requested foncier
    let requestedFoncier = await Foncier.findById({
      _id: req.params.IdFoncier,
    });

    for (let i in requestedFoncier.lieu) {
      if (requestedFoncier.lieu[i].deleted == false) {
        idLieu = requestedFoncier.lieu[i].lieu;
      }
    }

    if (idLieu != null) {
      //find lieu that is requested from foncier
      requestedLieu = await Lieu.findById({ _id: idLieu }).populate({
        path: "attached_DR",
        select: "intitule_lieu code_lieu",
      });
    } else {
      return res.status(422).send({
        message: "Aucune entité organisationnelle attachée à ce local !",
      });
    }

    // Check if contrat is overdued
    let is_overdued = false;
    const treatmentDate = await TreatmentDate(req, res);
    const dateDebutLoyerMonth = new Date(data.date_debut_loyer).getMonth() + 1;
    const dateDebutLoyerYear = new Date(data.date_debut_loyer).getFullYear();
    if (
      (dateDebutLoyerMonth < treatmentDate.getMonth() + 1 &&
        dateDebutLoyerYear == treatmentDate.getFullYear()) ||
      dateDebutLoyerYear < treatmentDate.getFullYear()
    ) {
      is_overdued = true;
    }

    //set numero de contrat
    let numeroContrat;
    requestedLieu.type_lieu == "Logement de fonction"
      ? (numeroContrat =
          requestedLieu.attached_DR.code_lieu +
          "/" +
          requestedLieu.intitule_lieu)
      : (numeroContrat =
          requestedLieu.code_lieu + "/" + requestedLieu.intitule_lieu);

    //store contrat
    const nouveauContrat = new Contrat({
      numero_contrat: numeroContrat,
      date_debut_loyer: data.date_debut_loyer,
      date_fin_contrat: data.date_fin_contrat,
      date_reprise_caution: data.date_reprise_caution,
      date_premier_paiement: data.date_premier_paiement,
      montant_loyer: data.montant_loyer,
      taxe_edilite_loyer: data.taxe_edilite_loyer,
      taxe_edilite_non_loyer: data.taxe_edilite_non_loyer,
      periodicite_paiement: data.periodicite_paiement,
      duree_location: data.duree_location,
      declaration_option: data.declaration_option,
      taux_impot: data.taux_impot,
      duree: data.duree,
      retenue_source_par_mois: data.retenue_source_par_mois,
      total_montant_brut_loyer: data.total_montant_brut_loyer,
      total_montant_net_loyer: data.total_montant_net_loyer,
      retenue_source: data.retenue_source,
      montant_apres_impot: data.montant_apres_impot,
      montant_caution: data.montant_caution,
      duree_caution: data.duree_caution,
      statut_caution: data.statut_caution,
      montant_avance: data.montant_avance,
      date_fin_avance: data.date_fin_avance,
      duree_avance: data.duree_avance,
      n_engagement_depense: data.n_engagement_depense,
      echeance_revision_loyer: data.echeance_revision_loyer,
      date_comptabilisation: null,
      // type_lieu: data.type_lieu,
      foncier: req.params.IdFoncier,
      nombre_part: data.nombre_part,
      // For boot data migration
      is_overdued: is_overdued,
      // caution_versee: data.caution_versee,
      // avance_versee: data.avance_versee,
      // date_comptabilisation: data.date_comptabilisation,
      etat_contrat: {
        libelle: "Initié",
        etat: {},
      },
      piece_joint_contrat: piece_joint_contrat,
    });
    await nouveauContrat
      .save()
      .then(async (data) => {
        await Foncier.findByIdAndUpdate(
          { _id: req.params.IdFoncier },
          { contrat: data._id }
        );
        res.json(data);
      })
      .catch((error) => {
        res.status(400).send({ message: error.message });
      });
  },
};
