const userRoles = require("../../models/roles/roles.model");

module.exports = {
  getAllUserRoles: async (req, res) => {
    await userRoles
      .aggregate([
        {
          $match: {
            deleted: false,
            "userRoles.deleted": false,
          },
        },
        {
          $addFields: {
            userRoles: {
              $map: {
                input: {
                  $filter: {
                    input: "$userRoles",
                    as: "userRolesFilter",
                    cond: { $eq: ["$$userRolesFilter.deleted", false] },
                  },
                },
                as: "userRolesMap",
                in: {
                  deleted: "$$userRolesMap.deleted",
                  _id: "$$userRolesMap._id",
                  roleName: "$$userRolesMap.roleName",
                },
              },
            },
          },
        },
      ])
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(401).send({ message: error.message });
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
          .send({ message: error.message } || "cant get userRoles per ID");
      });
  },
};
