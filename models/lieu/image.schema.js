const mongoose = require('mongoose')
const Schmea = mongoose.Schema

const imageSchema = new Schmea({
    image: {
        type: String
    },
}, { timestamps: true })

module.exports = imageSchema