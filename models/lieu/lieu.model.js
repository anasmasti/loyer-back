const mongoose = require('mongoose')
const Schema = mongoose.Schema
const imageSchema = require('./image.schema')
const amenagementSchema = require('./amenagement.schema')


const lieuSchema = new Schema({
    code_lieu: {
        type: String,
    },
    intitule_lieu: {
        type: String,
    },
    intitule_DR: {
        type: String
    },
    adresse: {
        type: String
    },
    ville: {
        type: String
    },
    code_localite: {
        type: String
    },
    desc_lieu_entrer: {
        type: String
    },
    imgs_lieu_entrer: {
        type: [imageSchema]
    },
    has_amenagement:{
        type:Boolean,
        default:false
    },
    superficie:{
        type:String
    },
    telephone:{
        type:Number
    },
    fax:{
        type:Number,
    },
    etage:{
        type:String
    },
    type_lieu:{
        type:String
    },
    code_rattache_DR:{
        type:String
    },
    code_rattache_SUP:{
        type:String
    },
    amenagements:{
        type:[amenagementSchema]
    },
    intitule_rattache_SUP_PV:{
        type:String
    },
    centre_cout_siege:{
        type:String
    },
    categorie_pointVente:{
        type:String
    }

},
    { timestamps: true }
)

const Lieu = mongoose.model('Lieu', lieuSchema)

module.exports = Lieu