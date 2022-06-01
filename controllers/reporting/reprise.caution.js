const moment = require('moment');
const Contrat = require('../../models/contrat/contrat.model');
const generatePdfs = require("../helpers/shared/generate_pdfs");


module.exports = {
    repriseCaurionReporting: async (req , res) => {
        const today = new Date()
        const todayAfterOneMonth = new Date(moment(today.setMonth(today.getMonth() + 1)).format('YYYY-MM-DD[T]HH:mm:ss')) 
        await Contrat.find({})
        .then((data) => {
            res.json(data)
        })
        .catch((error) => {
            res.status(402).send({message: error.message})
        })
    }
}