const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Checkpoints = sequelize.define('Checkpoints', {
  registrationCountryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING
  }
});

module.exports = Checkpoints;
