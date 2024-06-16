const User = require('../models/User');
const Queue = require('../models/Queue');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

exports.register = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ where: { userName } });
    if (user) return res.status(400).json({ msg: 'Такий користувач вже існує!' });
    user = await User.create({ userName, email, password });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).send('Серверна помилка');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'Неправильні дані!' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Неправильні дані!' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user.id });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching profile for user ID:', userId);
    const user = await User.findByPk(userId, {
      attributes: ['userName', 'email', 'password']
    });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server error');
  }
}; 

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const userId = req.user.id;
    console.log('User ID from token:', userId); 
    const user = await User.findByPk(userId);
    if (!user) {
      console.log('User not found:', userId); 
      return res.status(404).json({ msg: 'User not found' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log('Invalid old password for user ID:', userId); 
      return res.status(400).json({ msg: 'Invalid old password' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    console.log('Password changed successfully for user ID:', userId); 
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err.message); 
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  const { userId, userName, email, currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
      
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    user.userName = userName || user.userName;
    user.email = email || user.email;
    
    await user.save();
    
    res.json({ msg: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};


