const Queue = require('../models/Queue');
const Checkpoints = require("../models/Checkpoints");

  exports.getTotalVehiclesAmount = async (req, res) => {
    try {
      const totalVehicles = await Queue.count({
        where: {
          status: 'pending'
        }
      });
      res.json({ totalVehicles });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Серверна помилка');
    }
  };
  
  exports.getTotalWaitingTime = async (req, res) => {
    try {
      const totalVehicles = await Queue.count({
        where: {
          status: 'pending'
        }
      });
      const waitingTimePerVehicle = 30; 
      const totalWaitingTime = totalVehicles * waitingTimePerVehicle;
      res.json({ totalWaitingTime });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Серверна помилка');
    }
  };
  
  exports.getCheckpointStatistics = async (req, res) => {
    try {
      const checkpoints = await Checkpoints.findAll();
      const statistics = [];
  
      for (const checkpoint of checkpoints) {
        const totalVehicles = await Queue.count({
          where: {
            status: 'pending',
            checkpoint: checkpoint.id
          }
        });
  
        const waitingTimePerVehicle = 30; 
        const totalWaitingTime = totalVehicles * waitingTimePerVehicle;
  
        statistics.push({
          checkpointId: checkpoint.id,
          checkpointName: checkpoint.name,
          totalVehicles,
          totalWaitingTime
        });
      }
  
      res.json(statistics);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Серверна помилка');
    }
  };

  exports.getStatistics = async (req, res) => {
    try {
      const totalVehicles = await Queue.count({
        where: { status: 'pending' }
      });
  
      const totalWaitingTime = totalVehicles * 30;

      const checkpoints = await Checkpoints.findAll();
      const checkpointStatistics = [];
  
      for (const checkpoint of checkpoints) {
        const checkpointVehicles = await Queue.count({
          where: {
            status: 'pending',
            checkpoint: checkpoint.id
          }
        });
  
        const checkpointWaitingTime = checkpointVehicles * 30; 
  
        checkpointStatistics.push({
          checkpointCountry: checkpoint.country,
          checkpointId: checkpoint.id,
          checkpointName: checkpoint.title,
          totalVehicles: checkpointVehicles,
          totalWaitingTime: checkpointWaitingTime
        });
      }

      res.json({
        totalVehicles,
        totalWaitingTime,
        checkpointStatistics
      });
    } catch (err) {
      console.error('Помилка отримання статистики:', err);
      res.status(500).send('Помилка сервера');
    }
  };
  