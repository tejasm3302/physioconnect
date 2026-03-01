import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ImageUpload from '../components/ui/ImageUpload';
import { v4 as uuidv4 } from 'uuid';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    title: 'Join Our Network',
    subtitle: 'Connect with top physiotherapists or grow your practice'
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    title: 'Quality Healthcare',
    subtitle: 'Access verified professionals for your recovery journey'
  },
  {
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80',
    title: 'Flexible Sessions',
    subtitle: 'In-person, video calls, or home visits - built for continuity care'
  },
  {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    title: 'Start Today',
    subtitle: 'Begin your path to better health and wellness'
  }
];

const firstNames = ['Arun', 'Priya', 'Vikram', 'Sneha', 'Rahul', 'Anita', 'Kiran', 'Meera', 'Arjun', 'Divya'];
const lastNames = ['Sharma', 'Patel', 'Reddy', 'Kumar', 'Singh', 'Gupta', 'Nair', 'Verma', 'Joshi', 'Mehta'];

export default function RegisterPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    degreePhoto: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  
  const { register, user } = useAuth();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const userData = {
      role,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      profilePhoto: formData.profilePhoto || ''
    };
    
    if (role === 'therapist') {
      userData.degreePhoto = formData.degreePhoto || '';
      userData.specialization = 'General Physiotherapy';
      userData.experience = 0;
      userData.hourlyRate = 1000;
      userData.bio = '';
      userData.availability = [];
      userData.rating = 0;
      userData.totalReviews = 0;
    } else {
      userData.healthProfile = {
        conditions: '',
        medications: '',
        allergies: '',
        emergencyContact: ''
      };
      userData.profileCompleted = false;
    }
    
    setTimeout(() => {
      const result = register(userData);
      setLoading(false);
      
      if (result.success) {
        toast.success(`Welcome to PhysioConnect, ${formData.fullName}!`);
        navigate(`/${role}`);
      } else {
        toast.error(result.error);
      }
    }, 500);
  };

  const handleSocialLogin = async (provider) => {
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service first');
      return;
    }
    
    setSocialLoading(provider);
    
    // Simulate OAuth delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random user data for demo
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomFullName = `${randomFirstName} ${randomLastName}`;
    const randomEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${provider.toLowerCase()}.com`;
    const randomPhone = `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    
    const avatarImages = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80'
    ];
    const randomAvatar = avatarImages[Math.floor(Math.random() * avatarImages.length)];
    
    const userData = {
      role,
      email: randomEmail,
      password: uuidv4().slice(0, 12),
      fullName: randomFullName,
      phone: randomPhone,
      profilePhoto: randomAvatar,
      socialProvider: provider
    };
    
    if (role === 'therapist') {
      userData.degreePhoto = '';
      userData.specialization = 'General Physiotherapy';
      userData.experience = 0;
      userData.hourlyRate = 1000;
      userData.bio = '';
      userData.availability = [];
      userData.rating = 0;
      userData.totalReviews = 0;
    } else {
      userData.healthProfile = {
        conditions: '',
        medications: '',
        allergies: '',
        emergencyContact: ''
      };
      userData.profileCompleted = false;
    }
    
    const result = register(userData);
    setSocialLoading(null);
    
    if (result.success) {
      toast.success(`Welcome to PhysioConnect, ${randomFullName}! Signed in with ${provider}`);
      navigate(`/${role}`);
    } else {
      toast.error(result.error);
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
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
              Create Account
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Join PhysioConnect managed care today
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                role === 'customer'
                  ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-md'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('therapist')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                role === 'therapist'
                  ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-md'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Therapist
            </button>
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
                or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            {/* Profile Photo Upload */}
            <div>
              <ImageUpload
                currentImage={formData.profilePhoto}
                onImageChange={(base64) => setFormData({ ...formData, profilePhoto: base64 })}
                label="Profile Photo (Optional)"
                size="md"
                aspectRatio="square"
              />
            </div>

            {/* Degree Certificate for Therapists */}
            {role === 'therapist' && (
              <div>
                <ImageUpload
                  currentImage={formData.degreePhoto}
                  onImageChange={(base64) => setFormData({ ...formData, degreePhoto: base64 })}
                  label="Degree Certificate (For Verification)"
                  aspectRatio="certificate"
                />
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  Upload your physiotherapy degree/certification for admin verification
                </p>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-zinc-400">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => {
                    const url = role === 'customer' ? '/terms/customer' : '/terms/therapist';
                    window.open(`${window.location.origin}${window.location.pathname}#${url}`, '_blank');
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => {
                    const url = role === 'customer' ? '/terms/customer' : '/terms/therapist';
                    window.open(`${window.location.origin}${window.location.pathname}#${url}`, '_blank');
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-slate-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

