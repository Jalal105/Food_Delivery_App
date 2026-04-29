import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, restaurantName, removeItem, updateQty, subtotal, clearCart } = useCart();
  const deliveryFee = subtotal >= 30 ? 0 : 3.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) return (
    <main className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <span className="material-symbols-outlined text-7xl text-surface-3">shopping_cart</span>
      <h2 className="text-2xl font-bold font-display">Your cart is empty</h2>
      <p className="text-muted text-center">Add items from a restaurant to start your order.</p>
      <Link to="/restaurants" className="px-8 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-95 transition-all mt-2">Browse Restaurants</Link>
    </main>
  );

  return (
    <main className="pt-20 pb-12 max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold font-display">Your Cart</motion.h1>
          <p className="text-muted text-sm mt-1">From <span className="font-semibold text-dark">{restaurantName}</span></p>
        </div>
        <button onClick={clearCart} className="text-sm text-error font-medium hover:underline">Clear All</button>
      </div>

      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div key={item._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm border-2 ${item.isVeg ? 'border-veg' : 'border-nonveg'}`}>
                    <span className={`block w-1 h-1 m-[2px] rounded-full ${item.isVeg ? 'bg-veg' : 'bg-nonveg'}`} />
                  </span>
                  <h3 className="font-semibold truncate">{item.name}</h3>
                </div>
                <p className="text-brand font-bold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1 bg-surface-2 rounded-xl">
                <button onClick={() => updateQty(item._id, item.quantity - 1)} className="p-2 hover:bg-surface-3 rounded-l-xl transition-colors">
                  <span className="material-symbols-outlined text-sm">{item.quantity === 1 ? 'delete' : 'remove'}</span>
                </button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)} className="p-2 hover:bg-surface-3 rounded-r-xl transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3 mb-6">
        <h3 className="font-bold font-display text-lg mb-4">Bill Details</h3>
        <div className="flex justify-between text-sm"><span className="text-muted">Item Total</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted">Delivery Fee</span>
          <span className="font-medium">{deliveryFee === 0 ? <span className="text-success">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-sm"><span className="text-muted">Taxes</span><span className="font-medium">${tax.toFixed(2)}</span></div>
        <div className="h-px bg-surface-3 my-2" />
        <div className="flex justify-between"><span className="font-bold font-display">Total</span><span className="font-bold text-lg">${total.toFixed(2)}</span></div>
        {subtotal < 30 && <p className="text-xs text-muted">Add ${(30 - subtotal).toFixed(2)} more for free delivery</p>}
      </div>

      <Link to="/checkout" className="block w-full py-4 bg-brand text-white rounded-2xl font-bold text-center text-lg hover:bg-brand-dark active:scale-[0.98] transition-all shadow-lg shadow-brand/20">
        Proceed to Checkout — ${total.toFixed(2)}
      </Link>
    </main>
  );
}
