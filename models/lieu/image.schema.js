const mongoose = require('mongoose')
const Schmea = mongoose.Schema

const imageSchema = new Schmea({
    image: {
        type: String
    },
    image_idm:{
        type: String
    }
}, { timestamps: true })

module.exports = imageSchema