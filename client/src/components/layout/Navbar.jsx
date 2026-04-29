import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getFoodTypes } from '../../services/api';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [foodTypes, setFoodTypes] = useState([]);
  const [showFoodTypes, setShowFoodTypes] = useState(false);
  const isAdmin = pathname.startsWith('/admin');
  const isRestDash = pathname.startsWith('/restaurant-dashboard');

  useEffect(() => {
    getFoodTypes({ active: 'true' })
      .then(({ data }) => setFoodTypes(data))
      .catch(() => {});
  }, []);

  if (isAdmin || isRestDash) return null; // admin/restaurant dashboards have own nav

  return (
    <>
      <motion.header
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 w-full z-50 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg font-display">B</span>
            </div>
            <span className="text-xl font-bold font-display tracking-tight">
              Bite<span className="text-brand">Dash</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/restaurants', label: 'Restaurants' },
            ].map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.to ? 'bg-brand/10 text-brand font-semibold' : 'text-muted hover:text-dark hover:bg-surface-2'
                }`}
              >{link.label}</Link>
            ))}

            {/* Food Types Dropdown */}
            {foodTypes.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowFoodTypes(!showFoodTypes)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                    showFoodTypes ? 'bg-brand/10 text-brand font-semibold' : 'text-muted hover:text-dark hover:bg-surface-2'
                  }`}>
                  Food Types
                  <span className="material-symbols-outlined text-sm">{showFoodTypes ? 'expand_less' : 'expand_more'}</span>
                </button>
                <AnimatePresence>
                  {showFoodTypes && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute top-full mt-2 left-0 w-64 glass rounded-2xl shadow-xl py-2 border border-white/20 max-h-80 overflow-y-auto"
                    >
                      <div className="px-4 py-2 border-b border-surface-3">
                        <p className="text-xs font-bold text-muted uppercase tracking-widest">Browse by Type</p>
                      </div>
                      {foodTypes.map((ft) => (
                        <Link key={ft._id} to={`/restaurants?foodType=${ft._id}`}
                          onClick={() => setShowFoodTypes(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                          <span className="text-lg">{ft.icon || '🍽️'}</span>
                          <div>
                            <span className="text-sm font-medium">{ft.name}</span>
                            {ft.description && <p className="text-xs text-muted truncate">{ft.description}</p>}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="px-4 py-2 rounded-xl text-sm font-medium text-accent hover:bg-accent/5 transition-all">
                Admin
              </Link>
            )}
            {user?.role === 'restaurant' && user?.restaurantApprovalStatus === 'approved' && (
              <Link to="/restaurant-dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-accent hover:bg-accent/5 transition-all">
                My Restaurant
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-surface-2 transition-all">
              <span className="material-symbols-outlined text-dark-2">shopping_bag</span>
              {totalItems > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >{totalItems}</motion.span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-2 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user.name?.split(' ')[0]}</span>
                  <span className="material-symbols-outlined text-muted text-sm">expand_more</span>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl shadow-xl py-2 border border-white/20"
                    >
                      <div className="px-4 py-2 border-b border-surface-3 mb-1">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-brand/10 text-brand rounded-full font-bold uppercase mt-1 inline-block">{user.role}</span>
                      </div>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                        <span className="material-symbols-outlined text-muted">person</span>
                        <span className="text-sm font-medium">My Profile</span>
                      </Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                        <span className="material-symbols-outlined text-muted">receipt_long</span>
                        <span className="text-sm font-medium">My Orders</span>
                      </Link>
                      {user.role === 'restaurant' && user.restaurantApprovalStatus === 'approved' && (
                        <Link to="/restaurant-dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                          <span className="material-symbols-outlined text-muted">storefront</span>
                          <span className="text-sm font-medium">Restaurant Dashboard</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                          <span className="material-symbols-outlined text-muted">admin_panel_settings</span>
                          <span className="text-sm font-medium">Admin Dashboard</span>
                        </Link>
                      )}
                      <div className="h-px bg-surface-3 mx-3 my-1" />
                      <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-error"
                      >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all">
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-surface-2">
              <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </motion.header>
      {/* Click-away for dropdowns */}
      {(menuOpen || showFoodTypes) && <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setShowFoodTypes(false); }} />}
    </>
  );
}
