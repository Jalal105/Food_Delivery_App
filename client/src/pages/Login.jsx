import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const accountTypes = [
  { id: 'user', icon: 'person', label: 'Customer', desc: 'Browse restaurants & order food', color: 'from-blue-500 to-indigo-600' },
  { id: 'restaurant', icon: 'storefront', label: 'Restaurant', desc: 'Register & manage your restaurant', color: 'from-orange-500 to-red-500' },
  { id: 'admin', icon: 'admin_panel_settings', label: 'Admin', desc: 'Verified via skjalaluddin772@gmail.com', color: 'from-purple-500 to-pink-600' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loading, error, clearError } = useAuth();
  const [isReg, setIsReg] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [accountType, setAccountType] = useState('user');
  const [step, setStep] = useState('form'); // 'form' or 'role' (only during registration)

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isReg) {
        const data = await register(form.name, form.email, form.password, accountType);
        if (data.pendingMessage) {
          toast(data.pendingMessage, { icon: '⏳', duration: 5000 });
        } else {
          toast.success('Welcome to BiteDash! 🎉');
        }
        if (accountType === 'restaurant' && data.restaurantApprovalStatus === 'pending') {
          navigate('/');
        } else if (data.role === 'admin') {
          navigate('/admin');
        } else if (data.role === 'restaurant' && data.restaurantApprovalStatus === 'approved') {
          navigate('/restaurant-dashboard');
        } else {
          navigate('/');
        }
      } else {
        const data = await login(form.email, form.password);
        if (data.pendingMessage) {
          toast(data.pendingMessage, { icon: '⏳', duration: 5000 });
        } else {
          toast.success('Welcome back! 🍕');
        }
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'restaurant' && data.restaurantApprovalStatus === 'approved') navigate('/restaurant-dashboard');
        else navigate('/');
      }
    } catch (err) { toast.error(err.message); }
  };

  const handleGoogleDemo = async () => {
    try {
      await loginWithGoogle({ name: 'Google User', email: 'google@demo.com', profilePic: '', googleId: 'demo-google-id' });
      toast.success('Signed in with Google! 🎉');
      navigate('/');
    } catch (err) { toast.error(err.message); }
  };

  const handleContinueToForm = () => {
    setStep('form');
  };

  return (
    <main className="min-h-screen flex">
      {/* Left - Image */}
      <div className="hidden lg:flex w-1/2 bg-dark relative overflow-hidden items-center justify-center">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50" />
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold font-display">B</span>
          </div>
          <h2 className="text-4xl font-bold text-white font-display mb-4">Delicious food,<br />delivered to you</h2>
          <p className="text-white/60">Join thousands of food lovers ordering from top restaurants every day.</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center"><span className="text-white font-bold text-lg font-display">B</span></div>
            <span className="text-xl font-bold font-display">Bite<span className="text-brand">Dash</span></span>
          </Link>

          <AnimatePresence mode="wait">
            {/* ── ROLE SELECTION STEP ── */}
            {isReg && step === 'role' ? (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-bold font-display mb-1">Choose Account Type</h1>
                <p className="text-muted mb-6">Select how you want to use BiteDash.</p>

                <div className="space-y-3 mb-6">
                  {accountTypes.map((type) => (
                    <button key={type.id} type="button" onClick={() => setAccountType(type.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        accountType === type.id
                          ? 'border-brand bg-brand-50 shadow-md shadow-brand/10'
                          : 'border-surface-3 hover:border-brand/30'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <span className="material-symbols-outlined text-white text-xl">{type.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{type.label}</p>
                        <p className="text-xs text-muted">{type.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        accountType === type.id ? 'border-brand' : 'border-surface-3'
                      }`}>
                        <div className={`w-2.5 h-2.5 rounded-full bg-brand transition-transform ${
                          accountType === type.id ? 'scale-100' : 'scale-0'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>

                {accountType === 'admin' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">info</span>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Admin Verification Required</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Admin access is only granted if your email matches <strong>skjalaluddin772@gmail.com</strong>. 
                          Other emails will be sent as a request for super admin approval.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {accountType === 'restaurant' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">info</span>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Approval Required</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Restaurant accounts require admin approval. You'll be notified once your account is approved.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button onClick={handleContinueToForm}
                  className="w-full py-3.5 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-[0.98] transition-all">
                  Continue as {accountTypes.find(t => t.id === accountType)?.label}
                </button>

                <p className="text-center mt-4 text-sm text-muted">
                  Already have an account?{' '}
                  <button onClick={() => { setIsReg(false); setStep('form'); clearError(); }} className="text-brand font-bold hover:underline">Sign In</button>
                </p>
              </motion.div>
            ) : (
              /* ── FORM STEP ── */
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-3xl font-bold font-display mb-1">{isReg ? 'Create Account' : 'Welcome Back'}</h1>
                <p className="text-muted mb-6">
                  {isReg ? (
                    <span>
                      Registering as <button onClick={() => setStep('role')} className="text-brand font-semibold hover:underline capitalize">{accountType}</button>
                      {' · '}<button onClick={() => setStep('role')} className="text-brand/60 hover:text-brand text-xs">Change</button>
                    </span>
                  ) : 'Sign in to continue your food journey.'}
                </p>

                {/* Google Login */}
                {!isReg && (
                  <>
                    <button onClick={handleGoogleDemo}
                      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white rounded-xl border border-surface-3 hover:bg-surface-2 transition-colors mb-6 font-medium text-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Continue with Google
                    </button>
                    <div className="flex items-center gap-4 mb-6"><div className="h-px flex-1 bg-surface-3" /><span className="text-xs text-muted uppercase tracking-widest font-medium">or</span><div className="h-px flex-1 bg-surface-3" /></div>
                  </>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isReg && (
                    <div><label className="text-sm font-semibold text-dark-3 mb-1.5 block ml-1">Full Name</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" type="text"
                        className="w-full px-4 py-3.5 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required /></div>
                  )}
                  <div><label className="text-sm font-semibold text-dark-3 mb-1.5 block ml-1">Email</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@example.com" type="email"
                      className="w-full px-4 py-3.5 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required /></div>
                  <div><div className="flex justify-between items-center mb-1.5 px-1"><label className="text-sm font-semibold text-dark-3">Password</label>
                    {!isReg && <a href="#" className="text-xs text-brand font-medium">Forgot?</a>}</div>
                    <div className="relative"><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                      type={showPw ? 'text' : 'password'} className="w-full px-4 py-3.5 bg-surface-2 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-sm" required minLength={6} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                        <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span></button></div></div>
                  {error && <p className="text-error text-sm text-center">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark active:scale-[0.98] transition-all disabled:opacity-50">
                    {loading ? 'Please wait…' : isReg ? 'Create Account' : 'Sign In'}</button>
                </form>

                <p className="text-center mt-6 text-sm text-muted">
                  {isReg ? 'Already have an account?' : 'New to BiteDash?'}{' '}
                  <button onClick={() => { 
                    if (!isReg) { setIsReg(true); setStep('role'); }
                    else { setIsReg(false); setStep('form'); }
                    clearError(); 
                  }} className="text-brand font-bold hover:underline">{isReg ? 'Sign In' : 'Create Account'}</button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
