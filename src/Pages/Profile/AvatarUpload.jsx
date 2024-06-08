import React, { useState, useRef, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../../Components/Modal/Modal.jsx";
import './AvatarUpload.css';


const AvatarUpload = () => {
    const editorRef = useRef(null);
    const [image, setImage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [userImage, setUserImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUserImage(response.data.profile_image);
            } catch (error) {
                console.error('Ошибка при получении изображения пользователя:', error);
            }
            };
        
            fetchProfileData();
        }, [userImage]);

    const handleSave = async () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            const blob = await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, "image/png");
            });

            const formData = new FormData();
            formData.append("avatar", blob, "avatar.png");

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_SERVER_URL}/auth/change-image`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                console.log(response.data);
                toast.success("Аватар успішно завантажено");
                setShowForm(false);

                setTimeout(() => {window.location.reload(true);}, 500);
                
            } catch (error) {
                console.error("Error uploading avatar:", error);
                toast.error("Ошибка загрузки аватара");
            }
        }
    };

    const handleDelete = () => {
        setImage(null);
    };

    const onClose = () => {
        setShowForm(false);
    };

    return (
        <div className="user-img">
            <button className="upload-btn cl-1" onClick={() => setShowForm(true)}>
                <div className="user-image-text">Завантажте аватар</div>
                {userImage && ( 
                    <img src={userImage} className="user-avatar" alt="User Avatar" />
                )}
            </button>

            <Modal isOpen={showForm} onClose={onClose}>
                <AvatarEditor
                    ref={editorRef}
                    image={image}
                    width={250}
                    height={250}
                    border={50}
                    borderRadius={0}
                    scale={1.2}
                    rotate={0}
                />
                <input
                    className="change-input"
                    id="avatar-input"
                    type="file"
                    onChange={(e) => {
                        setImage(e.target.files[0]);
                        setSelectedFile(e.target.files[0]);
                    }}
                    style={{ display: "none" }}
                />
                <label htmlFor="avatar-input" className="change-label">
                    {selectedFile ? "Змінити файл" : "Вибрати файл"}
                </label>

                <button className='main-btn' onClick={handleSave}>Зберегти</button>
                <button className="regular-btn" onClick={handleDelete}>Видалити зображення</button>
            </Modal>
        </div>
    );
};

export default AvatarUpload;
