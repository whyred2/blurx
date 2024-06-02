const bcrypt = require('bcryptjs');
const db = require('../db');

const updateUsername = async (userId, newUsername) => {
  const result = await db('users')
    .where('id', userId)
    .update({ username: newUsername })
    .returning('*');

  return result[0];
};

const updateEmail = async (userId, newEmail) => {
  const result = await db('users')
    .where('id', userId)
    .update({ email: newEmail })
    .returning('*');

  return result[0];
};

const updateRole = async (userId, newRole) => {
  const result = await db('users')
    .where('id', userId)
    .update({ role: newRole })    
    .returning('*');
  
  return result[0];
};

const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await db('users').where('id', userId).select('id', 'password').first();
    
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new Error('Старый пароль введен неверно');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db('users').where('id', userId).update({ password: hashedNewPassword });

    return 'Пароль успешно изменен';
  } catch (error) {
    throw error;
  }
};

async function getAllUsers() {
  try {
    const users = await db.select('id', 'username', 'email', 'role', 'register_date', 'profile_image').from('users');
    return users;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const user = await db.select('id', 'username', 'email', 'role', 'register_date', 'profile_image').from('users').where('id', userId).first();
    return user;
  } catch (error) {
    throw error;
  }
};

const deleteUserById = async (userId) => {
  try {
    const deletedUser = await db('users').where('id', userId).del().returning('*');
    
    if (deletedUser.length === 0) {
      throw new Error('Пользователь не найден');
    }

    return 'Пользователь успешно удален';
  } catch (error) {
    throw error;
  }
};

const updatePassword = async (userId, newPassword) => {
  try {
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db('users').where('id', userId).update({ password: hashedNewPassword });

    return 'Пароль успешно изменен';
  } catch (error) {
    throw error;
  }
};

const saveImage = async(userId, userImageUrl) => {
  try {
    await db('users').where('id', userId).update('profile_image', userImageUrl).returning('*');

    return 'Аватар успешно загружен';
  } catch (error) {
    throw error;
  }
};


module.exports = {
  createUser: async (userData) => {
    const { email } = userData;
  
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  
    return db('users').insert(userData).returning('*');
  },
  

  getUserByEmail: async (email) => {
    return db('users').where('email', email).first();
  },

  updateUsername,
  updateEmail,
  changePassword,
  getAllUsers,
  getUserById,
  deleteUserById,
  updatePassword,
  updateRole,

  saveImage,
};