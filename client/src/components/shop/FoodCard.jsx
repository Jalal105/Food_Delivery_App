import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function FoodCard({ item, restaurantId, restaurantName, onOrderNow }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i._id === item._id);

  const handleAdd = () => {
    addItem(item, restaurantId, restaurantName);
    toast.success(`${item.name} added to cart`, { style: { background: '#111827', color: '#fff', borderRadius: '12px', fontSize: '14px' } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="group flex gap-4 p-4 bg-white rounded-2xl hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all"
    >
      {/* Info side */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-veg' : 'border-nonveg'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-veg' : 'bg-nonveg'}`} />
            </span>
            {item.isBestseller && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand-50 px-2 py-0.5 rounded-full">Bestseller</span>
            )}
            {item.spiceLevel === 'hot' && <span className="text-sm">🌶️</span>}
          </div>
          <h4 className="font-bold text-dark text-[15px] font-display truncate">{item.name}</h4>
          <p className="text-brand font-bold text-sm mt-0.5">${item.price.toFixed(2)}</p>
          {item.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-xs text-warning" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-semibold">{item.rating}</span>
              <span className="text-xs text-muted">({item.numRatings})</span>
            </div>
          )}
          <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleAdd}
            className="px-4 py-2 bg-brand/10 text-brand text-xs font-bold rounded-xl hover:bg-brand/20 active:scale-95 transition-all">
            {inCart ? `+ Add More (${inCart.quantity})` : 'Add to Cart'}
          </button>
          {onOrderNow && (
            <button onClick={() => onOrderNow(item)}
              className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-dark active:scale-95 transition-all">
              Order Now
            </button>
          )}
        </div>
      </div>
      {/* Image */}
      <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 relative">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-bold text-error">Unavailable</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
