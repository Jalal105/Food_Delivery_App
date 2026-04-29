import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getRestaurants, getFoodItems } from '../services/api';
import RestaurantCard from '../components/shop/RestaurantCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

const cuisines = ['🍕 Pizza', '🍔 Burgers', '🍣 Sushi', '🥘 Indian', '🍜 Chinese', '🥙 Mediterranean', '🥗 Healthy'];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      getRestaurants({ featured: 'true', limit: 4 }),
      getFoodItems({ limit: 6 }),
    ]).then(([r, f]) => {
      setFeatured(r.data.restaurants);
      setPopular(f.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-2 to-accent min-h-[600px] flex items-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10 py-20">
          <motion.div initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-6">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Delivering in your area</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold text-white leading-[1.1] font-display mb-6">
              Your Favourite Food, <br />
              <span className="text-brand">Delivered Fast</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-white/60 mb-8 max-w-lg">
              Browse menus from top-rated restaurants and get doorstep delivery in minutes. Fresh, fast, and always delicious.
            </motion.p>
            <motion.div variants={fadeUp} custom={3}>
              <div className="flex bg-white rounded-2xl p-2 shadow-2xl max-w-xl">
                <div className="flex items-center gap-2 px-4 flex-1">
                  <span className="material-symbols-outlined text-brand">search</span>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for restaurants, dishes…" className="w-full py-3 bg-transparent outline-none text-dark placeholder:text-muted" />
                </div>
                <Link to={`/restaurants${searchQuery ? `?search=${searchQuery}` : ''}`}
                  className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-95 transition-all hidden md:flex items-center">
                  Search
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
        {/* Floating food images */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-2 gap-4 pr-8 opacity-80">
          {['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=250','https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=250','https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=250','https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=250'].map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8, rotate: i % 2 ? 3 : -3 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
              className="w-40 h-40 rounded-2xl overflow-hidden shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500"
            >
              <img src={src} className="w-full h-full object-cover" alt="" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cuisine Quick Links */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
          {cuisines.map((c) => (
            <Link key={c} to={`/restaurants?cuisine=${c.split(' ')[1]}`}
              className="flex-shrink-0 px-6 py-3 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all font-medium text-sm whitespace-nowrap border border-surface-3/50">
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-brand font-bold text-xs uppercase tracking-widest">Top Picks</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display mt-1">Featured Restaurants</h2>
          </div>
          <Link to="/restaurants" className="text-brand font-bold text-sm hover:underline underline-offset-4">View All →</Link>
        </div>
        {loading ? <div className="grid grid-cols-1 md:grid-cols-4 gap-6"><SkeletonLoader className="h-72" count={4} /></div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Popular Dishes */}
      <section className="bg-surface-2 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-brand font-bold text-xs uppercase tracking-widest">Most Ordered</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display mt-1">Popular Right Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popular.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} className="group text-center">
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-3 ring-4 ring-white shadow-lg group-hover:ring-brand transition-all">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                <p className="text-brand font-bold text-sm">${item.price.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <h2 className="text-3xl font-bold font-display text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'search', title: 'Browse & Choose', desc: 'Explore menus from hundreds of restaurants near you.', step: '01' },
            { icon: 'shopping_cart', title: 'Place Your Order', desc: 'Add to cart or order directly. Choose your payment method.', step: '02' },
            { icon: 'delivery_dining', title: 'Fast Delivery', desc: 'Track your order in real-time. Enjoy your meal!', step: '03' },
          ].map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative p-8 rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all group">
              <span className="absolute top-4 right-4 text-6xl font-black text-surface-3 group-hover:text-brand/10 transition-colors font-display">{s.step}</span>
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-white text-brand transition-all">
                <span className="material-symbols-outlined text-2xl">{s.icon}</span>
              </div>
              <h3 className="text-xl font-bold font-display mb-2">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand mx-4 md:mx-8 rounded-3xl py-16 mb-12">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-4">Hungry? We've Got You.</h2>
          <p className="text-white/70 text-lg mb-8">Download the app or start ordering right now from your browser.</p>
          <Link to="/restaurants" className="inline-flex px-10 py-4 bg-white text-brand rounded-2xl font-bold text-lg hover:shadow-2xl active:scale-95 transition-all">
            Order Now
          </Link>
        </div>
      </section>
    </main>
  );
}
