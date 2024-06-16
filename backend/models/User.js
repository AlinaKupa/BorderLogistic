const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('driverinfo', {
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
},
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

User.beforeCreate(async (user, options) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
