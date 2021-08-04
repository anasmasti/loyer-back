const path = require('path')
const multer = require('multer')


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/')
    },
    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname)
        callback(null, new Date().getTime() + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        if (file.mimetype === "application/vnd.rar" || file.mimetype === "application/x-zip-compressed" || file.mimetype === "image/png") {
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