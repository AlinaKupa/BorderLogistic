const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegistrationCountry = sequelize.define('RegistrationCountry', {
  country: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = RegistrationCountry;
