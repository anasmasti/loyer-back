const Foncier = require('../../models/foncier/foncier.model')

module.exports = {

    postFoncier: async (req, res) => {
        const foncier = new Foncier({
            proprietaire: req.body.proprietaire,
            type_foncier: req.body.type_foncier,
            adresse: req.body.adresse,
            description: req.body.description,
            lieu: req.body.lieu,
            assure: req.body.assure,
            etat_du_bien: req.body.etat_du_bien,
            ville: req.body.ville,
            code_postal: req.body.code_postal,
            pays: req.body.pays,
            montant_loyer: req.body.montant_loyer,
            meuble_equipe: req.body.meuble_equipe,
            deleted: false
        })

        await foncier.save()
        .then((data) => {
            res.json(data)
        })
        .catch((error)=> {
            res.status(403).send({message: error.message})
        })
    }

}