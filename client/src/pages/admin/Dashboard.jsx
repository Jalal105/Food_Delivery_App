import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats, getAdminOrders, updateOrderStatus,
  getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant,
  getFoodItems, createFood, updateFood, deleteFood, toggleFood,
  getAdminAnalytics, getRestaurantRequests, approveRestaurantUser, rejectRestaurantUser,
  getAdminRequests, approveAdmin, rejectAdmin,
  getAllUsers, deleteUser,
  getFoodTypes, createFoodType, updateFoodType, deleteFoodType,
} from '../../services/api';
import toast from 'react-hot-toast';

const statusColor = { placed: 'bg-blue-100 text-blue-700', confirmed: 'bg-indigo-100 text-indigo-700', preparing: 'bg-yellow-100 text-yellow-700', out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
const statusLabel = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };
const foodCategories = ['Starters', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Combos', 'Specials'];

/* ─── Empty form defaults ─── */
const emptyRestaurant = { name: '', description: '', cuisine: '', image: '', deliveryTime: '25-35 min', deliveryFee: 0, minOrder: 0, isOpen: true, isFeatured: false, tags: '' };
const emptyFoodItem = { name: '', description: '', price: '', image: '', category: 'Main Course', restaurantId: '', isVeg: false, isAvailable: true, isBestseller: false, spiceLevel: '', preparationTime: '15-20 min', tags: '' };

/* ═══════════════════════════════════════════════════════════════════
   MODAL COMPONENT — reusable sliding panel
   ═══════════════════════════════════════════════════════════════════ */
function SlidePanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-surface-3">
              <h2 className="text-xl font-bold font-display">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Reusable field component ─── */
function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-dark-3 block mb-1.5 ml-0.5">{label}</label>
      {children}
    </div>
  );
}
const inputCls = 'w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm transition-all';

/* ═══════════════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Requests & Food Types
  const [adminRequests, setAdminRequests] = useState([]);
  const [restRequests, setRestRequests] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [ftPanel, setFtPanel] = useState(false);
  const [editingFt, setEditingFt] = useState(null);
  const [ftForm, setFtForm] = useState({ name:'', icon:'🍽️', description:'', isActive:true });
  const [ftSaving, setFtSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Panel states
  const [restPanel, setRestPanel] = useState(false);
  const [editingRest, setEditingRest] = useState(null);
  const [restForm, setRestForm] = useState(emptyRestaurant);
  const [restSaving, setRestSaving] = useState(false);

  const [foodPanel, setFoodPanel] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState(emptyFoodItem);
  const [foodSaving, setFoodSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, o, r, m, ar, rr, ft, an, u] = await Promise.all([
        getAdminStats(),
        getAdminOrders({ limit: 50 }),
        getRestaurants({ limit: 50 }),
        getFoodItems({ limit: 200 }),
        getAdminRequests().catch(() => ({ data: [] })),
        getRestaurantRequests().catch(() => ({ data: [] })),
        getFoodTypes().catch(() => ({ data: [] })),
        getAdminAnalytics().catch(() => ({ data: {} })),
        getAllUsers({ limit: 100 }).catch(() => ({ data: { users: [] } })),
      ]);
      setStats(s.data);
      setOrders(o.data.orders);
      setRestaurants(r.data.restaurants);
      setMenuItems(m.data.items);
      setAdminRequests(ar.data);
      setRestRequests(rr.data);
      setFoodTypes(ft.data);
      setAnalytics(an.data);
      setAllUsers(u.data.users || []);
      setPendingCount((ar.data?.filter?.(r => r.adminApprovalStatus==='pending')?.length||0) + (rr.data?.filter?.(r => r.approvalStatus==='pending')?.length||0));
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  // Approve/reject admin requests
  const handleApproveAdmin = async (id) => {
    try { await approveAdmin(id); toast.success('Admin approved!'); setAdminRequests(adminRequests.filter(r => r._id !== id)); setPendingCount(p => Math.max(0, p-1)); } catch { toast.error('Failed'); }
  };
  const handleRejectAdmin = async (id) => {
    try { await rejectAdmin(id); toast.success('Admin rejected'); setAdminRequests(adminRequests.filter(r => r._id !== id)); setPendingCount(p => Math.max(0, p-1)); } catch { toast.error('Failed'); }
  };
  // Approve/reject restaurant USER requests (from registration)
  const handleApproveRest = async (id) => {
    try { await approveRestaurantUser(id); toast.success('Restaurant access approved! ✅'); setRestRequests(restRequests.filter(r => r._id !== id)); setPendingCount(p => Math.max(0, p-1)); } catch { toast.error('Failed'); }
  };
  const handleRejectRest = async (id) => {
    try { await rejectRestaurantUser(id); toast.success('Restaurant request rejected'); setRestRequests(restRequests.filter(r => r._id !== id)); setPendingCount(p => Math.max(0, p-1)); } catch { toast.error('Failed'); }
  };
  // Food Types CRUD
  const handleFtSubmit = async (e) => {
    e.preventDefault(); setFtSaving(true);
    try {
      if (editingFt) { const {data} = await updateFoodType(editingFt._id, ftForm); setFoodTypes(foodTypes.map(f=>f._id===editingFt._id?data:f)); toast.success('Updated!'); }
      else { const {data} = await createFoodType(ftForm); setFoodTypes([...foodTypes, data]); toast.success('Created!'); }
      setFtPanel(false);
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setFtSaving(false); }
  };
  const handleDeleteFt = async (id) => {
    if (!confirm('Delete this food type?')) return;
    try { await deleteFoodType(id); setFoodTypes(foodTypes.filter(f=>f._id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };
  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await deleteUser(id); setAllUsers(allUsers.filter(u=>u._id!==id)); toast.success('User deleted'); } catch { toast.error('Failed'); }
  };

  /* ─── ORDER HANDLERS ─── */
  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      setOrders(orders.map((o) => o._id === id ? { ...o, status } : o));
      toast.success(`Order → ${statusLabel[status]}`);
    } catch { toast.error('Failed to update'); }
  };

  /* ─── RESTAURANT HANDLERS ─── */
  const openAddRestaurant = () => {
    setEditingRest(null);
    setRestForm(emptyRestaurant);
    setRestPanel(true);
  };
  const openEditRestaurant = (r) => {
    setEditingRest(r);
    setRestForm({
      name: r.name, description: r.description || '', cuisine: (r.cuisine || []).join(', '),
      image: r.image, deliveryTime: r.deliveryTime || '', deliveryFee: r.deliveryFee || 0,
      minOrder: r.minOrder || 0, isOpen: r.isOpen, isFeatured: r.isFeatured, tags: (r.tags || []).join(', '),
    });
    setRestPanel(true);
  };
  const handleRestSubmit = async (e) => {
    e.preventDefault();
    setRestSaving(true);
    const body = {
      ...restForm,
      cuisine: restForm.cuisine.split(',').map((s) => s.trim()).filter(Boolean),
      tags: restForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
      deliveryFee: Number(restForm.deliveryFee),
      minOrder: Number(restForm.minOrder),
    };
    try {
      if (editingRest) {
        const { data } = await updateRestaurant(editingRest._id, body);
        setRestaurants(restaurants.map((r) => r._id === editingRest._id ? data : r));
        toast.success('Restaurant updated!');
      } else {
        const { data } = await createRestaurant(body);
        setRestaurants([data, ...restaurants]);
        toast.success('Restaurant created!');
      }
      setRestPanel(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setRestSaving(false); }
  };
  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant? All its menu items will become orphaned.')) return;
    try {
      await deleteRestaurant(id);
      setRestaurants(restaurants.filter((r) => r._id !== id));
      toast.success('Restaurant deleted');
    } catch { toast.error('Failed to delete'); }
  };

  /* ─── FOOD ITEM HANDLERS ─── */
  const openAddFood = () => {
    setEditingFood(null);
    setFoodForm({ ...emptyFoodItem, restaurantId: restaurants[0]?._id || '' });
    setFoodPanel(true);
  };
  const openEditFood = (item) => {
    setEditingFood(item);
    setFoodForm({
      name: item.name, description: item.description || '', price: item.price,
      image: item.image, category: item.category, restaurantId: item.restaurantId?._id || item.restaurantId,
      isVeg: item.isVeg, isAvailable: item.isAvailable, isBestseller: item.isBestseller,
      spiceLevel: item.spiceLevel || '', preparationTime: item.preparationTime || '', tags: (item.tags || []).join(', '),
    });
    setFoodPanel(true);
  };
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    setFoodSaving(true);
    const body = {
      ...foodForm,
      price: Number(foodForm.price),
      tags: foodForm.tags.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingFood) {
        const { data } = await updateFood(editingFood._id, body);
        setMenuItems(menuItems.map((m) => m._id === editingFood._id ? data : m));
        toast.success('Menu item updated!');
      } else {
        const { data } = await createFood(body);
        setMenuItems([data, ...menuItems]);
        toast.success('Menu item created!');
      }
      setFoodPanel(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setFoodSaving(false); }
  };
  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await deleteFood(id);
      setMenuItems(menuItems.filter((m) => m._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };
  const handleToggle = async (id) => {
    try {
      const { data } = await toggleFood(id);
      setMenuItems(menuItems.map((m) => m._id === id ? data : m));
      toast.success(`Item ${data.isAvailable ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle'); }
  };

  /* ─── SIDEBAR TABS ─── */
  const tabs = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'requests', icon: 'pending_actions', label: 'Requests', badge: pendingCount },
    { id: 'orders', icon: 'receipt_long', label: 'Orders' },
    { id: 'restaurants', icon: 'storefront', label: 'Restaurants' },
    { id: 'menu', icon: 'restaurant_menu', label: 'Menu Items' },
    { id: 'foodtypes', icon: 'category', label: 'Food Types' },
    { id: 'users', icon: 'group', label: 'Users' },
  ];

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-64 bg-dark fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center"><span className="text-white font-bold font-display">B</span></div>
            <span className="text-lg font-bold text-white font-display">BiteDash</span>
          </Link>
          <p className="text-white/40 text-xs mt-2">Admin Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-brand text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}>
              <span className="material-symbols-outlined text-xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{user?.name}</p><p className="text-white/40 text-xs truncate">{user?.email}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm">
            <span className="material-symbols-outlined">logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Mobile Tab Bar */}
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${tab === t.id ? 'bg-brand text-white' : 'bg-white text-muted'}`}>
              <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* ══════════ OVERVIEW TAB ══════════ */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold font-display mb-1">Good morning, Chef</h1>
            <p className="text-muted mb-8">Here's what's happening with your business today.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: 'attach_money', label: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || 0}`, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
                { icon: 'shopping_bag', label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
                { icon: 'today', label: "Today's Revenue", value: `$${stats?.todayRevenue?.toFixed(2) || 0}`, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
                { icon: 'storefront', label: 'Restaurants', value: restaurants.length, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
              ].map((s) => (
                <div key={s.label} className={`${s.color} p-5 rounded-2xl`}>
                  <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}><span className="material-symbols-outlined">{s.icon}</span></div>
                  <p className="text-sm font-medium opacity-70">{s.label}</p>
                  <p className="text-2xl font-bold font-display mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            {stats?.statusBreakdown && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold font-display mb-4">Order Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.statusBreakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[key]}`}>{statusLabel[key]}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ ORDERS TAB ══════════ */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold font-display mb-6">Manage Orders</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-surface-2">
                    {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-surface-2">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-surface-2/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-4"><p className="text-sm font-medium">{order.userId?.name || '—'}</p><p className="text-xs text-muted">{order.userId?.email}</p></td>
                        <td className="px-5 py-4 text-sm text-muted max-w-[200px] truncate">{order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                        <td className="px-5 py-4 text-sm font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-5 py-4"><span className="text-xs px-2.5 py-1 bg-surface-2 rounded-full font-medium uppercase">{order.paymentMethod}</span></td>
                        <td className="px-5 py-4">
                          <select value={order.status} onChange={(e) => handleStatus(order._id, e.target.value)}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold border-none cursor-pointer ${statusColor[order.status]}`}>
                            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orders.length === 0 && <p className="text-center py-12 text-muted">No orders yet.</p>}
            </div>
          </motion.div>
        )}

        {/* ══════════ RESTAURANTS TAB ══════════ */}
        {tab === 'restaurants' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display">Manage Restaurants</h2>
                <p className="text-muted text-sm mt-1">{restaurants.length} restaurants total</p>
              </div>
              <button onClick={openAddRestaurant}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20">
                <span className="material-symbols-outlined text-lg">add</span>Add Restaurant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.map((r) => (
                <div key={r._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-44">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                    {!r.isOpen && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-sm bg-error/90 px-3 py-1 rounded-full">Closed</span></div>}
                    {r.isFeatured && <span className="absolute top-3 left-3 px-3 py-1 bg-brand text-white text-xs font-bold rounded-full">Featured</span>}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditRestaurant(r)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-white transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm text-dark">edit</span>
                      </button>
                      <button onClick={() => handleDeleteRestaurant(r._id)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-red-50 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm text-error">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold font-display mb-1">{r.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {r.cuisine?.slice(0, 3).map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 bg-surface-2 text-muted rounded-full">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-warning text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <b className="text-dark">{r.rating}</b> ({r.numRatings})
                      </span>
                      <span>•</span>
                      <span>{r.deliveryTime}</span>
                      <span>•</span>
                      <span>{r.deliveryFee === 0 ? <b className="text-success">Free delivery</b> : `$${r.deliveryFee}`}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-surface-2 flex gap-2">
                      <button onClick={() => openEditRestaurant(r)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-surface-2 rounded-xl text-xs font-semibold text-dark-3 hover:bg-surface-3 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>Edit Details
                      </button>
                      <button onClick={() => handleDeleteRestaurant(r._id)}
                        className="p-2 rounded-xl text-error/40 hover:text-error hover:bg-red-50 transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {restaurants.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-6xl text-surface-3 mb-3">storefront</span>
                <h3 className="text-xl font-bold mb-2">No restaurants yet</h3>
                <p className="text-muted mb-4">Get started by adding your first restaurant.</p>
                <button onClick={openAddRestaurant} className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm">Add Restaurant</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ MENU ITEMS TAB ══════════ */}
        {tab === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display">Menu Items</h2>
                <p className="text-muted text-sm mt-1">{menuItems.length} items across {restaurants.length} restaurants</p>
              </div>
              <button onClick={openAddFood}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20">
                <span className="material-symbols-outlined text-lg">add</span>Add Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-40">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {!item.isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-sm">Unavailable</span></div>}
                    {item.isBestseller && <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-brand text-white text-[10px] font-bold rounded-full uppercase tracking-wide">Bestseller</span>}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditFood(item)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-white shadow-sm">
                        <span className="material-symbols-outlined text-sm text-dark">edit</span>
                      </button>
                      <button onClick={() => handleDeleteFood(item._id)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-red-50 shadow-sm">
                        <span className="material-symbols-outlined text-sm text-error">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-veg' : 'border-nonveg'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-veg' : 'bg-nonveg'}`} />
                      </span>
                      <h4 className="font-bold text-sm truncate flex-1">{item.name}</h4>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-brand font-bold">${item.price.toFixed(2)}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-surface-2 text-muted rounded-full">{item.category}</span>
                    </div>
                    <p className="text-xs text-muted mb-3">{typeof item.restaurantId === 'object' ? item.restaurantId?.name : restaurants.find(r => r._id === item.restaurantId)?.name || '—'}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditFood(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-2 rounded-xl text-xs font-semibold hover:bg-surface-3 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit</span>Edit
                      </button>
                      <button onClick={() => handleToggle(item._id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${item.isAvailable ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                        {item.isAvailable ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => handleDeleteFood(item._id)} className="p-2 rounded-xl text-error/40 hover:text-error hover:bg-red-50 transition-all">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {menuItems.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-6xl text-surface-3 mb-3">restaurant_menu</span>
                <h3 className="text-xl font-bold mb-2">No menu items yet</h3>
                <p className="text-muted mb-4">Add your first dish to get started.</p>
                <button onClick={openAddFood} className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm">Add Item</button>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════ ADMIN REQUESTS TAB ══════════ */}
        {tab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display">Admin Access Requests</h2>
                <p className="text-muted text-sm mt-1">
                  {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'No pending requests'}
                </p>
              </div>
              <button onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 rounded-xl font-semibold text-sm hover:bg-surface-3 transition-colors">
                <span className="material-symbols-outlined text-lg">refresh</span>Refresh
              </button>
            </div>

            {adminRequests.length > 0 ? (
              <div className="space-y-4">
                {adminRequests.filter(r => r.adminApprovalStatus === 'pending').map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-surface-3 hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                            {request.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{request.name}</h3>
                            <p className="text-muted text-sm">{request.email}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full uppercase tracking-wide animate-pulse">
                          Pending
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          Requested {request.adminApprovalRequestedAt ? new Date(request.adminApprovalRequestedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {request.adminApprovalRequestedAt ? new Date(request.adminApprovalRequestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleApproveAdmin(request._id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-green-600 active:scale-[0.98] transition-all shadow-md shadow-green-200"
                        >
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Approve as Admin
                        </button>
                        <button
                          onClick={() => handleRejectAdmin(request._id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-2 text-error rounded-xl font-bold text-sm hover:bg-red-50 active:scale-[0.98] transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">cancel</span>
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Show rejected requests */}
                {adminRequests.filter(r => r.adminApprovalStatus === 'rejected').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold font-display text-muted mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl">block</span>
                      Previously Rejected
                    </h3>
                    {adminRequests.filter(r => r.adminApprovalStatus === 'rejected').map((request) => (
                      <div key={request._id} className="bg-surface-2/50 rounded-2xl p-5 mb-3 border border-surface-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center text-muted font-bold">
                              {request.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{request.name}</p>
                              <p className="text-xs text-muted">{request.email}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-red-50 text-error text-[10px] font-bold rounded-full uppercase">Rejected</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-5xl text-indigo-300" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No Admin Requests</h3>
                <p className="text-muted max-w-sm mx-auto">When users request admin access, their requests will appear here for your approval.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ REQUESTS TAB ═══ */}
        {tab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold font-display mb-6">Pending Requests</h2>
            {/* Admin Requests */}
            <div className="mb-8">
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">admin_panel_settings</span>
                Admin Access Requests ({adminRequests.filter(r=>r.adminApprovalStatus==='pending').length})
              </h3>
              {adminRequests.filter(r=>r.adminApprovalStatus==='pending').length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-muted shadow-sm">No pending admin requests</div>
              ) : (
                <div className="space-y-3">
                  {adminRequests.filter(r=>r.adminApprovalStatus==='pending').map(req => (
                    <div key={req._id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold">{req.name}</p>
                        <p className="text-sm text-muted">{req.email}</p>
                        <p className="text-xs text-muted mt-1">Requested: {new Date(req.adminApprovalRequestedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveAdmin(req._id)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all">Approve</button>
                        <button onClick={() => handleRejectAdmin(req._id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Restaurant Requests */}
            <div>
              <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">storefront</span>
                Restaurant Access Requests ({restRequests.filter(r=>r.restaurantApprovalStatus==='pending').length})
              </h3>
              {restRequests.filter(r=>r.restaurantApprovalStatus==='pending').length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-muted shadow-sm">No pending restaurant requests</div>
              ) : (
                <div className="space-y-3">
                  {restRequests.filter(r=>r.restaurantApprovalStatus==='pending').map(req => (
                    <div key={req._id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold">{req.name}</p>
                        <p className="text-sm text-muted">{req.email}</p>
                        <p className="text-xs text-muted mt-1">Requested: {new Date(req.restaurantApprovalRequestedAt || req.createdAt).toLocaleDateString()}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold mt-1 inline-block">Restaurant Partner</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveRest(req._id)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all">Approve</button>
                        <button onClick={() => handleRejectRest(req._id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* ═══ FOOD TYPES TAB ═══ */}
        {tab === 'foodtypes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold font-display">Food Types</h2><p className="text-muted text-sm mt-1">{foodTypes.length} types</p></div>
              <button onClick={() => { setEditingFt(null); setFtForm({name:'',icon:'🍽️',description:'',isActive:true}); setFtPanel(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20">
                <span className="material-symbols-outlined text-lg">add</span>Add Type
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foodTypes.map(ft => (
                <div key={ft._id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ft.icon}</span>
                    <div className="flex-1"><h4 className="font-bold">{ft.name}</h4>{ft.description && <p className="text-xs text-muted">{ft.description}</p>}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ft.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{ft.isActive?'Active':'Inactive'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingFt(ft); setFtForm({name:ft.name,icon:ft.icon||'🍽️',description:ft.description||'',isActive:ft.isActive}); setFtPanel(true); }} className="flex-1 py-2 bg-surface-2 rounded-xl text-xs font-semibold hover:bg-surface-3">Edit</button>
                    <button onClick={() => handleDeleteFt(ft._id)} className="px-3 py-2 rounded-xl text-error/50 hover:text-error hover:bg-red-50"><span className="material-symbols-outlined text-sm">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
            {foodTypes.length === 0 && <div className="text-center py-20 bg-white rounded-2xl shadow-sm"><span className="material-symbols-outlined text-6xl text-surface-3 mb-3">category</span><h3 className="text-xl font-bold mb-2">No food types yet</h3><p className="text-muted">Create food types for restaurants to categorize their items.</p></div>}
          </motion.div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold font-display mb-6">Users ({allUsers.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-surface-2">
                  {['Name','Email','Role','Joined','Actions'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-surface-2">
                  {allUsers.map(u => (
                    <tr key={u._id} className="hover:bg-surface-2/30">
                      <td className="px-5 py-4 text-sm font-medium">{u.name}</td>
                      <td className="px-5 py-4 text-sm text-muted">{u.email}</td>
                      <td className="px-5 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':u.role==='restaurant'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                      <td className="px-5 py-4 text-sm text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4"><button onClick={() => handleDeleteUser(u._id)} className="text-error/50 hover:text-error"><span className="material-symbols-outlined text-lg">delete</span></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allUsers.length === 0 && <p className="text-center py-12 text-muted">No users found</p>}
            </div>
          </motion.div>
        )}
      </main>


      {/* ═══════════════════════════════════════
          RESTAURANT FORM PANEL
         ═══════════════════════════════════════ */}
      <SlidePanel open={restPanel} onClose={() => setRestPanel(false)} title={editingRest ? 'Edit Restaurant' : 'Add Restaurant'}>
        <form onSubmit={handleRestSubmit} className="space-y-0">
          <Field label="Restaurant Name *">
            <input value={restForm.name} onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} placeholder="e.g. The Spice Garden" className={inputCls} required />
          </Field>
          <Field label="Description">
            <textarea value={restForm.description} onChange={(e) => setRestForm({ ...restForm, description: e.target.value })} placeholder="A brief description of the restaurant…" rows={3} className={inputCls + ' resize-none'} />
          </Field>
          <Field label="Image URL *">
            <input value={restForm.image} onChange={(e) => setRestForm({ ...restForm, image: e.target.value })} placeholder="https://images.unsplash.com/…" className={inputCls} required />
            {restForm.image && <img src={restForm.image} alt="Preview" className="mt-2 h-28 w-full object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />}
          </Field>
          <Field label="Cuisine Tags (comma-separated) *">
            <input value={restForm.cuisine} onChange={(e) => setRestForm({ ...restForm, cuisine: e.target.value })} placeholder="Indian, Biryani, Tandoori" className={inputCls} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery Time">
              <input value={restForm.deliveryTime} onChange={(e) => setRestForm({ ...restForm, deliveryTime: e.target.value })} placeholder="25-35 min" className={inputCls} />
            </Field>
            <Field label="Delivery Fee ($)">
              <input type="number" step="0.01" min="0" value={restForm.deliveryFee} onChange={(e) => setRestForm({ ...restForm, deliveryFee: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Min Order ($)">
            <input type="number" step="0.01" min="0" value={restForm.minOrder} onChange={(e) => setRestForm({ ...restForm, minOrder: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={restForm.tags} onChange={(e) => setRestForm({ ...restForm, tags: e.target.value })} placeholder="spicy, vegan, family" className={inputCls} />
          </Field>
          <div className="flex gap-6 py-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={restForm.isOpen} onChange={(e) => setRestForm({ ...restForm, isOpen: e.target.checked })} className="w-4 h-4 accent-brand rounded" />
              <span className="text-sm font-medium">Open Now</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={restForm.isFeatured} onChange={(e) => setRestForm({ ...restForm, isFeatured: e.target.checked })} className="w-4 h-4 accent-brand rounded" />
              <span className="text-sm font-medium">Featured</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-surface-3 mt-4">
            <button type="submit" disabled={restSaving}
              className="flex-1 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-50">
              {restSaving ? 'Saving…' : editingRest ? 'Update Restaurant' : 'Create Restaurant'}
            </button>
            <button type="button" onClick={() => setRestPanel(false)} className="px-5 py-3 bg-surface-2 rounded-xl font-semibold text-sm hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      </SlidePanel>

      {/* ═══════════════════════════════════════
          FOOD ITEM FORM PANEL
         ═══════════════════════════════════════ */}
      <SlidePanel open={foodPanel} onClose={() => setFoodPanel(false)} title={editingFood ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={handleFoodSubmit} className="space-y-0">
          <Field label="Item Name *">
            <input value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} placeholder="e.g. Butter Chicken" className={inputCls} required />
          </Field>
          <Field label="Description">
            <textarea value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} placeholder="A brief description…" rows={2} className={inputCls + ' resize-none'} />
          </Field>
          <Field label="Restaurant *">
            <select value={foodForm.restaurantId} onChange={(e) => setFoodForm({ ...foodForm, restaurantId: e.target.value })} className={inputCls + ' cursor-pointer'} required>
              <option value="">Select restaurant…</option>
              {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ($) *">
              <input type="number" step="0.01" min="0" value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} placeholder="12.99" className={inputCls} required />
            </Field>
            <Field label="Category *">
              <select value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} className={inputCls + ' cursor-pointer'} required>
                {foodCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Image URL *">
            <input value={foodForm.image} onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })} placeholder="https://images.unsplash.com/…" className={inputCls} required />
            {foodForm.image && <img src={foodForm.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Spice Level">
              <select value={foodForm.spiceLevel} onChange={(e) => setFoodForm({ ...foodForm, spiceLevel: e.target.value })} className={inputCls + ' cursor-pointer'}>
                <option value="">None</option>
                <option value="mild">Mild</option>
                <option value="medium">Medium</option>
                <option value="hot">Hot 🌶️</option>
              </select>
            </Field>
            <Field label="Prep Time">
              <input value={foodForm.preparationTime} onChange={(e) => setFoodForm({ ...foodForm, preparationTime: e.target.value })} placeholder="15-20 min" className={inputCls} />
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <input value={foodForm.tags} onChange={(e) => setFoodForm({ ...foodForm, tags: e.target.value })} placeholder="spicy, gluten-free, popular" className={inputCls} />
          </Field>
          <div className="flex gap-5 py-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={foodForm.isVeg} onChange={(e) => setFoodForm({ ...foodForm, isVeg: e.target.checked })} className="w-4 h-4 accent-veg rounded" />
              <span className="text-sm font-medium">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={foodForm.isAvailable} onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })} className="w-4 h-4 accent-brand rounded" />
              <span className="text-sm font-medium">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={foodForm.isBestseller} onChange={(e) => setFoodForm({ ...foodForm, isBestseller: e.target.checked })} className="w-4 h-4 accent-warning rounded" />
              <span className="text-sm font-medium">Bestseller</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-surface-3 mt-4">
            <button type="submit" disabled={foodSaving}
              className="flex-1 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-50">
              {foodSaving ? 'Saving…' : editingFood ? 'Update Item' : 'Create Item'}
            </button>
            <button type="button" onClick={() => setFoodPanel(false)} className="px-5 py-3 bg-surface-2 rounded-xl font-semibold text-sm hover:bg-surface-3 transition-colors">Cancel</button>
          </div>
        </form>
      </SlidePanel>

      {/* ═══ FOOD TYPE FORM PANEL ═══ */}
      <SlidePanel open={ftPanel} onClose={() => setFtPanel(false)} title={editingFt ? 'Edit Food Type' : 'Add Food Type'}>
        <form onSubmit={handleFtSubmit} className="space-y-4">
          <Field label="Name *"><input value={ftForm.name} onChange={e => setFtForm({...ftForm, name: e.target.value})} className={inputCls} required placeholder="e.g. Indian, Chinese, Fast Food" /></Field>
          <Field label="Icon Emoji"><input value={ftForm.icon} onChange={e => setFtForm({...ftForm, icon: e.target.value})} className={inputCls} placeholder="🍕" /></Field>
          <Field label="Description"><textarea value={ftForm.description} onChange={e => setFtForm({...ftForm, description: e.target.value})} className={inputCls + ' resize-none'} rows={3} placeholder="Brief description..." /></Field>
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input type="checkbox" checked={ftForm.isActive} onChange={e => setFtForm({...ftForm, isActive: e.target.checked})} className="w-4 h-4 accent-brand" />
            <span className="text-sm font-medium">Active</span>
          </label>
          <div className="flex gap-3 pt-4 border-t border-surface-3">
            <button type="submit" disabled={ftSaving} className="flex-1 py-3 bg-brand text-white rounded-xl font-bold disabled:opacity-50">{ftSaving ? 'Saving…' : editingFt ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setFtPanel(false)} className="px-5 py-3 bg-surface-2 rounded-xl font-semibold text-sm">Cancel</button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
