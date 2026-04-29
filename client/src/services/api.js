import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const data = localStorage.getItem('bitedash-user');
  if (data) {
    const { token } = JSON.parse(data);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────
export const registerUser = (body) => API.post('/auth/register', body);
export const loginUser    = (body) => API.post('/auth/login', body);
export const googleLogin  = (body) => API.post('/auth/google', body);
export const getMe        = ()     => API.get('/auth/me');

// ── Users ─────────────────────────────────────────
export const getProfile     = ()         => API.get('/users/profile');
export const updateProfile  = (body)     => API.put('/users/profile', body);
export const addAddress     = (body)     => API.post('/users/addresses', body);
export const updateAddress  = (id, body) => API.put(`/users/addresses/${id}`, body);
export const deleteAddress  = (id)       => API.delete(`/users/addresses/${id}`);

// ── Restaurants (public) ──────────────────────────
export const getRestaurants    = (params)     => API.get('/restaurants', { params });
export const getRestaurant     = (id)         => API.get(`/restaurants/${id}`);
export const createRestaurant  = (body)       => API.post('/restaurants', body);
export const updateRestaurant  = (id, body)   => API.put(`/restaurants/${id}`, body);
export const deleteRestaurant  = (id)         => API.delete(`/restaurants/${id}`);

// ── Restaurant Owner ──────────────────────────────
export const getMyRestaurants    = ()          => API.get('/restaurants/owner/my');
export const getRestaurantOrders = (id, params)=> API.get(`/restaurants/owner/${id}/orders`, { params });
export const getRestaurantStats  = (id)        => API.get(`/restaurants/owner/${id}/stats`);

// ── Food Items ────────────────────────────────────
export const getFoodItems  = (params)     => API.get('/food', { params });
export const getFoodItem   = (id)         => API.get(`/food/${id}`);
export const createFood    = (body)       => API.post('/food', body);
export const updateFood    = (id, body)   => API.put(`/food/${id}`, body);
export const deleteFood    = (id)         => API.delete(`/food/${id}`);
export const toggleFood    = (id)         => API.patch(`/food/${id}/toggle`);

// ── Food Types ────────────────────────────────────
export const getFoodTypes    = (params)     => API.get('/food-types', { params });
export const createFoodType  = (body)       => API.post('/food-types', body);
export const updateFoodType  = (id, body)   => API.put(`/food-types/${id}`, body);
export const deleteFoodType  = (id)         => API.delete(`/food-types/${id}`);

// ── Orders ────────────────────────────────────────
export const createOrder     = (body)       => API.post('/orders', body);
export const getMyOrders     = (params)     => API.get('/orders/my', { params });
export const getOrder        = (id)         => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, body) => API.put(`/orders/${id}/status`, body);

// ── Admin — Orders & Stats ────────────────────────
export const getAdminOrders  = (params) => API.get('/orders/admin/all', { params });
export const getAdminStats   = ()       => API.get('/orders/admin/stats');
export const getAdminAnalytics = ()     => API.get('/admin/analytics');

// ── Admin — User Management ───────────────────────
export const getAllUsers    = (params)     => API.get('/admin/users', { params });
export const updateUserRole = (id, body)  => API.put(`/admin/users/${id}/role`, body);
export const deleteUser     = (id)        => API.delete(`/admin/users/${id}`);

// ── Admin — Restaurant Requests (User-level approval) ─
export const getRestaurantRequests   = ()    => API.get('/admin/restaurant-requests');
export const approveRestaurantUser   = (id)  => API.put(`/admin/restaurant-requests/${id}/approve`);
export const rejectRestaurantUser    = (id)  => API.put(`/admin/restaurant-requests/${id}/reject`);

// ── Admin — Restaurant Document Approval ─────────
export const approveRestaurant = (id) => API.put(`/admin/restaurants/${id}/approve`);
export const rejectRestaurant  = (id) => API.put(`/admin/restaurants/${id}/reject`);

// ── Admin — Admin Access Requests ────────────────
export const getAdminRequests = ()    => API.get('/admin/admin-requests');
export const approveAdmin     = (id)  => API.put(`/admin/admin-requests/${id}/approve`);
export const rejectAdmin      = (id)  => API.put(`/admin/admin-requests/${id}/reject`);

export default API;
