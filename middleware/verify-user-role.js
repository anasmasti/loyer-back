const User = require("../models/roles/roles.model");

module.exports = {
  //role DMG
  roleDMG: async (req, res, next) => {
    let roleExist = false;
    let authenticatedUser = await User.findOne({
      userMatricul: req.body.userMatricul,
    });
    if (authenticatedUser) {
      for (let i = 0; i < authenticatedUser.userRoles.length; i++) {
        if (
          authenticatedUser.userRoles[i] ==
          ("Chargé de suivi des loyers et aménagements" ||
            "Chef de département gestion et suivi du patrimoine")
        ) {
          roleExist = true;
        }
      }
      if (roleExist) {
        next();
      } else {
        res.status(401).send({ message: "Pas Autorisé" });
      }
    } else {
      res.status(403).send({ message: "Tu n'as pas aucun accès" });
    }
  },
  //role validation 1
  roleDMGValidation1: async (req, res, next) => {
    let roleExist = false;
    let authenticatedUser = await User.findOne({
      userMatricul: req.body.userMatricul,
    });
    if (authenticatedUser) {
      for (let i = 0; i < authenticatedUser.userRoles.length; i++) {
        if (
          authenticatedUser.userRoles[i] ==
          "Chef de département gestion et suivi du patrimoine"
        ) {
          roleExist = true;
        }
      }
      if (roleExist) {
        next();
      } else {
        res.status(401).send({ message: "Pas Autorisé" });
      }
    } else {
      res.status(403).send({ message: "Tu n'as pas aucun accès" });
    }
  },
  //role validation 2
  roleDAJCValidation2: async (req, res, next) => {
    let roleExist = false;
    let authenticatedUser = await User.findOne({
      userMatricul: req.body.userMatricul,
    });
    if (authenticatedUser) {
      for (let i = 0; i < authenticatedUser.userRoles.length; i++) {
        if (
          authenticatedUser.userRoles[i] ==
          "Direction Affaires Juridiques et Conformité"
        ) {
          roleExist = true;
        }
      }
      if (roleExist) {
        next();
      } else {
        res.status(401).send({ message: "Pas Autorisé" });
      }
    } else {
      res.status(403).send({ message: "Tu n'as pas aucun accès" });
    }
  },
};
