const Queue = require('../models/Queue');
const Priority = require('../models/Priority');
const User = require('../models/User');
const Checkpoints = require("../models/Checkpoints");
const RegistrationCountry = require("../models/RegistrationCountry");
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

exports.createQueue = async (req, res) => {
  const { fullName, foreignPassport, email, password, phoneNumber, registrationCountry, checkpoint, cargoType, vehicleNumber, trailerNumber, customsDeclaration, status } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Користувача з такою поштою не існує' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Неправильний пароль' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).send('Користувач не автентифікований');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newQueue = await Queue.create({
      fullName,
      foreignPassport,
      email,
      password: hashedPassword,
      phoneNumber,
      registrationCountry,
      checkpoint,
      cargoType,
      vehicleNumber,
      trailerNumber,
      customsDeclaration,
      status,
      userId: req.user.id,
      queueTime: '0'
    });

    res.json(newQueue);
  } catch (err) {
    console.error("Помилка під час створення черги: ", err.message);
    res.status(500).send('Серверна помилка');
  }
}

exports.getQueues = async (req, res) => {
  try {
    const queues = await Queue.findAll({ where: { userId: req.user.id } });
    res.json(queues);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getQueueById = async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Чергу не знайдено!' });
    }
    res.json(queue);
  } catch (error) {
    console.error('Серверна помилка:', error);
    res.status(500).json({ message: 'Серверна помилка', error });
  }
};


exports.updateQueue = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log('Запит на оновлення черги:', req.body);
  try {
    let queue = await Queue.findOne({ where: { id, userId: req.user.id } });
    if (!queue) return res.status(404).json({ msg: 'Чергу не знайдено!' });
    Object.keys(req.body).forEach(key => {
      queue[key] = req.body[key];
    });
    await queue.save();
    console.log('Черга успішно оновлена:', queue);
    res.json(queue);
  } catch (err) {
    console.error('Помилка оновлення черги:', err);
    res.status(500).send('Серверна помилка');
  }
};

exports.deleteQueue = async (req, res) => {
  const { id } = req.params;
  try {
    let queue = await Queue.findOne({ where: { id, userId: req.user.id } });
    if (!queue) return res.status(404).json({ msg: 'Чергу не знайдено!' });
    await queue.destroy();
    res.json({ msg: 'Черга успішно видалена' });
  } catch (err) {
    res.status(500).send('Серверна помилка');
  }
};


exports.getRegistrationCountries = async (req, res) => {
  try {
    const countries = await RegistrationCountry.findAll();
    res.json(countries);
  } catch (err) {
    res.status(500).send('Server error');
  }
};


exports.getCheckpoints = async (req, res) => {
  const { country } = req.params;
  console.log("Received country parameter: ", country);
  try {
    const checkpoints = await Checkpoints.findAll({ where: { registrationCountryId: country } });
    console.log("Fetched checkpoints: ", checkpoints);

    if (checkpoints.length === 0) {
      console.warn("No checkpoints found for country: ", country);
      return res.status(404).send(`No checkpoints found for country: ${country}`);
    }

    res.json(checkpoints);
  } catch (err) {
    console.error("Error fetching checkpoints: ", err);
    res.status(500).send('Server error');
  }
};


exports.getCargoTypes = async (req, res) => {
  try {
    const priorities = await Priority.findAll();
    res.json(priorities);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const calculateWaitingTimes = (queues) => {
  const sortedQueues = queues.sort((a, b) => {
    if (a.Priority.priorityLevel === b.Priority.priorityLevel) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return a.Priority.priorityLevel - b.Priority.priorityLevel;
  });

  sortedQueues.forEach((queue, index) => {
    queue.dataValues.waitingTime = index * 30; 
  });

  return sortedQueues;
};

exports.getUserQueues = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching queues for user ID:', userId);
    const allPendingQueues = await Queue.findAll({
      where: { status: 'pending' },
      include: [
        { model: Priority, as: 'Priority' },
        { model: Checkpoints, as: 'Checkpoint' }
      ]
    });

    if (!allPendingQueues.length) {
      return res.status(404).send('No pending queues found');
    }

    const updatedQueues = calculateWaitingTimes(allPendingQueues);

    const userQueues = updatedQueues.filter(queue => queue.userId === userId);

    console.log('Sorted and updated queues:', userQueues);

    res.json(userQueues);
  } catch (err) {
    console.error('Error fetching user queues:', err);
    res.status(500).send('Server error');
  }
};

const checkQueuesAndNotify = async () => {
  try {
    const queues = await Queue.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, as: 'User' },
        { model: Checkpoints, as: 'Checkpoint' },
        { model: Priority, as: 'Priority' }
      ]
    });

    console.log('Queues fetched:', queues.length);
    const queuesWithWaitingTimes = calculateWaitingTimes(queues);

    for (let queue of queuesWithWaitingTimes) {
      const waitingTime = queue.dataValues.waitingTime;
      console.log(`Queue ID: ${queue.id}, Waiting Time: ${waitingTime}`);
      if (waitingTime <= 30) {
        const userEmail = queue.email;
        const userName = queue.fullName;
        const checkpointName = queue.Checkpoint.title;

        console.log(`Sending email to: ${userEmail}`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'email',
            pass: 'password',
          },
        });

        const mailOptions = {
          from: 'email',
          to: userEmail,
          subject: 'Нагадування!',
          text: `Шановний(а) ${userName}, до заїзду на пункт пропуску ${checkpointName} залишилося менше 30 хвилин.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email', error);
          } else {
            console.log('Email sent', info);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking queues and sending notifications:', error);
  }
};

cron.schedule('*/5 * * * *', checkQueuesAndNotify);
