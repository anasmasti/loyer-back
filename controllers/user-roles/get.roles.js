const userRoles = require("../../models/roles/roles.model");

module.exports = {
  getAllUserRoles: async (req, res) => {
    await userRoles
      .find()
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(404).send({ message: error.message });
      });
  },

  getUserRolesPerId: async (req, res) => {
    await userRoles
      .findById(req.params.Id)
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res
          .status(404)
          .send({ message: error.message } || "can't get userRoles per ID");
      });
  },

  // getListEmailsByRole: async (req, res) => {
  //   let emailsList = [];

  //   await User.aggregate([
  //     {
  //       $match: {
  //         deleted: false,
  //         userRoles: {
  //           $elemMatch: {
  //             roleCode: userRole,
  //             deleted: false,
  //           },
  //         },
  //       },
  //     },
  //   ])
  //     .then((data) => {
  //       for (let i = 0; i < data.length; i++) {
  //         emailsList.push(data[i].email);
  //       }
  //       console.log(emailsList.join());
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       res.status(400).send({ message: error.message });
  //     });

  //   mail.sendMail(
  //     emailsList.join(),
  //     "Contrat validation",
  //     "validation1",
  //     mailData
  //   );
  // },

  // getAllUserRoles: async (req, res) => {
  //   await userRoles
  //     .aggregate([
  //       {
  //         $match: {
  //           deleted: false,
  //           "userRoles.deleted": false,
  //         },
  //       },
  //       {
  //         $addFields: {
  //           userRoles: {
  //             $map: {
  //               input: {
  //                 $filter: {
  //                   input: "$userRoles",
  //                   as: "userRolesFilter",
  //                   cond: { $eq: ["$$userRolesFilter.deleted", false] },
  //                 },
  //               },
  //               as: "userRolesMap",
  //               in: {
  //                 deleted: "$$userRolesMap.deleted",
  //                 _id: "$$userRolesMap._id",
  //                 roleName: "$$userRolesMap.roleName",
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ])
  //     .then((data) => {
  //       res.status(200).json(data);
  //     })
  //     .catch((error) => {
  //       res.status(401).send({ message: error.message });
  //     });
  // },
};
