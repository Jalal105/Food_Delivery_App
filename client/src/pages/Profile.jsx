import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { updateProfile, addAddress, deleteAddress } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addr, setAddr] = useState({ label: 'Home', street: '', city: '', state: '', postalCode: '', isDefault: false });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile({ name, phone });
      updateUser(data);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addAddress(addr);
      updateUser({ addresses: data });
      setShowAddAddr(false);
      setAddr({ label: 'Home', street: '', city: '', state: '', postalCode: '', isDefault: false });
      toast.success('Address added');
    } catch { toast.error('Failed to add'); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await deleteAddress(id);
      updateUser({ addresses: data });
      toast.success('Address removed');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <main className="pt-20 pb-12 max-w-3xl mx-auto px-4">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold font-display mb-8">My Profile</motion.h1>

      {/* Profile Info */}
      <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-brand text-2xl font-bold font-display">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className="text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full font-semibold mt-1 inline-block capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-semibold text-dark-3 block mb-1.5 ml-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
          <div><label className="text-sm font-semibold text-dark-3 block mb-1.5 ml-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" className="w-full px-4 py-3 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" /></div>
        </div>
        <button onClick={handleProfileSave} disabled={saving}
          className="mt-4 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark active:scale-95 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Changes'}</button>
      </section>

      {/* Addresses */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold font-display">Saved Addresses</h3>
          <button onClick={() => setShowAddAddr(!showAddAddr)}
            className="text-sm text-brand font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">add</span>Add New
          </button>
        </div>

        {showAddAddr && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddAddress}
            className="bg-surface-2 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map((l) => (
                <button type="button" key={l} onClick={() => setAddr({ ...addr, label: l })}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${addr.label === l ? 'bg-brand text-white' : 'bg-white text-muted'}`}>{l}</button>
              ))}
            </div>
            <input value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} placeholder="Street address" className="w-full px-3 py-2.5 bg-white rounded-lg text-sm outline-none" required />
            <div className="grid grid-cols-3 gap-2">
              <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="City" className="px-3 py-2.5 bg-white rounded-lg text-sm outline-none" required />
              <input value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} placeholder="State" className="px-3 py-2.5 bg-white rounded-lg text-sm outline-none" />
              <input value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value })} placeholder="ZIP" className="px-3 py-2.5 bg-white rounded-lg text-sm outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold">Save Address</button>
              <button type="button" onClick={() => setShowAddAddr(false)} className="px-4 py-2 bg-surface-3 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          </motion.form>
        )}

        {user?.addresses?.length === 0 ? (
          <p className="text-muted text-sm py-4">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3">
            {user?.addresses?.map((a) => (
              <div key={a._id} className="flex items-start justify-between p-3 border border-surface-3 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-brand mt-0.5">{a.label === 'Home' ? 'home' : a.label === 'Work' ? 'work' : 'location_on'}</span>
                  <div>
                    <p className="font-semibold text-sm">{a.label}{a.isDefault && <span className="text-xs ml-2 text-success">Default</span>}</p>
                    <p className="text-muted text-xs">{a.street}, {a.city} {a.postalCode}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(a._id)} className="text-error/50 hover:text-error">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
