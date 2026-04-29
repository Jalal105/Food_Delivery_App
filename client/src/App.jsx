import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantMenu from './pages/RestaurantMenu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import RestaurantDashboard from './pages/restaurant/Dashboard';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function RestaurantRoute({ children }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'restaurant' && user.role !== 'admin') return <Navigate to="/" />;

  if (user.role === 'restaurant' && user.restaurantApprovalStatus !== 'approved') {
    const isRejected = user.restaurantApprovalStatus === 'rejected';

    const handleCheckStatus = async () => {
      setChecking(true);
      const updated = await refreshUser();
      setChecking(false);
      if (updated?.restaurantApprovalStatus === 'approved') {
        // will re-render and allow access
      } else if (updated?.restaurantApprovalStatus === 'rejected') {
        // will re-render showing rejected
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-surface">
        <div className="text-center max-w-md w-full">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isRejected ? 'bg-red-100' : 'bg-amber-100'}`}>
            <span className={`material-symbols-outlined text-4xl ${isRejected ? 'text-red-500' : 'text-amber-500'}`}>
              {isRejected ? 'cancel' : 'hourglass_top'}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">
            {isRejected ? 'Application Rejected' : 'Awaiting Admin Approval'}
          </h2>
          <p className="text-muted mb-2">
            {isRejected
              ? 'Your restaurant application was rejected by the admin.'
              : 'Your restaurant account is pending approval from the admin.'}
          </p>
          <p className="text-sm text-muted mb-8">
            {isRejected
              ? 'Please contact support for more information.'
              : 'The admin will review your request. Once approved, you\'ll get full access to your restaurant dashboard.'}
          </p>
          {!isRejected && (
            <button onClick={handleCheckStatus} disabled={checking}
              className="w-full py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark disabled:opacity-50 transition-all mb-3 flex items-center justify-center gap-2">
              {checking
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Checking...</>
                : <><span className="material-symbols-outlined text-lg">refresh</span>Check Approval Status</>}
            </button>
          )}
          <button onClick={() => navigate('/')} className="w-full py-3 bg-surface-2 text-dark rounded-xl font-semibold hover:bg-surface-3 transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  return children;
}


function AppContent() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurant/:id" element={<RestaurantMenu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/restaurant-dashboard" element={<RestaurantRoute><RestaurantDashboard /></RestaurantRoute>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
