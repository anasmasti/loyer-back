const express = require("express");
const postFoncier = require("../controllers/foncier/post.foncier");
const putFoncier = require("../controllers/foncier/put.foncier");
const getFoncier = require("../controllers/foncier/get.foncier");
const deleteFoncier = require("../controllers/foncier/delete.foncier");
const upload = require("../middleware/upload");

const router = express.Router();
router.route("/foncier/ajouter").post(
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]), postFoncier.ajouterFoncier
);
router.route("/foncier/modifier/:IdFoncier").put(
  upload.fields([
    { name: "imgs_lieu_entrer", maxCount: 5 },
    { name: "imgs_amenagement", maxCount: 5 },
    { name: "imgs_croquis", maxCount: 5 },
  ]), putFoncier.modifierFoncier
);
router.route("/foncier/all").get(getFoncier.getAllFoncier);
router.route("/foncier/detail/:IdFoncier").get(getFoncier.getFoncierById);
router.route("/foncier/supprimer/:IdFoncier").put(deleteFoncier.deleteFoncier);

module.exports = router