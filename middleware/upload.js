const path = require('path')
const multer = require('multer')


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/')
    },
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname)
        let name = new Date().toJSON().slice(0,10).toString()
        callback(null, name + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed" || file.mimetype === "image/jpeg") {
            callback(null, true)
        } else {
            console.log('les fichiers doit etre au format compresse zip');
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024*1024*2
    }
})

module.exports = upload;