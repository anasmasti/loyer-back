const mongoose = require('mongoose')
const Schema = mongoose.Schema


const RoleSchema = new Schema({
    roleName: {
        type: String,
        required: true
    }
})

const userRoleSchema = new Schema({
    userMatricul: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    prenom: {
        type:String,
        required: true
    },
    userRoles: {
        type:[RoleSchema]
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