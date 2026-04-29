import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRestaurant, getFoodItems } from '../services/api';
import FoodCard from '../components/shop/FoodCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, clearCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getRestaurant(id), getFoodItems({ restaurantId: id, limit: 100 })])
      .then(([r, f]) => { setRestaurant(r.data); setItems(f.data.items); })
      .catch(() => {})
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const categories = ['All', ...new Set(items.map((i) => i.category))];
  const filtered = items.filter((i) => {
    if (activeCategory !== 'All' && i.category !== activeCategory) return false;
    if (vegOnly && !i.isVeg) return false;
    return true;
  });

  const handleOrderNow = (item) => {
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return; }
    clearCart();
    addItem(item, restaurant._id, restaurant.name);
    navigate('/checkout?direct=true');
  };

  if (loading) return (
    <div className="pt-20 flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!restaurant) return (
    <div className="pt-20 text-center min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-6xl text-surface-3">storefront</span>
      <h2 className="text-2xl font-bold">Restaurant not found</h2>
    </div>
  );

  return (
    <main className="pt-16">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-dark">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              {!restaurant.isOpen && <span className="px-3 py-1 bg-error text-white rounded-full text-xs font-bold">Closed</span>}
              {restaurant.isFeatured && <span className="px-3 py-1 bg-brand text-white rounded-full text-xs font-bold">Featured</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white font-display mb-2">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              {restaurant.cuisine?.map((c) => <span key={c}>{c}</span>)}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-warning text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {restaurant.rating} ({restaurant.numRatings} ratings)
              </span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{restaurant.deliveryTime}</span>
              <span>{restaurant.deliveryFee === 0 ? 'Free delivery' : `$${restaurant.deliveryFee} delivery`}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Category & Veg Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8 sticky top-16 z-30 bg-surface pt-2 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c ? 'bg-dark text-white' : 'bg-white text-muted hover:bg-surface-2'
                }`}>{c}</button>
            ))}
          </div>
          <button onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${vegOnly ? 'bg-veg text-white' : 'bg-white text-muted hover:bg-surface-2'}`}>
            <span className={`w-3 h-3 rounded-sm border-2 ${vegOnly ? 'border-white bg-white/30' : 'border-veg'}`} />
            Veg Only
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <FoodCard key={item._id} item={item} restaurantId={restaurant._id} restaurantName={restaurant.name} onOrderNow={handleOrderNow} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-surface-3">restaurant</span>
            <p className="text-muted mt-3">No items match your filters.</p>
          </div>
        )}
      </div>
    </main>
  );
}
