const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const auth = require('../middleware/auth');

router.post('/createQueue', auth, queueController.createQueue);
router.get('/', auth, queueController.getQueues);
router.put('/:id', auth, queueController.updateQueue);
router.delete('/:id', auth, queueController.deleteQueue);
router.get('/registrationCountries', queueController.getRegistrationCountries);
router.get('/checkpoints/:country', queueController.getCheckpoints);
router.get('/cargoTypes', queueController.getCargoTypes);
router.get('/queues', auth, queueController.getUserQueues);
router.get('/queues/:id', auth, queueController.getQueueById);

module.exports = router;
