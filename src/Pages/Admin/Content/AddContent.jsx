import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from 'react-toastify';

import "./AddContent.css";

import { LuPlus, LuX } from "react-icons/lu";

const AddContent = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("user");
  const [selectedType, setSelectedType] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [frames, setFrames] = useState([]);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [title, setTitle] = useState("");
  const [englishTitle, setEnglishTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [country, setCountry] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [trailerLink, setTrailerLink] = useState("");

  const [episodesCount, setEpisodesCount] = useState("");
  const [season, setSeason] = useState("");

  const uploadButtonRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = decodeToken(token);
      setUserRole(decodedToken.role);
    }

    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          "https://blurx-cd4ad36829cd.herokuapp.com/content/genres"
        );
        

        setGenres(response.data);
      } catch (error) {
        console.error("Помилка під час завантаження жанрів:", error);
      }
    };

    fetchGenres();
  }, []);

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return {};
    }
  };

  const onSelectType = (type) => {
    setSelectedType(type);
  };

  const handleAddGenre = () => {
    if (selectedType && selectedGenre) {
      setSelectedGenres([...selectedGenres, parseInt(selectedGenre)]);
    }
    setSelectedGenre("");
  };

  const handleRemoveGenre = (genreId) => {
    const updatedGenres = selectedGenres.filter((id) => id !== genreId);
    setSelectedGenres(updatedGenres);
  };

  const handleCoverButtonClick = () => {
    if (uploadButtonRef.current) {
      uploadButtonRef.current.click();
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    console.log("Вибрана обкладинка:", file);
    uploadCoverImage(file);
  };

  const uploadCoverImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const response = await axios.post(
        "https://blurx-cd4ad36829cd.herokuapp.com/content/upload-cover",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "Обкладинка успішно завантажена:",
        response.data.coverImageUrl
      );
      setCoverImage(response.data.coverImageUrl);
    } catch (error) {
      console.error("Помилка під час завантаження обкладинки:", error);
    }
  };

  const handleRemoveCover = async () => {
    try {
      await axios.delete("https://blurx-cd4ad36829cd.herokuapp.com/content/remove-cover", {
        data: {
          imageUrl: coverImage,
        },
      });

      setCoverImage(null);
    } catch (error) {
      console.error("Помилка при видаленні обкладинки:", error);
    }
  };

  const handleUploadFrame = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = e.target.files;
      uploadFrames(files);
    };
    input.click();
  };

  const uploadFrames = async (files) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        "https://blurx-cd4ad36829cd.herokuapp.com/content/upload-frames",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Кадри успішно завантажені:", response.data.paths);
      setFrames((prevFrames) => [...prevFrames, ...response.data.paths]);
    } catch (error) {
      console.error("Помилка під час завантаження кадрів:", error);
    }
  };

  const handleRemoveFrame = async (index) => {
    try {
      const frameToRemove = frames[index];
      const response = await axios.post(
        "https://blurx-cd4ad36829cd.herokuapp.com/content/remove-frames",
        { frameUrls: [frameToRemove] }
      );

      if (response.status === 200) {
        console.log("Кадр успішно видалено:", frameToRemove);
        const updatedFrames = [...frames];
        updatedFrames.splice(index, 1);
        setFrames(updatedFrames);
      } else {
        console.error("Помилка при видаленні кадру:", response.data.message);
      }
    } catch (error) {
      console.error("Помилка при видаленні кадру:", error);
    }
  };

  const handleSaveMovie = async () => {
    try {
      const selectedGenreIds = selectedGenres.map((genre) => parseInt(genre));

      const movieData = {
        title: title,
        title_english: englishTitle,
        cover_image: coverImage,
        description: description,
        trailer_url: trailerLink,
        release_date: releaseDate,
        release_country: country,
        age_rating: ageRestriction,
        duration_minutes: duration,
        frames_url: frames,
        rating: 0,
        genres: selectedGenreIds,
      };

      console.log("data", movieData);

      const response = await axios.post("https://blurx-cd4ad36829cd.herokuapp.com/content/add-movie", movieData
      );
      toast.success('Фільм успішно доданий');
      console.log("Фільм успішно доданий:", response.data);
    } catch (error) {
      toast.error('Помилка при додаванні фільму');
      console.error("Помилка при додаванні фільму:", error.response.data.error);
    }
  };

  const handleSaveSeries = async () => {
    try {
      const selectedGenreIds = selectedGenres.map((genre) => parseInt(genre));

      const seriesData = {
        title: title,
        title_english: englishTitle,
        cover_image: coverImage,
        description: description,
        episodes_count: episodesCount,
        season: season,
        trailer_url: trailerLink,
        release_date: releaseDate,
        release_country: country,
        age_rating: ageRestriction,
        duration_minutes: duration,
        frames_url: frames,
        rating: 0,
        genres: selectedGenreIds,
      };

      console.log("data", seriesData);

      const response = await axios.post("https://blurx-cd4ad36829cd.herokuapp.com/content/add-series", seriesData);
      toast.success('Серіал успішно доданий');
      console.log("Серіал успішно доданий:", response.data);
    } catch (error) {
      toast.error('Помилка при додаванні серіалу');
      console.error("Помилка при додаванні серіалу:", error.response.data.error);
    }
  };

  const handleClearAll = () => {
    setTitle("");
    setEnglishTitle("");
    setCoverImage("");
    setDescription("");
    setTrailerLink("");
    setReleaseDate("");
    setCountry("");
    setAgeRestriction("");
    setDuration("");
    setCountry("");
    setSelectedGenres([]);
    setEpisodesCount('');
    setSeason('');
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <div className="add-content">
      {userRole === "admin" ? (
        <>
          <div className="add-content-header">
            <h1 className="main-title">Додати контент</h1>
            <div className="content-type-selector">
              <label className="content-type">
                Виберіть тип контенту:
                <select
                  className="change-input change-type"
                  value={selectedType}
                  onChange={(e) => onSelectType(e.target.value)}
                >
                  <option className="select-option" value="">
                    Виберіть тип
                  </option>
                  <option className="select-option" value="movie">
                    Фільм
                  </option>
                  <option className="select-option" value="series">
                    Серіал
                  </option>
                </select>
              </label>
            </div>
          </div>
          <div className="movie-form">
            <div className="content-block">
              <div className="content-media content-conteiner">
                <div className="content-cover">
                  <div className="cover-img">
                    {coverImage ? (
                      <>
                        <img
                          className="image"
                          src={coverImage}
                          alt="Обкладинка фільму"
                        />
                        <button
                          className="main-btn remove-btn"
                          onClick={handleRemoveCover}
                        >
                          Видалити обкладинку
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="upload-btn"
                          onClick={handleCoverButtonClick}
                        >
                          <LuPlus size={50} />
                          Завантажити обкладинку
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          ref={uploadButtonRef}
                          style={{ display: "none" }}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="add-content-trailer">
                  <h4 className="add-content-label">Посилання на трейлер:</h4>
                  <input
                    className="change-input"
                    type="text"
                    value={trailerLink}
                    onChange={(e) => setTrailerLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="content-body">
                <div className="add-content-title content-conteiner">
                  <div className="content-input">
                    <h4 className="content-label">Назва:</h4>
                    <input
                      className="change-input"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="content-input">
                    <h4 className="content-label">Назва англійською:</h4>
                    <input
                      className="change-input"
                      type="text"
                      value={englishTitle}
                      onChange={(e) => setEnglishTitle(e.target.value)}
                    />
                  </div>
                </div>
                <div className="add-content-info content-conteiner">
                  <div className="content-input">
                    <h4 className="content-label">Дата виходу:</h4>
                    <input
                      className="change-input"
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                    />
                  </div>
                  <div className="content-input">
                    <h4 className="content-label">Країна:</h4>
                    <input
                      className="change-input"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                  <div className="add-genres">
                    <h4 className="content-label">Жанр:</h4>
                    <div className="content-genres">
                      <select
                        className="change-input"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                      >
                        <option className="select-option" value="">
                          Виберіть жанр
                        </option>
                        {genres.map((genre) => (
                          <option
                            key={genre.id}
                            className="select-option"
                            value={parseInt(genre.id)}
                          >
                            {genre.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="main-btn add-genre-btn"
                        onClick={handleAddGenre}
                      >
                        Додати жанр
                      </button>
                    </div>
                    <div className="selected-genres">
                      {selectedGenres.map((genreId) => (
                        <div key={genreId} className="genre">
                          <button
                            className="regular-btn remove-genre-btn"
                            onClick={() => handleRemoveGenre(genreId)}
                          >
                            <span>
                              {
                                genres.find((genre) => genre.id === genreId)
                                  ?.name
                              }
                            </span>
                            <LuX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-input">
                    <h4 className="content-label">Вікові обмеження:</h4>
                    <select
                      className="change-input"
                      value={ageRestriction}
                      onChange={(e) => setAgeRestriction(e.target.value)}
                    >
                      <option className="select-option" value="0+">0+</option>
                      <option className="select-option" value="6+">6+</option>
                      <option className="select-option" value="12+">12+</option>
                      <option className="select-option" value="16+">16+</option>
                      <option className="select-option" value="18+">18+</option>
                    </select>
                  </div>
                  <div className="content-input">
                    <h4 className="content-label">Тривалість:</h4>
                    <input
                      className="change-input"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  {selectedType === 'series' ? (
                    <>
                      <div className="content-input">
                        <h4 className="content-label">Сезон:</h4>
                        <input
                          className="change-input"
                          type="text"
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                        />
                      </div>
                      <div className="content-input">
                        <h4 className="content-label">Кількість серій:</h4>
                        <input
                          className="change-input"
                          type="text"
                          value={episodesCount}
                          onChange={(e) => setEpisodesCount(e.target.value)}
                          />
                      </div>
                    </>
                  ) : (
                    <>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="content-description content-conteiner">
              <h4 className="content-label">Опис:</h4>
              <textarea
                className="change-input description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="content-media-img">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="media-img">
                  {frames[index] ? (
                    <>
                      <img
                        className="frame-image"
                        src={frames[index]}
                        alt={`Кадр ${index + 1}`}
                      />
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveFrame(index)}
                      >
                        Видалити кадр
                        <LuX size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="upload-btn upload-frame"
                      onClick={handleUploadFrame}
                    >
                      <LuPlus size={50} />
                      Завантажити кадр
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="add-content-btn">
              <button className="regular-btn" type="button" onClick={handleCancel}>Скасувати</button>
              <button className="regular-btn" type="button" onClick={handleClearAll}>Очистить все</button>
              {selectedType === 'series' ? (
                <button className="main-btn" type="button" onClick={handleSaveSeries}>Зберегти</button>
              ) : (
                <button className="main-btn" type="button" onClick={handleSaveMovie}>Зберегти</button>
              )}
              
            </div>
          </div>
        </>
      ) : (
        <div className="error">
          <p>Доступ заборонено.</p>
        </div>
      )}
    </div>
  );
};

export default AddContent;
