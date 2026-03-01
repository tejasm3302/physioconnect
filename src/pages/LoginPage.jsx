import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import localDB from '../utils/localDB';
import { v4 as uuidv4 } from 'uuid';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    title: 'Welcome Back',
    subtitle: 'Continue your journey to better health'
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    title: 'Expert Care Awaits',
    subtitle: 'Connect with verified physiotherapists'
  },
  {
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
    title: 'Your Health Matters',
    subtitle: 'Professional care at your fingertips'
  },
  {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    title: 'Recovery Starts Here',
    subtitle: 'Continue your managed care plan today'
  }
];

const firstNames = ['Arun', 'Priya', 'Vikram', 'Sneha', 'Rahul', 'Anita', 'Kiran', 'Meera', 'Arjun', 'Divya'];
const lastNames = ['Sharma', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Gupta', 'Nair', 'Verma', 'Joshi', 'Mehta'];

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate(`/${result.user.role}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    
    // Simulate OAuth delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo: Check if there's an existing account or create a new one
    const users = localDB.getUsers() || [];
    const existingSocialUser = users.find(u => u.socialProvider === provider);
    
    if (existingSocialUser) {
      // Login with existing social account
      setSocialLoading(null);
      toast.success(`Welcome back, ${existingSocialUser.fullName}!`);
      
      // Set user in auth context by using login with stored password
      const result = login(existingSocialUser.email, atob(existingSocialUser.password));
      if (result.success) {
        navigate(`/${existingSocialUser.role}`);
      }
    } else {
      // Create new customer account for demo
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomFullName = `${randomFirstName} ${randomLastName}`;
      const randomEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${provider.toLowerCase()}.com`;
      const randomPhone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const randomPassword = uuidv4().slice(0, 12);
      
      const avatarImages = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'
      ];
      const randomAvatar = avatarImages[Math.floor(Math.random() * avatarImages.length)];
      
      const newUser = {
        id: uuidv4(),
        role: 'customer',
        email: randomEmail,
        password: btoa(randomPassword),
        fullName: randomFullName,
        phone: randomPhone,
        profilePhoto: randomAvatar,
        address: '',
        currency: 'INR',
        socialProvider: provider,
        healthProfile: {
          conditions: '',
          medications: '',
          allergies: '',
          emergencyContact: ''
        },
        profileCompleted: false,
        createdAt: new Date().toISOString()
      };
      
      // Add user to localStorage properly
      const allUsers = localDB.getUsers() || [];
      allUsers.push(newUser);
      localDB.setUsers(allUsers);
      
      setSocialLoading(null);
      toast.success(`Welcome to PhysioConnect, ${randomFullName}! Signed in with ${provider}`);
      
      // Auto login the new user
      const result = login(randomEmail, randomPassword);
      if (result.success) {
        navigate('/customer');
      }
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@physioconnect.com');
      setPassword('admin123');
    } else if (type === 'therapist') {
      setEmail('sarah@physio.com');
      setPassword('physio123');
    } else {
      setEmail('rahul@email.com');
      setPassword('patient123');
    }
  };

  return (
    <div className="min-h-screen flex bg-orange-50 dark:bg-zinc-950">
      {/* Left Side - Image Slideshow */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600/90 via-teal-700/85 to-teal-900/95" />
          </motion.div>
        </AnimatePresence>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link to="/" className="text-2xl font-bold">PhysioConnect</Link>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <h2 className="text-4xl font-bold">{slides[currentSlide].title}</h2>
              <p className="text-xl text-white/80">{slides[currentSlide].subtitle}</p>
            </motion.div>
          </AnimatePresence>
          
          {/* Slide Indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-2 border-white/20" />
        <div className="absolute bottom-40 right-40 w-20 h-20 rounded-xl border-2 border-white/10 rotate-12" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Theme Toggle */}
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

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              PhysioConnect
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Sign in to continue to PhysioConnect
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all font-medium text-slate-700 dark:text-zinc-200 disabled:opacity-50"
            >
              {socialLoading === 'Google' ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
            
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-medium disabled:opacity-50"
            >
              {socialLoading === 'Apple' ? (
                <div className="w-5 h-5 border-2 border-gray-500 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              Continue with Apple
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-orange-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-500">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-5 bg-white dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">
              Demo Accounts:
            </p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemo('admin')}
                className="w-full text-left px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors text-slate-600 dark:text-zinc-400"
              >
                <span className="font-medium text-slate-800 dark:text-zinc-200">Admin:</span> admin@physioconnect.com / admin123
              </button>
              <button
                onClick={() => fillDemo('therapist')}
                className="w-full text-left px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors text-slate-600 dark:text-zinc-400"
              >
                <span className="font-medium text-slate-800 dark:text-zinc-200">Therapist:</span> sarah@physio.com / physio123
              </button>
              <button
                onClick={() => fillDemo('patient')}
                className="w-full text-left px-4 py-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors text-slate-600 dark:text-zinc-400"
              >
                <span className="font-medium text-slate-800 dark:text-zinc-200">Patient:</span> rahul@email.com / patient123
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-slate-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          
          {/* Terms Links */}
          <div className="mt-4 text-center text-sm text-slate-500 dark:text-zinc-500">
            By signing in, you agree to our{' '}
            <button
              type="button"
              onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/terms/customer`, '_blank')}
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              Patient Terms
            </button>
            {' '}or{' '}
            <button
              type="button"
              onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/terms/therapist`, '_blank')}
              className="text-teal-600 dark:text-teal-400 hover:underline"
            >
              Therapist Terms
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

