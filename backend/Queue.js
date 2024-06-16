const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Priority = require('./Priority');
const Checkpoints = require('./Checkpoints');
const RegistrationCountry = require('./RegistrationCountry');

const Queue = sequelize.define('Queue', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  foreignPassport: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationCountry: {
    type: DataTypes.INTEGER,
    references: {
      model: RegistrationCountry,
      key: 'id'
    }
  },
  checkpoint: {
    type: DataTypes.INTEGER,
    references: {
      model: Checkpoints,
      key: 'id'
    }
  },
  cargoType: {
    type: DataTypes.INTEGER,
    references: {
      model: Priority,
      key: 'id'
    }
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trailerNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customsDeclaration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  queueTime: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  createdAt: {
    type: DataTypes.TIME,
    allowNull: false
  }
});

Queue.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Queue.belongsTo(Priority, { foreignKey: 'cargoType', as: 'Priority' });
Queue.belongsTo(Checkpoints, { foreignKey: 'checkpoint', as: 'Checkpoint' });
Queue.belongsTo(RegistrationCountry, { foreignKey: 'registrationCountry', as: 'RegistrationCountry' });


module.exports = Queue;
