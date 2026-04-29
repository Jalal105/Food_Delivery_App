import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getMyRestaurants, getRestaurantOrders, getRestaurantStats,
  createRestaurant, updateRestaurant, createFood, updateFood, deleteFood, toggleFood,
  getFoodItems, getFoodTypes, updateOrderStatus,
} from '../../services/api';
import toast from 'react-hot-toast';

const statusColor = { placed:'bg-blue-100 text-blue-700', confirmed:'bg-indigo-100 text-indigo-700', preparing:'bg-yellow-100 text-yellow-700', out_for_delivery:'bg-orange-100 text-orange-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700' };
const statusLabel = { placed:'Placed', confirmed:'Confirmed', preparing:'Preparing', out_for_delivery:'On the Way', delivered:'Delivered', cancelled:'Cancelled' };
const foodCategories = ['Starters','Main Course','Desserts','Beverages','Sides','Combos','Specials'];

function SlidePanel({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (<>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
        <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:30,stiffness:300}} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-surface-3">
            <h2 className="text-xl font-bold font-display">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-surface-2 rounded-xl"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </motion.div>
      </>)}
    </AnimatePresence>
  );
}

function RestaurantFormPanel({ open, onClose, form, setForm, onSubmit, saving, isEdit }) {
  const f = (key) => ({ value: form[key]||'', onChange: e => setForm(p=>({...p,[key]:e.target.value})) });
  return (
    <SlidePanel open={open} onClose={onClose} title={isEdit ? 'Edit Restaurant' : 'Create Restaurant'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="text-sm font-semibold block mb-1">Restaurant Name *</label><input {...f('name')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required /></div>
        <div><label className="text-sm font-semibold block mb-1">Description</label><textarea {...f('description')} rows={3} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm resize-none" /></div>
        <div><label className="text-sm font-semibold block mb-1">Cover Image URL</label><input {...f('coverImage')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" placeholder="https://..." />
          {form.coverImage && <img src={form.coverImage} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e=>{e.target.style.display='none'}} />}
        </div>
        <div><label className="text-sm font-semibold block mb-1">Logo / Main Image URL *</label><input {...f('image')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required placeholder="https://..." />
          {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-20 object-cover rounded-xl" onError={e=>{e.target.style.display='none'}} />}
        </div>
        <div><label className="text-sm font-semibold block mb-1">Cuisine (comma-separated)</label><input {...f('cuisine')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" placeholder="Indian, Chinese, Fast Food" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-semibold block mb-1">Street Address</label><input {...f('address.street')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
          <div><label className="text-sm font-semibold block mb-1">City</label><input {...f('address.city')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-semibold block mb-1">Opens At</label><input type="time" {...f('openingHours.open')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
          <div><label className="text-sm font-semibold block mb-1">Closes At</label><input type="time" {...f('openingHours.close')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-sm font-semibold block mb-1">Delivery Time</label><input {...f('deliveryTime')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" placeholder="30-40 min" /></div>
          <div><label className="text-sm font-semibold block mb-1">Delivery Fee ($)</label><input type="number" {...f('deliveryFee')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
          <div><label className="text-sm font-semibold block mb-1">Min Order ($)</label><input type="number" {...f('minOrder')} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-surface-3">
          <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand text-white rounded-xl font-bold disabled:opacity-50">{saving ? 'Saving…' : isEdit ? 'Update Restaurant' : 'Create Restaurant'}</button>
          <button type="button" onClick={onClose} className="px-5 py-3 bg-surface-2 rounded-xl font-semibold text-sm">Cancel</button>
        </div>
      </form>
    </SlidePanel>
  );
}

const inputCls = 'w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm';


export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [restaurants, setRestaurants] = useState([]);
  const [activeRest, setActiveRest] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');

  // Panel states
  const [foodPanel, setFoodPanel] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({ name:'',description:'',price:'',image:'',category:'Main Course',foodType:'',isVeg:false,isAvailable:true,isBestseller:false,spiceLevel:'',tags:'' });
  const [foodSaving, setFoodSaving] = useState(false);

  const [restPanel, setRestPanel] = useState(false);
  const [editingRest, setEditingRest] = useState(false);
  const [restForm, setRestForm] = useState({ name:'',description:'',cuisine:'',image:'',coverImage:'',deliveryTime:'30-40 min',deliveryFee:0,minOrder:0,'address.street':'','address.city':'','openingHours.open':'09:00','openingHours.close':'23:00' });
  const [restSaving, setRestSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, ftRes] = await Promise.all([getMyRestaurants(), getFoodTypes({active:'true'})]);
      setRestaurants(rRes.data);
      setFoodTypes(ftRes.data);
      if (rRes.data.length > 0) {
        const r = rRes.data[0];
        setActiveRest(r);
        await loadRestaurantData(r._id);
      }
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const loadRestaurantData = async (id) => {
    try {
      const [sRes, oRes, mRes] = await Promise.all([
        getRestaurantStats(id), getRestaurantOrders(id, {limit:50}), getFoodItems({restaurantId:id,limit:200}),
      ]);
      setStats(sRes.data);
      setOrders(oRes.data.orders);
      setMenuItems(mRes.data.items);
    } catch {}
  };

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      setOrders(orders.map(o => o._id === id ? {...o, status} : o));
      toast.success(`Order → ${statusLabel[status]}`);
    } catch { toast.error('Failed'); }
  };

  const openAddFood = () => {
    setEditingFood(null);
    setFoodForm({ name:'',description:'',price:'',image:'',category:'Main Course',foodType:'',isVeg:false,isAvailable:true,isBestseller:false,spiceLevel:'',tags:'' });
    setFoodPanel(true);
  };

  const openEditFood = (item) => {
    setEditingFood(item);
    setFoodForm({ name:item.name,description:item.description||'',price:item.price,image:item.image,category:item.category,foodType:item.foodType?._id||item.foodType||'',isVeg:item.isVeg,isAvailable:item.isAvailable,isBestseller:item.isBestseller,spiceLevel:item.spiceLevel||'',tags:(item.tags||[]).join(', ') });
    setFoodPanel(true);
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    setFoodSaving(true);
    const body = { ...foodForm, price:Number(foodForm.price), tags:foodForm.tags.split(',').map(s=>s.trim()).filter(Boolean), restaurantId:activeRest._id };
    if (!body.foodType) delete body.foodType;
    try {
      if (editingFood) {
        const {data} = await updateFood(editingFood._id, body);
        setMenuItems(menuItems.map(m => m._id === editingFood._id ? data : m));
        toast.success('Item updated!');
      } else {
        const {data} = await createFood(body);
        setMenuItems([data, ...menuItems]);
        toast.success('Item created!');
      }
      setFoodPanel(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setFoodSaving(false); }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteFood(id); setMenuItems(menuItems.filter(m => m._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try { const {data} = await toggleFood(id); setMenuItems(menuItems.map(m => m._id === id ? data : m)); toast.success(`Item ${data.isAvailable?'enabled':'disabled'}`); }
    catch { toast.error('Failed'); }
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    setRestSaving(true);
    try {
      const body = {
        name: restForm.name,
        description: restForm.description,
        cuisine: restForm.cuisine.split(',').map(s=>s.trim()).filter(Boolean),
        image: restForm.image,
        coverImage: restForm.coverImage,
        deliveryTime: restForm.deliveryTime,
        deliveryFee: Number(restForm.deliveryFee),
        minOrder: Number(restForm.minOrder),
        address: { street: restForm['address.street'], city: restForm['address.city'] },
        openingHours: { open: restForm['openingHours.open'], close: restForm['openingHours.close'] },
      };
      if (editingRest && activeRest) {
        const {data} = await updateRestaurant(activeRest._id, body);
        setActiveRest(data); setRestaurants(restaurants.map(r=>r._id===data._id?data:r));
        toast.success('Restaurant updated!');
      } else {
        const {data} = await createRestaurant(body);
        setRestaurants([data]); setActiveRest(data);
        await loadRestaurantData(data._id);
        toast.success('Restaurant created! ✅');
      }
      setRestPanel(false);
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setRestSaving(false); }
  };

  const openEditRest = () => {
    if (!activeRest) return;
    setEditingRest(true);
    setRestForm({
      name: activeRest.name||'', description: activeRest.description||'',
      cuisine: (activeRest.cuisine||[]).join(', '), image: activeRest.image||'',
      coverImage: activeRest.coverImage||'', deliveryTime: activeRest.deliveryTime||'30-40 min',
      deliveryFee: activeRest.deliveryFee||0, minOrder: activeRest.minOrder||0,
      'address.street': activeRest.address?.street||'', 'address.city': activeRest.address?.city||'',
      'openingHours.open': activeRest.openingHours?.open||'09:00', 'openingHours.close': activeRest.openingHours?.close||'23:00',
    });
    setRestPanel(true);
  };

  const openCreateRest = () => {
    setEditingRest(false);
    setRestForm({ name:'',description:'',cuisine:'',image:'',coverImage:'',deliveryTime:'30-40 min',deliveryFee:0,minOrder:0,'address.street':'','address.city':'','openingHours.open':'09:00','openingHours.close':'23:00' });
    setRestPanel(true);
  };

  const tabs = [
    {id:'overview',icon:'dashboard',label:'Overview'},
    {id:'orders',icon:'receipt_long',label:'Orders'},
    {id:'menu',icon:'restaurant_menu',label:'Menu'},
    {id:'settings',icon:'settings',label:'My Restaurant'},
  ];

  const filteredMenu = menuItems.filter(item =>
    !menuSearch || item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(menuSearch.toLowerCase()) ||
    item.description?.toLowerCase().includes(menuSearch.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  // No restaurant yet — show setup wizard
  if (restaurants.length === 0) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-surface">
      <div className="text-center max-w-md w-full">
        <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl text-brand">storefront</span>
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Set Up Your Restaurant</h2>
        <p className="text-muted mb-6">You're approved! Fill in your restaurant details to get started.</p>
        <button onClick={openCreateRest} className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">Create My Restaurant</button>
        <RestaurantFormPanel open={restPanel} onClose={()=>setRestPanel(false)} form={restForm} setForm={setRestForm} onSubmit={handleSaveRestaurant} saving={restSaving} isEdit={false} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-dark fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center"><span className="text-white font-bold font-display">B</span></div>
            <span className="text-lg font-bold text-white font-display">BiteDash</span>
          </Link>
          <p className="text-white/40 text-xs mt-2">Restaurant Dashboard</p>
        </div>
        {activeRest && (
          <div className="p-4 border-b border-white/10">
            <p className="text-white text-sm font-semibold truncate">{activeRest.name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block ${activeRest.approvalStatus==='approved'?'bg-green-500/20 text-green-400':'bg-amber-500/20 text-amber-400'}`}>{activeRest.approvalStatus}</span>
          </div>
        )}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab===t.id?'bg-brand text-white':'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate">{user?.name}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm">
            <span className="material-symbols-outlined">logout</span>Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="flex lg:hidden gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap ${tab===t.id?'bg-brand text-white':'bg-white text-muted'}`}>
              <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <h1 className="text-3xl font-bold font-display mb-1">Dashboard</h1>
            <p className="text-muted mb-8">Welcome back, {user?.name?.split(' ')[0]}!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {icon:'attach_money',label:'Total Revenue',value:`$${stats.totalRevenue?.toFixed(2)||0}`,color:'bg-green-50 text-green-600',iconBg:'bg-green-100'},
                {icon:'shopping_bag',label:'Total Orders',value:stats.totalOrders||0,color:'bg-blue-50 text-blue-600',iconBg:'bg-blue-100'},
                {icon:'today',label:"Today's Revenue",value:`$${stats.todayRevenue?.toFixed(2)||0}`,color:'bg-orange-50 text-orange-600',iconBg:'bg-orange-100'},
                {icon:'restaurant_menu',label:'Menu Items',value:stats.totalItems||0,color:'bg-purple-50 text-purple-600',iconBg:'bg-purple-100'},
              ].map(s => (
                <div key={s.label} className={`${s.color} p-5 rounded-2xl`}>
                  <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center mb-3`}><span className="material-symbols-outlined">{s.icon}</span></div>
                  <p className="text-sm font-medium opacity-70">{s.label}</p>
                  <p className="text-2xl font-bold font-display mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            {stats.statusBreakdown && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold font-display mb-4">Order Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.statusBreakdown).map(([k,v]) => (
                    <div key={k} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[k]}`}>{statusLabel[k]}</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <h2 className="text-2xl font-bold font-display mb-6">Orders</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-surface-2">
                    {['Order','Customer','Items','Total','Status'].map(h => <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-muted uppercase tracking-wider">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-surface-2">
                    {orders.map(order => (
                      <tr key={order._id} className="hover:bg-surface-2/30">
                        <td className="px-5 py-4 text-sm font-mono font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-5 py-4"><p className="text-sm font-medium">{order.userId?.name||'—'}</p><p className="text-xs text-muted">{order.userId?.email}</p></td>
                        <td className="px-5 py-4 text-sm text-muted max-w-[200px] truncate">{order.items.map(i=>`${i.quantity}× ${i.name}`).join(', ')}</td>
                        <td className="px-5 py-4 text-sm font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <select value={order.status} onChange={e => handleStatus(order._id, e.target.value)} className={`text-xs px-3 py-1.5 rounded-full font-bold border-none cursor-pointer ${statusColor[order.status]}`}>
                            {Object.entries(statusLabel).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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

        {/* Settings Tab */}
        {tab === 'settings' && activeRest && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold font-display">My Restaurant</h2><p className="text-muted text-sm mt-1">Manage your restaurant details</p></div>
              <button onClick={openEditRest} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-all">
                <span className="material-symbols-outlined text-lg">edit</span>Edit Details
              </button>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {activeRest.coverImage && <img src={activeRest.coverImage} alt="Cover" className="w-full h-48 object-cover" />}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={activeRest.image} alt={activeRest.name} className="w-20 h-20 rounded-2xl object-cover shadow" />
                  <div>
                    <h3 className="text-xl font-bold font-display">{activeRest.name}</h3>
                    <p className="text-muted text-sm mt-1">{activeRest.description}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold mt-2 inline-block ${activeRest.approvalStatus==='approved'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{activeRest.approvalStatus}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-surface-3">
                  {[['Cuisine',(activeRest.cuisine||[]).join(', '),'restaurant'],['Delivery Time',activeRest.deliveryTime,'schedule'],['Delivery Fee',`$${activeRest.deliveryFee||0}`,'delivery'],['Min Order',`$${activeRest.minOrder||0}`,'shopping_bag'],['Address',`${activeRest.address?.street||''} ${activeRest.address?.city||''}`,'location_on'],['Hours',`${activeRest.openingHours?.open||'09:00'} – ${activeRest.openingHours?.close||'23:00'}`,'schedule']].map(([label,val,icon])=>(
                    <div key={label}>
                      <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><span className="material-symbols-outlined text-sm">{icon}</span>{label}</div>
                      <p className="text-sm font-semibold">{val||'—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu */}
        {tab === 'menu' && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold font-display">Menu Items</h2>
                <p className="text-muted text-sm mt-1">{filteredMenu.length}/{menuItems.length} items</p>
              </div>
              <button onClick={openAddFood} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all shadow-md shadow-brand/20">
                <span className="material-symbols-outlined text-lg">add</span>Add Item
              </button>
            </div>
            <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-2 shadow-sm border border-surface-3">
              <span className="material-symbols-outlined text-muted pl-2">search</span>
              <input value={menuSearch} onChange={e=>setMenuSearch(e.target.value)} placeholder="Search menu items by name, category..." className="flex-1 py-2 bg-transparent outline-none text-sm" />
              {menuSearch && <button onClick={()=>setMenuSearch('')} className="p-1.5 hover:bg-surface-2 rounded-lg"><span className="material-symbols-outlined text-sm text-muted">close</span></button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map(item => (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative h-40">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {!item.isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-sm">Unavailable</span></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${item.isVeg?'border-veg':'border-nonveg'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg?'bg-veg':'bg-nonveg'}`} />
                      </span>
                      <h4 className="font-bold text-sm truncate flex-1">{item.name}</h4>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-brand font-bold">${item.price.toFixed(2)}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-surface-2 text-muted rounded-full">{item.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditFood(item)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-2 rounded-xl text-xs font-semibold hover:bg-surface-3">
                        <span className="material-symbols-outlined text-sm">edit</span>Edit
                      </button>
                      <button onClick={() => handleToggle(item._id)} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${item.isAvailable?'bg-amber-50 text-amber-600':'bg-emerald-50 text-emerald-600'}`}>
                        {item.isAvailable?'Disable':'Enable'}
                      </button>
                      <button onClick={() => handleDeleteFood(item._id)} className="p-2 rounded-xl text-error/40 hover:text-error hover:bg-red-50">
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
                <h3 className="text-xl font-bold mb-2">No items yet</h3>
                <button onClick={openAddFood} className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm">Add Item</button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Food Form Panel */}
      <SlidePanel open={foodPanel} onClose={() => setFoodPanel(false)} title={editingFood?'Edit Item':'Add Item'}>
        <form onSubmit={handleFoodSubmit} className="space-y-4">
          <div><label className="text-sm font-semibold block mb-1">Name *</label><input value={foodForm.name} onChange={e=>setFoodForm({...foodForm,name:e.target.value})} className={inputCls} required /></div>
          <div><label className="text-sm font-semibold block mb-1">Description</label><textarea value={foodForm.description} onChange={e=>setFoodForm({...foodForm,description:e.target.value})} rows={2} className={inputCls+' resize-none'} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-semibold block mb-1">Price *</label><input type="number" step="0.01" value={foodForm.price} onChange={e=>setFoodForm({...foodForm,price:e.target.value})} className={inputCls} required /></div>
            <div><label className="text-sm font-semibold block mb-1">Category *</label>
              <select value={foodForm.category} onChange={e=>setFoodForm({...foodForm,category:e.target.value})} className={inputCls}>{foodCategories.map(c=><option key={c}>{c}</option>)}</select>
            </div>
          </div>
          <div><label className="text-sm font-semibold block mb-1">Food Type</label>
            <select value={foodForm.foodType} onChange={e=>setFoodForm({...foodForm,foodType:e.target.value})} className={inputCls}>
              <option value="">Select food type…</option>
              {foodTypes.map(ft=><option key={ft._id} value={ft._id}>{ft.icon} {ft.name}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-semibold block mb-1">Image URL *</label><input value={foodForm.image} onChange={e=>setFoodForm({...foodForm,image:e.target.value})} className={inputCls} required />
            {foodForm.image && <img src={foodForm.image} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e=>{e.target.style.display='none'}} />}
          </div>
          <div><label className="text-sm font-semibold block mb-1">Spice Level</label>
            <select value={foodForm.spiceLevel} onChange={e=>setFoodForm({...foodForm,spiceLevel:e.target.value})} className={inputCls}>
              <option value="">None</option><option value="mild">Mild</option><option value="medium">Medium</option><option value="hot">Hot 🌶️</option>
            </select>
          </div>
          <div className="flex gap-5 py-2">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={foodForm.isVeg} onChange={e=>setFoodForm({...foodForm,isVeg:e.target.checked})} className="w-4 h-4 accent-veg" /><span className="text-sm font-medium">Veg</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={foodForm.isAvailable} onChange={e=>setFoodForm({...foodForm,isAvailable:e.target.checked})} className="w-4 h-4 accent-brand" /><span className="text-sm font-medium">Available</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={foodForm.isBestseller} onChange={e=>setFoodForm({...foodForm,isBestseller:e.target.checked})} className="w-4 h-4 accent-warning" /><span className="text-sm font-medium">Bestseller</span></label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-surface-3">
            <button type="submit" disabled={foodSaving} className="flex-1 py-3 bg-brand text-white rounded-xl font-bold disabled:opacity-50">{foodSaving?'Saving…':editingFood?'Update':'Create'}</button>
            <button type="button" onClick={() => setFoodPanel(false)} className="px-5 py-3 bg-surface-2 rounded-xl font-semibold text-sm">Cancel</button>
          </div>
        </form>
      </SlidePanel>

      {/* Restaurant Form Panel (create + edit) */}
      <RestaurantFormPanel
        open={restPanel}
        onClose={() => setRestPanel(false)}
        form={restForm}
        setForm={setRestForm}
        onSubmit={handleSaveRestaurant}
        saving={restSaving}
        isEdit={editingRest}
      />
    </div>
  );
}
