const express = require('express')

const chartBarH = require("../controllers/charts/barChartH");
const chartBarV = require("../controllers/charts/barChartV");
const adChartCircle = require("../controllers/charts/advancedCircleChart");
const chartCirclData = require("../controllers/charts/circlChart");

const router = express.Router();

router.route("/bar-h").get(chartBarH.barChartHorizontal);
router.route("/bar-v").get(chartBarV.barChartVertical);
router.route("/advanced-circl").get(adChartCircle.advancedCircleChart);
router.route("/circl").get(chartCirclData.CirclChart);

module.exports = router;