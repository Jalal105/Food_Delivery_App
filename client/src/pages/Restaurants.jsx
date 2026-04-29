import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRestaurants, getFoodTypes } from '../services/api';
import RestaurantCard from '../components/shop/RestaurantCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

const cuisineFilters = ['All', 'Indian', 'Italian', 'Chinese', 'Japanese', 'American', 'Mediterranean', 'Fast Food', 'Healthy'];

export default function Restaurants() {
  const [params, setParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCuisine, setActiveCuisine] = useState(params.get('cuisine') || 'All');
  const [activeFoodType, setActiveFoodType] = useState(params.get('foodType') || '');
  const [search, setSearch] = useState(params.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sortBy, setSortBy] = useState('rating');
  const [vegOnly, setVegOnly] = useState(false);

  // Load food types once
  useEffect(() => {
    getFoodTypes({ active: 'true' })
      .then(({ data }) => setFoodTypes(data))
      .catch(() => {});
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch restaurants whenever filters change
  useEffect(() => {
    setLoading(true);
    const q = {};
    if (activeCuisine !== 'All') q.cuisine = activeCuisine;
    if (debouncedSearch) q.search = debouncedSearch;

    getRestaurants(q)
      .then(({ data }) => setRestaurants(data.restaurants))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, [activeCuisine, debouncedSearch]);

  // Client-side food type + veg filtering + sorting
  const filtered = restaurants
    .filter(r => !vegOnly || r.tags?.includes('veg') || r.cuisine?.includes('Healthy'))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'delivery_fee') return a.deliveryFee - b.deliveryFee;
      return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
    });

  const clearAll = () => {
    setSearch(''); setActiveCuisine('All'); setActiveFoodType(''); setVegOnly(false);
  };

  const hasFilters = search || activeCuisine !== 'All' || activeFoodType || vegOnly;

  return (
    <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 md:px-8">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold font-display mb-2">All Restaurants</motion.h1>
        <p className="text-muted">Find your next favourite meal from our curated partners.</p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl p-2 shadow-sm border border-surface-3 focus-within:border-brand/30 focus-within:shadow-md transition-all">
        <span className="material-symbols-outlined text-muted pl-3">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants by name, cuisine, or dish..."
          className="flex-1 py-3 bg-transparent outline-none text-sm"
        />
        {loading && search && (
          <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {search && (
          <button onClick={() => setSearch('')} className="p-2 hover:bg-surface-2 rounded-xl">
            <span className="material-symbols-outlined text-sm text-muted">close</span>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Cuisine chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cuisineFilters.map((c) => (
            <button key={c} onClick={() => setActiveCuisine(c)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeCuisine === c ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white text-muted hover:bg-surface-2 border border-surface-3'
              }`}>{c}</button>
          ))}
        </div>

        {/* Food type chips (from admin-managed types) */}
        {foodTypes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setActiveFoodType('')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                !activeFoodType ? 'bg-dark text-white' : 'bg-white text-muted hover:bg-surface-2 border border-surface-3'
              }`}>
              🍽️ All Types
            </button>
            {foodTypes.map((ft) => (
              <button key={ft._id} onClick={() => setActiveFoodType(ft._id === activeFoodType ? '' : ft._id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeFoodType === ft._id ? 'bg-dark text-white' : 'bg-white text-muted hover:bg-surface-2 border border-surface-3'
                }`}>
                <span>{ft.icon}</span> {ft.name}
              </button>
            ))}
          </div>
        )}

        {/* Bottom row: veg toggle + sort + clear */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                vegOnly ? 'bg-veg/10 border-veg text-veg' : 'bg-white border-surface-3 text-muted hover:bg-surface-2'
              }`}>
              <span className={`w-3 h-3 rounded-sm border-2 border-veg flex items-center justify-center`}>
                {vegOnly && <span className="w-1.5 h-1.5 rounded-full bg-veg block" />}
              </span>
              Pure Veg
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-brand font-semibold hover:underline">
                Clear all filters
              </button>
            )}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white rounded-xl text-sm font-medium border border-surface-3 cursor-pointer">
            <option value="rating">Sort: Top Rated</option>
            <option value="delivery">Sort: Fastest Delivery</option>
            <option value="delivery_fee">Sort: Lowest Fee</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Search result count */}
      {!loading && debouncedSearch && (
        <p className="text-sm text-muted mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for <span className="font-semibold text-dark">"{debouncedSearch}"</span>
        </p>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-surface-3 mb-4">search_off</span>
          <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
          <p className="text-muted mb-4">Try adjusting your filters or search terms.</p>
          {hasFilters && (
            <button onClick={clearAll} className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeCuisine + sortBy + activeFoodType}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, i) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <RestaurantCard restaurant={r} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}
