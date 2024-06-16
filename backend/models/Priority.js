const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Priority = sequelize.define('Priority', {
  priorityLevel: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  }
});

module.exports = Priority;
