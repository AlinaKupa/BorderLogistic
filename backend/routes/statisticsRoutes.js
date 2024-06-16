const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/totalVehiclesAmount', statisticsController.getTotalVehiclesAmount);
router.get('/totalWaitingTime', statisticsController.getTotalWaitingTime);
router.get('/checkpointStatistics', statisticsController.getCheckpointStatistics);
router.get('/statistics', statisticsController.getStatistics);


module.exports = router;