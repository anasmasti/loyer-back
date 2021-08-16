const mongoose = require('mongoose')
const Schmea = mongoose.Schema

const fileSchema = new Schmea({
    image: {
        type: String
    },
    image_idm:{
        type: String
    }
}, { timestamps: true })

module.exports = fileSchema