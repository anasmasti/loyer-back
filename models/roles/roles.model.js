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
    userRoles: [RoleSchema]
},
    { timestamps: true }
)

const userRoles = mongoose.model('userRoles', userRoleSchema)

module.exports = userRoles;