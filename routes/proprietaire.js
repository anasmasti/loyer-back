const express = require('express');
const router = express.Router()
const Proprietaire = require('../models/proprietaire.model')


// Ajouter Propriétaire 
router.post('/', async (req, res) => {

    if (req.body.has_mandataire == true) {
        const proprietaire = new Proprietaire({
            cin: req.body.cin,
            passport: req.body.passport,
            carte_sejour: req.body.carte_sejour,
            nom: req.body.nom,
            prenom: req.body.prenom,
            raison_social: req.body.raison_social,
            n_registre_commerce: req.body.n_registre_commerce,
            telephone: req.body.telephone,
            fax: req.body.fax,
            adresse: req.body.adresse,
            n_compte_bancaire: req.body.n_compte_bancaire,
            banque: req.body.banque,
            nom_agence_bancaire: req.body.nom_agence_bancaire,
            has_mandataire: req.body.has_mandataire,
            mandataire: {
                cin: req.body.mandataire.cin,
                nom: req.body.mandataire.nom,
                prenom: req.body.mandataire.prenom,
                raison_social: req.body.mandataire.raison_social,
                telephone: req.body.mandataire.telephone,
                fax: req.body.mandataire.fax,
                adresse: req.body.mandataire.adresse,
                n_compte_bancaire: req.body.mandataire.n_compte_bancaire
            }
        })

        await proprietaire.save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Cant send data${error}`)
        })
    }
    else {
        const proprietaire = new Proprietaire({
            cin: req.body.cin,
            passport: req.body.passport,
            carte_sejour: req.body.carte_sejour,
            nom: req.body.nom,
            prenom: req.body.prenom,
            raison_social: req.body.raison_social,
            n_registre_commerce: req.body.n_registre_commerce,
            telephone: req.body.telephone,
            fax: req.body.fax,
            adresse: req.body.adresse,
            n_compte_bancaire: req.body.n_compte_bancaire,
            banque: req.body.banque,
            nom_agence_bancaire: req.body.nom_agence_bancaire,
            has_mandataire: req.body.has_mandataire,
        })

        await proprietaire.save()
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Cant send data${error}`)
        })
    }
});

// Modifier Propriétaire 
router.put('/:Id' , async(req, res) => {

    if (req.body.has_mandataire == true) {
        await Proprietaire.findByIdAndUpdate(req.params.Id, {
            cin: req.body.cin,
            passport: req.body.passport,
            carte_sejour: req.body.carte_sejour,
            nom: req.body.nom,
            prenom: req.body.prenom,
            raison_social: req.body.raison_social,
            n_registre_commerce: req.body.n_registre_commerce,
            telephone: req.body.telephone,
            fax: req.body.fax,
            adresse: req.body.adresse,
            n_compte_bancaire: req.body.n_compte_bancaire,
            banque: req.body.banque,
            nom_agence_bancaire: req.body.nom_agence_bancaire,
            has_mandataire: req.body.has_mandataire,
            mandataire: {
                cin: req.body.mandataire.cin,
                nom: req.body.mandataire.nom,
                prenom: req.body.mandataire.prenom,
                raison_social: req.body.mandataire.raison_social,
                telephone: req.body.mandataire.telephone,
                fax: req.body.mandataire.fax,
                adresse: req.body.mandataire.adresse,
                n_compte_bancaire: req.body.mandataire.n_compte_bancaire
            }
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Cannot modify with Id : ${req.params.Id}` + error)
        })
    }
    else {
        await Proprietaire.findByIdAndUpdate(req.params.Id, {
            cin: req.body.cin,
            passport: req.body.passport,
            carte_sejour: req.body.carte_sejour,
            nom: req.body.nom,
            prenom: req.body.prenom,
            raison_social: req.body.raison_social,
            n_registre_commerce: req.body.n_registre_commerce,
            telephone: req.body.telephone,
            fax: req.body.fax,
            adresse: req.body.adresse,
            n_compte_bancaire: req.body.n_compte_bancaire,
            banque: req.body.banque,
            nom_agence_bancaire: req.body.nom_agence_bancaire,
            has_mandataire: req.body.has_mandataire,
            mandataire:[]
        })
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Cannot modify with Id : ${req.params.Id}` + error)
        })
    }
});

router.get('/', async(req, res) => {
    await Proprietaire.find() 
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(200).json(`Cannot Get data :  ${error}`)
        })
});

router.get('/:Id', async(req,res) => {
    await Proprietaire.findById(req.params.Id)
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(500).json(`Not found with Id : ${req.params.Id}` + error)
        })
});

router.delete('/:Id', async(req, res) => {
    await Proprietaire.findByIdAndDelete(req.params.Id)
        .then(() => {
            res.json(`Deleted`)
        })
        .catch(error => {
            res.status(400).json(`Cannot delete with Id : ${req.params.Id}` + error)
        })
})

module.exports = router;