import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


import './Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [newUsername, setNewUsername] = useState(userInfo ? userInfo.username : '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [favorites] = useState([]);

  const [userImage, setUserImage] = useState(null);
  const uploadButtonRef = useRef(null);

  

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('https://blurx-cd4ad36829cd.herokuapp.com/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setUserInfo(response.data);
        setUserImage(response.data.profile_image);
      } catch (error) {
        console.error('Ошибка при получении данных профиля:', error);
        navigate('/login');
      }
    };

    fetchProfileData();
  }, [navigate]);

  

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleEditButtonClick = () => {
    setIsEditingUsername(true);
  };

  const handleCloseModal = () => {
    setIsEditingUsername(false);
    setIsChangingPassword(false);

    setNewUsername('');
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handlePasswordChange = async () => {
    try {
      await axios.patch(
        'https://blurx-cd4ad36829cd.herokuapp.com/profile/change-password',
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      toast.success('Пароль успішно змінено!');
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Помилка при зміні пароля:', error);
      toast.error('Помилка при зміні пароля. Будь ласка, перевірте введені дані та спробуйте знову.');
    }
  };

  const handleSaveButtonClick = async () => {
    try {
      await axios.patch(
        'https://blurx-cd4ad36829cd.herokuapp.com/profile/update-username',
        { newUsername },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        username: newUsername,
      }));

      toast.success('Имя пользователя успешно обновлено!');
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Ошибка при обновлении username:', error);
    }
    setIsEditingUsername(false);
  };

  const handleImageButtonClick = () => {
    if (uploadButtonRef.current) {
      uploadButtonRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("Выбранное изображение:", file);
    console.log('handleImageChange function called');
  
    uploadUserImage(file);
  };
  
  const uploadUserImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("userImage", file);
  
      const response = await axios.post(
        "https://blurx-cd4ad36829cd.herokuapp.com/auth/change-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      saveUserImage(response.data.userImageUrl);
      console.log("Аватар успешно загружен:", response.data.userImageUrl);
      setUserImage(response.data.userImageUrl);
      // Обновляем токен, если он был изменен на сервере
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      console.error("Ошибка при загрузке обложки:", error);
    }
  };
  
  const saveUserImage = async (userImageUrl) => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
  
      console.log('userId:', userId); // Логируем userId
      console.log('userImageUrl:', userImageUrl); // Логируем userImageUrl
  
      const response = await axios.patch(
        'https://blurx-cd4ad36829cd.herokuapp.com/auth/save-user-image',
        { userId, userImageUrl }, // Передаем userId и userImageUrl на сервер
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
        
      
      console.log(response.data);
      setUserInfo((prevUserInfo) => ({
        ...prevUserInfo,
        profile_image: userImageUrl,
      }));
      } catch (error) {
      console.error('Ошибка при обновлении URL изображения пользователя:', error);
    }
  };

  return (
    <main className="profile">
      <section className="profile-section">
        <header className="profile-header">
          <h1 className="main-title">Профіль</h1>
        </header>

        <div className="profile-container">
          <div className="main-top">
            <div className="user">
              <div className="user-img">
                <button className="upload-btn" onClick={handleImageButtonClick}>
                  {userImage ? (
                    <img
                      className="profile-image"
                      src={userImage}
                      alt="Аватар"
                    />
                  ) : (
                    <p className='text'>Оберіть зображення</p>
                  )}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={uploadButtonRef}
                  style={{ display: "none" }}
                />
              </div>

              <div className="user-info">
                <header className="user-header">
                  <div className="user-header-top">
                    <h3 className="user-header-title">
                      {userInfo && userInfo.username}
                    </h3>
                    {userInfo && userInfo.register_date && (
                      <div className="user-joining">
                        <span>Дата реєстрації: </span>{userInfo.register_date}
                      </div>
                    )}
                  </div>
                  {userInfo && userInfo.role === "user" ? (
                    <span className="user-role">Користувач</span>
                  ) : (
                    <span className="user-role">Адміністратор</span>
                  )}
                </header>
                <div className="user-bottom">
                  <button
                    className="regular-btn"
                    onClick={handleEditButtonClick}
                  >
                    Змінити ім'я
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="main-bottom">
            <div className="profile-favorite">
              <h3 className="profile-favorite-title">Обране</h3>
              <ul>
                {favorites.map((favorite) => (
                  <li key={favorite.movie_id}>
                    <span>{favorite.movie_id}</span>
                    <span>{favorite.timestamp}</span>
                  </li>
                ))}
              </ul>
              <button
                className="regular-btn"
                onClick={() => navigate("/favorites")}
              >
                Дивитися список
              </button>
            </div>

            <div className="security">
              <h3 className="security-title">Безпека</h3>

              <div className="security-top">
                <div className="security-option">
                  <div className="security-option-inner">
                    <span>Пошта</span>
                  </div>
                  <div className="security-option-inner">
                    <span>Пароль</span>
                  </div>
                </div>
                <div className="security-value">
                  <span>{userInfo && userInfo.email}</span>
                  <span>******</span>
                </div>
              </div>
              <Link
                to=""
                className="regular-btn security-btn"
                onClick={() => setIsChangingPassword(true)}
              >
                Редагувати
              </Link>
            </div>
          </div>
        </div>
        {isEditingUsername ? (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-row">
                <div className="modal-change">
                  <h3 className="change-title">Змінити ім'я</h3>
                  <form className="change-form">
                    <label className="input-label">
                      <h4 className="input-label-title">Нове ім'я</h4>
                      <input
                        className="change-input"
                        type="text"
                        placeholder="Введіть нове ім'я"
                        value={newUsername}
                        onChange={handleUsernameChange}
                      />
                    </label>
                    <button
                      type="button"
                      className="main-btn"
                      onClick={handleSaveButtonClick}
                    >
                      Зберегти
                    </button>
                    <button
                      type="button"
                      className="regular-btn"
                      onClick={handleCloseModal}
                    >
                      Закрити
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-hidden"></div>
        )}
        {isChangingPassword ? (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-row">
                <form className="modal-change">
                  <h3 className="change-title">Змінити пароль</h3>
                  <div className="change-form">
                    <label className="input-label">
                      <h4 className="input-label-title">Старий пароль</h4>
                      <input
                        className="change-input"
                        type="password"
                        placeholder="Введіть старий пароль"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </label>

                    <label className="input-label">
                      <h4 className="input-label-title">Новий пароль</h4>
                      <input
                        className="change-input"
                        type="password"
                        placeholder="Введіть новий пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </label>

                    <label className="input-label">
                      <h4 className="input-label-title">
                        Підтвердіть новий пароль
                      </h4>
                      <input
                        className="change-input"
                        type="password"
                        placeholder="Підтвердіть новий пароль"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="main-btn"
                      onClick={handlePasswordChange}
                    >
                      Змінити пароль
                    </button>
                    <button
                      type="button"
                      className="regular-btn"
                      onClick={handleCloseModal}
                    >
                      Закрити
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-hidden"></div>
        )}
      </section>
    </main>
  );
};

export default Profile;