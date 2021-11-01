const express = require('express')

const chartBarH = require("../controllers/charts/barChartH");
const chartBarV = require("../controllers/charts/barChartV");
const adChartCircle = require("../controllers/charts/advancedCircleChart");
const chartCirclData = require("../controllers/charts/circlChart");

const router = express.Router();

router.route("/chartBarH").get(chartBarH.barChartHorizontal);
router.route("/chartBarV").get(chartBarV.barChartVertical);
router.route("/chartAdvancedCircl").get(adChartCircle.advancedCircleChart);
router.route("/ChartCircl").get(chartCirclData.CirclChart);

module.exports = router;