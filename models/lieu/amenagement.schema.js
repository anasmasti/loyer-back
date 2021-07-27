const mongoose = require('mongoose')
const Schema = mongoose.Schema
const imageSchema = require('./image.schema')
const fournisseurSchema = require('../../models/lieu/fournisseur.schema')

const amenagementSchema = new Schema({
    nature_amenagement: {
        type:String
    },
    montant_amenagement:{
        type:String
    },
    valeur_nature_chargeProprietaire:{
        type: String
    },
    valeur_nature_chargeFondation:{
        type:String
    },
    numero_facture:{
        type:String
    },
    numero_bon_commande:{
        type:String
    },
    date_passation_commande:{
        type:String
    },
    fournisseurs: {
        type:[fournisseurSchema]
    },
    evaluation_fournisseur:{
        type:String
    },
    date_fin_travaux:{
        type:String
    },
    date_livraison_local:{
        type:String
    },
    images_apres_travaux:{
        type:[imageSchema],
        required: false
    },
    croquis_travaux:{
        type:[imageSchema],
        required: false
    },
    deleted:{
        type:Boolean,
        default: false
    }
})



module.exports = amenagementSchema