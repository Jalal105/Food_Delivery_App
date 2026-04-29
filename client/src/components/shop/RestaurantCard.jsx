import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurant/${restaurant._id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-shadow"
      >
        <div className="relative h-48 overflow-hidden">
          <img src={restaurant.image} alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {restaurant.isFeatured && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-brand text-white text-xs font-bold rounded-full">Featured</span>
          )}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-sm font-bold">{restaurant.rating}</span>
            <span className="text-xs text-muted">({restaurant.numRatings})</span>
          </div>
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold bg-error/90 px-4 py-2 rounded-full text-sm">Currently Closed</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold font-display mb-1">{restaurant.name}</h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {restaurant.cuisine?.slice(0, 3).map((c) => (
              <span key={c} className="text-xs px-2.5 py-0.5 bg-surface-2 text-muted rounded-full">{c}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">delivery_dining</span>
              {restaurant.deliveryFee === 0 ? <span className="text-success font-semibold">Free</span> : `$${restaurant.deliveryFee.toFixed(2)}`}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
