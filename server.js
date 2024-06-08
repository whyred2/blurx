const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const apiRoutes = require('./routes/authRoutes.js');
const contentRoutes = require('./routes/contentRoutes.js');
const commentsRoutes = require('./routes/commentRoutes.js');
const favoritesRoutes = require('./routes/favoritesRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const { authenticateToken } = require('./middleware/authenticateToken.js');
const userModel = require('./modules/userModule.js');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: 'https://client.d24mrj9smrlg9o.amplifyapp.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());


app.use('/auth', apiRoutes);
app.use('/content', contentRoutes);
app.use('/comment', commentsRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/admin', adminRoutes);

cron.schedule('0 */12 * * *', async () => {
    try {
      const response = await axios.delete(`http://localhost:3001/admin/admin-chat/delete`);
      console.log(response.data.message);
  } catch (error) {
      console.error('Error running scheduled task:', error);
  }
});

app.patch('/profile/update-username', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const newUsername = req.body.newUsername;

  try {
    console.log(userId);
    await userModel.updateUsername(userId, newUsername);

    res.status(200).send('Username updated successfully');
  } catch (error) {
    console.error('Ошибка при обновлении username:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.patch('/profile/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const result = await userModel.changePassword(userId, oldPassword, newPassword);
    
    res.status(200).send(result);
  } catch (error) {
    console.error('Ошибка при изменении пароля:', error.message);
    res.status(400).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
