import { createContext, useContext, useReducer } from 'react';
import { loginUser, registerUser, googleLogin, getMe } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem('bitedash-user') || 'null'),
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: true, error: null };
    case 'SET_USER': 
      localStorage.setItem('bitedash-user', JSON.stringify(action.payload));
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('bitedash-user');
      return { ...state, user: null, error: null };
    case 'UPDATE_USER':
      const updated = { ...state.user, ...action.payload };
      localStorage.setItem('bitedash-user', JSON.stringify(updated));
      return { ...state, user: updated };
    default: return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await loginUser({ email, password });
      dispatch({ type: 'SET_USER', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, accountType = 'user') => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await registerUser({ name, email, password, accountType });
      dispatch({ type: 'SET_USER', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async (googleData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await googleLogin(googleData);
      dispatch({ type: 'SET_USER', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });
  const clearError = () => dispatch({ type: 'SET_ERROR', payload: null });
  const updateUser = (data) => dispatch({ type: 'UPDATE_USER', payload: data });

  // Refresh user from server to get latest approval status
  const refreshUser = async () => {
    try {
      const { data } = await getMe();
      dispatch({ type: 'SET_USER', payload: { ...data, token: state.user?.token } });
      return data;
    } catch { return null; }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, clearError, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
