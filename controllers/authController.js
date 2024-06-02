const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../modules/userModule');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: 'AKIATCKANXPS67H2QPEX',
  secretAccessKey: '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'
});

const generateToken = (user) => {
  console.log('DATA TOKEN:', user);
  return jwt.sign({ 
    userId: user.id, 
    username: user.username, 
    email: user.email, 
    role: user.role, 
    register_date: user.register_date,
    profile_image: user.profile_image 
  }, 'secretKey', { expiresIn: '168h' });
};

const changeImage = async (req, res) => {
  try {
    const file = req.file;
    const uploadParams = {
      Bucket: 'imagesbucketfordiplom/images/avatars',
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: 'image/jpeg'
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    res.status(200).json({ success: true, userImageUrl: uploadResult.Location });
  } catch (error) {
    console.error('Ошибка при загрузке аватара в S3:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password, register_date } = req.body;
      const role = 'user'; 
      const profile_image = '';

      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [user] = await userModel.createUser({
        username,
        email,
        password: hashedPassword,
        role,
        register_date,
        profile_image,
      });
      const token = generateToken(user);

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await userModel.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          register_date: user.register_date,
          profile_image: user.profile_image 
        },
        'secretKey',
        { expiresIn: '168h' }
      );

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await userModel.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Ошибка при получении списка пользователей:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Ошибка при поиске пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      await userModel.deleteUserById(userId);
      
      res.status(200).json({ message: 'Пользователь успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  updateUsername: async (req, res) => {
    try {
      const userId = req.params.id;
      const newUsername = req.body.newUsername;
      console.log(userId, newUsername)
      const updatedUser = await userModel.updateUsername(userId, newUsername);

      res.json({ message: 'Имя пользователя успешно обновлено', user: updatedUser });
    } catch (error) {
      console.error('Ошибка при обновлении имени пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  updateEmail: async (req, res) => {
    try {
      const userId = req.params.id;
      const newEmail = req.body.newEmail;

      const updatedUser = await userModel.updateEmail(userId, newEmail);

      res.json({ message: 'Email пользователя успешно обновлен', user: updatedUser });
    } catch (error) {
      console.error('Ошибка при обновлении email пользователя:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;

      const result = await userModel.updatePassword(userId, newPassword);

      res.json({ message: result });
    } catch (error) {
      console.error('Ошибка при изменении пароля пользователя:', error.message);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  updateRole: async (req, res) => {
    try {
      const userId = req.params.id;
      const { newRole } = req.body;

      console.log('Received new role:', newRole);

      const result = await userModel.updateRole(userId, newRole);


      res.json({ message: result });
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error.message);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },
  changeImage,

  saveImage: async (req, res) => {
    try {
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secretKey'); 

      const userId = decodedToken.userId;
      const { userImageUrl } = req.body;

      if (!userImageUrl) {
        return res.status(400).json({ message: 'URL изображения не указан' });
      }

      const result = await userModel.saveImage(userId, userImageUrl);
      res.json({ message: result });
    } catch (error) {
      console.error('Ошибка при изменении URL пользователя:', error.message);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  },

  getUser: async(req, res) => {
    const user = req.user;
    const formattedDate = new Date(user.register_date).toLocaleDateString();
    try {
      res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        register_date: formattedDate,
        profile_image: user.profile_image,
      });    
    } catch (error) {
      console.error('Ошибка при получени пользователя:', error.message);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
};
