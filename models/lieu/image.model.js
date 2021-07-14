const mongoose = require('mongoose')
const Schmea = mongoose.Schema


const imageSchema = new Schmea({
    image: {
        data: Buffer,
        contentType: String
    }
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image