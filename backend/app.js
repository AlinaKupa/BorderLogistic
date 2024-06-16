const express = require('express');
const sequelize = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');
const queueRoutes = require('./routes/queueRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

app.use('/api/users', userRoutes);
app.use('/api/queues', auth, queueRoutes);
app.use('/api/statistics', statisticsRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.log('Error connecting to the database', err);
});
