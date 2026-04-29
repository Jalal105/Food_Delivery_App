import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyOrders } from '../services/api';

const statusColor = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  preparing: 'bg-yellow-100 text-yellow-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabel = { placed: 'Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'On the Way', delivered: 'Delivered', cancelled: 'Cancelled' };
const statusSteps = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getMyOrders({ limit: 50 })
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="pt-20 flex justify-center items-center min-h-screen"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="pt-20 pb-12 max-w-3xl mx-auto px-4">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold font-display mb-8">My Orders</motion.h1>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-surface-3">receipt_long</span>
          <h3 className="text-xl font-bold mt-4 mb-2">No orders yet</h3>
          <p className="text-muted mb-6">Start exploring restaurants and place your first order!</p>
          <Link to="/restaurants" className="px-8 py-3 bg-brand text-white rounded-xl font-bold">Browse Restaurants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {order.restaurantId?.image && <img src={order.restaurantId.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <h3 className="font-bold text-sm">{order.restaurantId?.name || 'Restaurant'}</h3>
                      <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                    <p className="text-sm font-bold mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Tracking Progress */}
                {order.status !== 'cancelled' && (
                  <div className="flex items-center gap-1 mt-4">
                    {statusSteps.map((step, i) => {
                      const stepIdx = statusSteps.indexOf(order.status);
                      const active = i <= stepIdx;
                      return (
                        <div key={step} className="flex-1 flex items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${active ? 'bg-brand' : 'bg-surface-3'}`} />
                          {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 ${active && i < stepIdx ? 'bg-brand' : 'bg-surface-3'}`} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-surface-2 p-5">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted space-y-1 bg-surface-2 rounded-xl p-3">
                    <p><span className="font-semibold">Delivery:</span> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                    <p><span className="font-semibold">Payment:</span> {order.paymentMethod.toUpperCase()} — {order.paymentStatus}</p>
                    <p><span className="font-semibold">Order ID:</span> #{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
