module.exports = {
  getHome: async (req, res) => {
    let today = new Date()
    res.send(today)
    // res.send(true);
  },
};
