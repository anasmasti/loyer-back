const express = require('express')

const chartBarH = require("../controllers/charts/barChartH");
const chartBarV = require("../controllers/charts/barChartV");
const adChartCircle = require("../controllers/charts/advancedCircleChart");
const chartCirclData = require("../controllers/charts/circlChart");

const router = express.Router();

router.route("chart/bar-h").get(chartBarH.barChartHorizontal);
router.route("chart/bar-v").get(chartBarV.barChartVertical);
router.route("chart/advanced-circl").get(adChartCircle.advancedCircleChart);
router.route("chart/circl").get(chartCirclData.CirclChart);

module.exports = router;