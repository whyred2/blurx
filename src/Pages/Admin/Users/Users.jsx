import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";

import "./Users.css";
import { Menu, Table } from 'lucide-react';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchUserId, setSearchUserId] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [isAddUser, setIsAddUser] = useState(false);

  const [addUsername, setAddUsername] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");

  const [userId, setUserId] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");

  const [usersStats, setUsersStats] = useState({
    totalUsers: 0,
    users30Days: 0,
    users7Days: 0,
    users1Day: 0
  });

  const [statsVisible, setStatsVisible] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);
  const usersRefStats = useRef(null);
  const usersRefTable = useRef(null);
  const [usersHeightStats, setUsersHeightStats] = useState("0px");
  const [usersHeightTable, setUsersHeightTable] = useState("0px");

  const toggleStatsVisibility = () => {
    setStatsVisible(!statsVisible);
    setUsersHeightStats(
      statsVisible ? "0px" : `${usersRefStats.current.scrollHeight + 15}px`
    );
  };

  const toggleTableVisibility = () => {
    setTableVisible(!tableVisible);
    setUsersHeightTable(
      tableVisible ? "0px" : `${usersRefTable.current.scrollHeight + 15}px`
    );
  };

  useEffect(() => {
    const fetchUsersStats = async () => {
        try {
            const response = await axios.get('http://localhost:3001/admin/users/stats');
            setUsersStats(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке статистики:', error);
        }
    };

    fetchUsersStats();
  }, [usersStats]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Date(dateString).toLocaleDateString(
      undefined,
      options
    );
    return formattedDate;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/all-users");
        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Помилка при отриманні списку користувачів:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/auth/user/${searchUserId}`
      );
      const foundUserData = response.data;

      if (foundUserData) {
        setFoundUser(foundUserData);
      } else {
        console.log("Пользователь не найден");
        setFoundUser(null);
      }
    } catch (error) {
      alert("Помилка пошуку користувача!");
      console.error("Помилка пошуку користувача:", error);
      setFoundUser(null);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post("http://localhost:3001/auth/register", {
        username: addUsername,
        email: addEmail,
        password: addPassword,
        register_date: new Date().toISOString(),
      });

      const user = await axios.get("http://localhost:3001/auth/all-users");
      const usersData = user.data;
      setUsers(usersData);

      alert("Користувач успішно доданий!");
      console.log("Користувач успішно доданий:", response.data);

      setAddUsername("");
      setAddEmail("");
      setAddPassword("");
    } catch (error) {
      alert("Помилка при додаванні користувача.");
      console.error("Помилка при додаванні користувача:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Проверка, чтобы избежать удаления без подтверждения
      const confirmDelete = window.confirm(
        "Вы уверены, что хотите удалить пользователя?"
      );
      if (!confirmDelete) {
        return;
      }

      // Отправка запроса на удаление пользователя
      await axios.delete(`http://localhost:3001/auth/user/${deleteUserId}`);

      // Обновление списка пользователей после удаления
      const response = await axios.get("http://localhost:3001/auth/all-users");
      const usersData = response.data;
      setUsers(usersData);

      setDeleteUserId("");

      alert("Користувач успішно видалено!");
    } catch (error) {
      console.error("Помилка при видаленні користувача:", error);
      alert("Помилка при видаленні користувача. Подробиці в консолі.");
    }
  };

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
  };

  const handleNewUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleNewEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleUpdateUsername = async () => {
    try {
      await axios.patch(
        `http://localhost:3001/auth/user/${userId}/update-username`,
        {
          newUsername: newUsername,
        }
      );

      const response = await axios.get("http://localhost:3001/auth/all-users");
      const usersData = response.data;
      setUsers(usersData);

      setUserId("");
      setNewUsername("");

      alert(`Ім'я користувача успішно оновлено`);
    } catch (error) {
      alert("Помилка зміни імені користувача. Подробиці у консолі.");
      console.error("Помилка під час оновлення імені користувача:", error);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      await axios.patch(
        `http://localhost:3001/auth/user/${userId}/update-email`,
        {
          newEmail: newEmail,
        }
      );

      const response = await axios.get("http://localhost:3001/auth/all-users");
      const usersData = response.data;
      setUsers(usersData);

      setUserId("");
      setNewEmail("");

      alert("Email користувача успішно оновлено");
    } catch (error) {
      alert("Помилка при оновленні email користувача");
      console.error("Помилка при оновленні email користувача:", error);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/auth/user/${userId}/update-password`,
        {
          newPassword: newPassword,
        }
      );

      console.log(response.data.message);
    } catch (error) {
      console.error("Помилка зміни пароля:", error.message);
    }
  };

  const handleUpdateRole = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/auth/user/${userId}/update-role`,
        {
          newRole: newRole,
        }
      );

      const user = await axios.get("http://localhost:3001/auth/all-users");
      const usersData = user.data;
      setUsers(usersData);

      alert("Роль користувача успішно оновлено!");
      console.log(response.data.message);
    } catch (error) {
      console.error("Помилка зміни ролі:", error.message);
    }
  };

  return (
    <div className="admin-conteiner">
      <div className={`admin-component ${statsVisible ? "open" : ""}`}>
        <h2
          className="admin-main-title admin-text-icon"
          onClick={toggleStatsVisibility}
        >
          <Menu
            className={`admin-icon ${statsVisible ? "clicked" : ""}`}
            size={40}
          />
          Загальна статистика користувачів
        </h2>

        <div
          className={`admin-item-list ${statsVisible ? "open" : ""}`}
          style={{
            maxHeight: usersHeightStats,
            transition: "max-height 0.3s ease-out",
          }}
          ref={usersRefStats}
        >
          <div className="admin-item">
            <div className="admin-item-title">
              {usersStats.totalUsers}
            </div>
            <div className="admin-item-span">Всього користувачів</div>
          </div>
          <div className="admin-item">
            <div className="admin-item-title">
              {usersStats.users30Days}
            </div>
            <div className="admin-item-span">Користувачів за 30 днів</div>
          </div>
          <div className="admin-item">
            <div className="admin-item-title">
              {usersStats.users7Days}
            </div>
            <div className="admin-item-span">Користувачів за 7 днів</div>
          </div>
          <div className="admin-item">
            <div className="admin-item-title">
              {usersStats.users1Days}
            </div>
            <div className="admin-item-span">Користувачів за цей день</div>
          </div>
        </div>
      </div>

      <div className="admin-component">
        <div className="users-container">
          <h2 className="admin-main-title">Список користувачів</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Email</th>
                <th>Пароль</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
                  <td>{user.role}</td>
                  <td>{formatDate(user.register_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {foundUser && (
        <div className="admin-component">
          <div className="users-container">
            <h3 className="admin-regular-title">Знайдений користувач:</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя пользователя</th>
                  <th>Email</th>
                  <th>Пароль</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                <tr key={foundUser.id}>
                  <td>{foundUser.id}</td>
                  <td>{foundUser.username}</td>
                  <td>{foundUser.email}</td>
                  <td className="password-cell">{foundUser.password}</td>
                  <td>{foundUser.role}</td>
                  <td>{formatDate(foundUser.register_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="users-btn-container">
        <div className="users-btn-section">
          <div className="users-btn">
            <h4 className="users-lable">ID користувача:</h4>
            <div className="user-input">
              <input
                className="change-input"
                placeholder="Введіть ID"
                value={userId}
                onChange={handleUserIdChange}
              />
            </div>
          </div>

          <div className="users-btn">
            <h4 className="users-lable">Пошук:</h4>
            <div className="user-input">
              <input
                className="change-input"
                placeholder="Введіть ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
              />
              <button
                className="regular-btn change-btn"
                onClick={handleSearchUser}
              >
                Знайти
              </button>
            </div>
          </div>

          <div className="users-btn">
            <h4 className="users-lable">Додати користувача:</h4>
            <div className="user-input">
              {isAddUser ? (
                <button
                  className="regular-btn add-btn"
                  onClick={() => setIsAddUser(false)}
                >
                  Закрити
                </button>
              ) : (
                <button
                  className="regular-btn add-btn"
                  onClick={() => setIsAddUser(true)}
                >
                  Додати
                </button>
              )}
            </div>
            {isAddUser ? (
              <div className="add-menu">
                <h4 className="users-lable">Введіть дані:</h4>
                <div className="add-menu-input">
                  <input
                    className="change-input"
                    placeholder="Введіть username"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                  />
                  <input
                    className="change-input"
                    placeholder="Введіть email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                  />
                  <input
                    className="change-input"
                    placeholder="Введіть password"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                  />
                </div>
                <button className="regular-btn" onClick={handleAddUser}>
                  Зберегти
                </button>
              </div>
            ) : (
              <div className="add-menu-hidden"></div>
            )}
          </div>

          <div className="users-btn">
            <h4 className="users-lable">Видалити користувача:</h4>
            <div className="user-input">
              <input
                className="change-input"
                placeholder="Введіть ID"
                value={deleteUserId}
                onChange={(e) => setDeleteUserId(e.target.value)}
              />
              <button
                className="regular-btn change-btn"
                onClick={handleDeleteUser}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>

        <div className="users-btn-section">
          <div className="users-btn">
            <h4 className="users-lable">Нове ім'я:</h4>
            <div className="user-input">
              <input
                className="change-input"
                type="text"
                value={newUsername}
                onChange={handleNewUsernameChange}
              />
              <button
                className="regular-btn change-btn"
                onClick={handleUpdateUsername}
              >
                Змінити
              </button>
            </div>
          </div>
          <div className="users-btn">
            <h4 className="users-lable">Нова пошта:</h4>
            <div className="user-input">
              <input
                className="change-input"
                type="email"
                value={newEmail}
                onChange={handleNewEmailChange}
              />
              <button
                className="regular-btn change-btn"
                onClick={handleUpdateEmail}
              >
                Змінити
              </button>
            </div>
          </div>

          <div className="users-btn">
            <h4 className="users-lable">Новий пароль:</h4>
            <div className="user-input">
              <input
                className="change-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                className="regular-btn change-btn"
                onClick={handleUpdatePassword}
              >
                Змінити
              </button>
            </div>
          </div>

          <div className="users-btn">
            <h4 className="users-lable">Нова роль:</h4>
            <div className="user-input">
              <select
                className="change-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option className="option" value="user">
                  Користувач
                </option>
                <option className="option" value="admin">
                  Адміністратор
                </option>
              </select>
              <button
                className="regular-btn change-btn"
                onClick={handleUpdateRole}
              >
                Змінити
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
