const path = require("path");
const multer = require("multer");
const { error } = require("console");
const { json } = require("body-parser");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/");
  },
  filename: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    let name =
      new Date().toJSON().slice(0, 10).toString() + "-" + new Date().getTime();
    callback(null, name + ext);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype === "application/pdf") {
      callback(null, true);
    } else {
      callback(
        JSON.stringify({ messgae: "les fichiers doit etre au format PDF" }),
        false
      );
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

module.exports = upload;
