const mongoose = require('mongoose')
const Schema = mongoose.Schema


const RoleSchema = new Schema({
    roleName: {
        type: String,
        required: true
    },
    roleCode: {
        type: String,
        
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

const userRoleSchema = new Schema({
    userMatricul: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    nom:{
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    userRoles: {
        type:[RoleSchema]
    },
    email: {
        type: String,  
    },
    code_dr: {
        type:String,
        required: true
    },
    deleted:{
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

const userRoles = mongoose.model('userRoles', userRoleSchema)

module.exports = userRoles;