import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isDirect = params.get('direct') === 'true';
  const { user } = useAuth();
  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState(user?.addresses?.find((a) => a.isDefault) || { street: '', city: '', postalCode: '' });
  const [payment, setPayment] = useState('upi');
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = subtotal >= 30 ? 0 : 3.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in first'); navigate('/login'); return; }
    if (!address.street || !address.city) { toast.error('Please enter delivery address'); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setSubmitting(true);
    try {
      await createOrder({
        restaurantId,
        items: items.map((i) => ({ foodItem: i._id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        subtotal, deliveryFee, tax, discount: 0, totalAmount: total,
        paymentMethod: payment,
        deliveryAddress: { label: 'Delivery', street: address.street, city: address.city, postalCode: address.postalCode },
        isDirectOrder: isDirect,
      });
      clearCart();
      toast.success('Order placed successfully! 🎉', { duration: 4000 });
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setSubmitting(false); }
  };

  const paymentMethods = [
    { id: 'upi', icon: 'account_balance', name: 'UPI / Google Pay', sub: 'Instant payment' },
    { id: 'card', icon: 'credit_card', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex' },
    { id: 'cod', icon: 'payments', name: 'Cash on Delivery', sub: 'Pay when delivered' },
  ];

  return (
    <main className="pt-20 pb-12 max-w-2xl mx-auto px-4">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold font-display mb-1">Checkout</motion.h1>
      <p className="text-muted mb-8">{isDirect ? 'Direct order' : `${items.length} items`} from {restaurantName}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Items Summary */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-display mb-4">Order Summary</h3>
          {items.map((item) => (
            <div key={item._id} className="flex items-center justify-between py-2.5 border-b border-surface-2 last:border-0">
              <div className="flex items-center gap-3">
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted ml-2">×{item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-surface-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{deliveryFee === 0 ? <span className="text-success font-semibold">FREE</span> : `$${deliveryFee.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-muted">Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-3"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </section>

        {/* Delivery Address */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-display mb-4">Delivery Address</h3>
          {user?.addresses?.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {user.addresses.map((a) => (
                <button type="button" key={a._id} onClick={() => setAddress(a)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    address.street === a.street ? 'border-brand bg-brand/5 text-brand' : 'border-surface-3 text-muted hover:border-brand/30'
                  }`}>
                  <span className="material-symbols-outlined text-sm mr-1.5">{a.label === 'Home' ? 'home' : a.label === 'Work' ? 'work' : 'location_on'}</span>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-3">
            <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street address…"
              className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required />
            <div className="grid grid-cols-2 gap-3">
              <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City"
                className="px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required />
              <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} placeholder="Post Code"
                className="px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold font-display mb-4">Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <label key={pm.id} className="cursor-pointer block">
                <input type="radio" name="payment" value={pm.id} checked={payment === pm.id} onChange={() => setPayment(pm.id)} className="hidden peer" />
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all peer-checked:border-brand peer-checked:bg-brand-50 border-surface-3 hover:border-brand/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center"><span className="material-symbols-outlined text-dark-2">{pm.icon}</span></div>
                    <div><p className="font-semibold text-sm">{pm.name}</p><p className="text-xs text-muted">{pm.sub}</p></div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === pm.id ? 'border-brand' : 'border-surface-3'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-brand transition-transform ${payment === pm.id ? 'scale-100' : 'scale-0'}`} />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <button type="submit" disabled={submitting || items.length === 0}
          className="w-full py-4 bg-brand text-white rounded-2xl font-bold text-lg shadow-lg shadow-brand/20 hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
        </button>
      </form>
    </main>
  );
}
