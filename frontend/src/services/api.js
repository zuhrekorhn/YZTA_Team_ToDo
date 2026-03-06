import axios from 'axios';

// Backend URL'si (FastAPI varsayılan portu)
const API_URL = 'http://localhost:8000';

// Axios örneği oluşturuyoruz
const api = axios.create({
    baseURL: API_URL,
});

// Her istekten önce çalışacak interceptor (aracı)
// Bu sayede her isteğe otomatik olarak token ekliyoruz
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // OAuth2 standardı
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 401 (Yetkisiz) hatası gelirse tokenı sil
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/'; // Login sayfasına yönlendir (veya state güncelle)
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    // OAuth2PasswordRequestForm form-data bekler
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // form-data olduğunu belirtmek önemli
        },
    });
    return response.data;
};

export const register = async (username, email, password) => {
    const response = await api.post('/auth/register', {
        username,
        email,
        password
    });
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await api.get('/leaderboard/');
    return response.data;
};

export const getSocialFeed = async () => {
    const response = await api.get('/social/feed');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/user/');
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get('/stats/');
    return response.data;
};

export const searchUsers = async (query) => {
    const response = await api.get(`/user/search?q=${query}`);
    return response.data;
};

// Başka kullanıcı işlemleri
export const getOtherUserProfile = async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
};

export const getOtherUserTodos = async (userId) => {
    // Backendde bu endpoint oluşturulmalı: @router.get("/user/{target_user_id}")
    const response = await api.get(`/todos/user/${userId}`);
    return response.data;
};

export const getOtherUserStats = async (userId) => {
    const response = await api.get(`/stats/user/${userId}`);
    return response.data;
};

export const reactToTodo = async (todoId, emojiCode) => {
    const response = await api.post('/reactions/', {
        todo_id: todoId,
        emoji_code: emojiCode
    });
    return response.data;
};

export const updateUserMood = async (mood) => {
    const response = await api.put('/user/mood', { mood });
    return response.data;
};

// Todo İşlemleri
export const getMyTodos = async () => {
    const response = await api.get('/todos/');
    return response.data;
};

export const createTodo = async (todoData) => {
    const response = await api.post('/todos/create', todoData);
    return response.data;
};

export const updateTodo = async (todo_id, todoData) => {
    const response = await api.put(`/todos/${todo_id}?todo_id=${todo_id}`, todoData);
    return response.data;
};

export const completeTodo = async (todo_id) => {
    const response = await api.put(`/todos/${todo_id}/complete`);
    return response.data;
};

export const patchTodo = async (todo_id, updates) => {
    // updates: { is_daily: true, is_public: false } gibi
    const queryParams = new URLSearchParams(updates).toString(); 
    const response = await api.patch(`/todos/${todo_id}?${queryParams}`);
    return response.data;
};

export const getCommunityStats = async () => {
    const response = await api.get('/stats/community');
    return response.data;
};

export const deleteTodo = async (todo_id) => {
    const response = await api.delete(`/todos/${todo_id}`);
    return response.data;
};

export default api;