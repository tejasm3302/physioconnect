import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import localDB from '../utils/localDB';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: verify, 3: new password
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleFindAccount = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const users = localDB.getUsers() || [];
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        setFoundUser(user);
        setStep(2);
        toast.success('Account found! Please verify your identity.');
      } else {
        toast.error('No account found with this email address.');
      }
      setLoading(false);
    }, 800);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Verify using the user's registered phone number (last 4 digits)
      const lastFour = foundUser.phone?.replace(/\D/g, '').slice(-4) || '';
      if (securityAnswer === lastFour) {
        setStep(3);
        toast.success('Identity verified! Set your new password.');
      } else {
        toast.error('Incorrect! Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = localDB.getUsers() || [];
      const updated = users.map(u => {
        if (u.id === foundUser.id) {
          return { ...u, password: btoa(newPassword) };
        }
        return u;
      });
      localDB.setUsers(updated);

      toast.success('Password reset successfully! Please sign in.');
      setLoading(false);
      navigate('/login');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Theme toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-md text-slate-600 dark:text-zinc-300"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">PhysioConnect</Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mt-4">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify Identity'}
              {step === 3 && 'Reset Password'}
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-2">
              {step === 1 && 'Enter your email to find your account'}
              {step === 2 && 'Answer the security question to verify'}
              {step === 3 && 'Create a new password for your account'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  s <= step
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                }`}>
                  {s < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 rounded-full ${
                    s < step ? 'bg-primary-600' : 'bg-slate-200 dark:bg-zinc-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Find Account */}
          {step === 1 && (
            <form onSubmit={handleFindAccount} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />
              <Button type="submit" className="w-full" loading={loading}>Find My Account</Button>
            </form>
          )}

          {/* Step 2: Verify */}
          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">Account found:</span> {foundUser?.fullName}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Enter the last 4 digits of your registered phone number to verify your identity.
                </p>
              </div>

              <Input
                label="Last 4 digits of your phone number"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="e.g. 1234"
                required
                maxLength={4}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setSecurityAnswer(''); }}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-300 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Back
                </button>
                <Button type="submit" className="flex-1" loading={loading}>Verify</Button>
              </div>

              {/* Hint for demo */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Demo hint:</span> For demo accounts, phone last 4 digits are shown in their profiles. Check seed data for phone numbers.
                </p>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Identity verified for {foundUser?.fullName}
                </p>
              </div>

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              />

              {newPassword && (
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${newPassword === confirmPassword && confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-zinc-500'}`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Passwords match
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
