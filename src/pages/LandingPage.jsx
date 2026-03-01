import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useBranding } from '../context/BrandingContext';
import { IMAGES } from '../config/images';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import StarRating from '../components/ui/StarRating';

// Background slideshow images for hero section
const heroBackgroundImages = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80',
  'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1920&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
  'https://images.unsplash.com/photo-1598257006458-087169a1f08d?w=1920&q=80'
];

const stats = [
  { value: '10K+', label: 'Happy Patients' },
  { value: '500+', label: 'Expert Therapists' },
  { value: '50K+', label: 'Sessions Completed' }
];

const steps = [
  { num: 1, title: 'Search', desc: 'Find verified physiotherapists near you', icon: '🔍' },
  { num: 2, title: 'Book', desc: 'Schedule appointments that fit your schedule', icon: '📅' },
  { num: 3, title: 'Recover', desc: 'Get personalized treatment and heal faster', icon: '💪' }
];

const testimonials = [
  { name: 'Rahul S.', photo: IMAGES.patient1, rating: 5, text: 'Found an amazing therapist who helped me recover from my sports injury in weeks!' },
  { name: 'Anita D.', photo: IMAGES.patient2, rating: 5, text: 'The booking process is so simple. My therapist comes to my home which is very convenient.' },
  { name: 'Vikram M.', photo: IMAGES.patient3, rating: 5, text: 'Professional service and excellent results. Highly recommend PhysioConnect!' },
  { name: 'Priya K.', photo: IMAGES.patient4, rating: 5, text: 'Best platform to find qualified physiotherapists. Great experience overall.' }
];

const therapists = [
  { name: 'Dr. Sarah Mitchell', specialty: 'Sports Rehabilitation', rating: 4.8, price: 1500, photo: IMAGES.doctor1, verified: true },
  { name: 'Dr. Arjun Patel', specialty: 'Orthopedic', rating: 4.9, price: 2000, photo: IMAGES.doctor3, verified: true },
  { name: 'Dr. Priya Reddy', specialty: 'Neurological', rating: 4.6, price: 1200, photo: IMAGES.doctor2, verified: false }
];

// Background Slideshow Component
function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBackgroundImages.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroBackgroundImages.map((image, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.1
          }}
          transition={{ 
            opacity: { duration: 1.5, ease: "easeInOut" },
            scale: { duration: 8, ease: "easeOut" }
          }}
        >
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      ))}
      {/* Elegant overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40 dark:from-zinc-950/95 dark:via-zinc-950/85 dark:to-zinc-950/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-zinc-950/50" />
      
      {/* Slide indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-10">
        {heroBackgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-primary-500' 
                : 'bg-slate-400/50 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { branding } = useBranding();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-zinc-950">
      {/* Navbar */}
      <nav className="h-16 px-6 lg:px-12 flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-zinc-800 fixed top-0 left-0 right-0 z-50">
        <Link to="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">
          {branding.companyName}
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-slate-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How It Works</a>
          <a href="#testimonials" className="text-slate-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a>
          <a href="#pricing" className="text-slate-600 dark:text-zinc-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link to="/register"><Button size="sm">Get Started</Button></Link>
        </div>
      </nav>

      {/* Hero Section with Background Slideshow */}
      <section className="relative min-h-screen flex items-center pt-16">
        <BackgroundSlideshow />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-[1.618fr_1fr] gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }} 
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-2 bg-primary-100/90 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium backdrop-blur-sm"
                >
                  #1 Physiotherapy Marketplace
                </motion.span>
                <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Find Your Perfect <span className="text-primary-600 dark:text-primary-400">Physiotherapist</span>
                </h1>
                <p className="text-xl text-slate-700 dark:text-zinc-200 max-w-lg">
                  Connect with verified physiotherapists for personalized treatment at your home, clinic, or online. Start your recovery journey today.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/register"><Button size="lg">Find a Therapist</Button></Link>
                <Link to="/register?role=therapist"><Button variant="ghost" size="lg">Join as Therapist</Button></Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[IMAGES.patient1, IMAGES.patient2, IMAGES.patient3].map((img, i) => (
                    <img key={i} src={img} alt="Patient" className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 object-cover shadow-md" />
                  ))}
                </div>
                <div className="backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-1">
                    <StarRating rating={5} size="sm" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">4.9</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-300">10,000+ happy patients</p>
                </div>
              </div>
            </motion.div>
            
            {/* Floating Stats Cards - visible on larger screens */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }} 
              className="relative hidden lg:flex flex-col gap-6 items-end"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
                className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-lime-100 dark:bg-lime-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">500+</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Verified Experts</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }}
                className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-xs mr-12"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">24/7</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Available Support</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.8 }}
                className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/50 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">98%</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Patient Satisfaction</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-primary-600 dark:bg-primary-800 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-primary-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 bg-cream-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-zinc-300">Three simple steps to start your recovery</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
                <div className="w-28 h-28 lg:w-32 lg:h-32 mx-auto mb-6 rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center relative">
                  <span className="text-5xl">{step.icon}</span>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-sm font-bold text-zinc-900">{step.num}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-zinc-400">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 -right-6 w-12">
                    <svg className="w-full h-6 text-slate-300 dark:text-zinc-700" fill="none" viewBox="0 0 48 24">
                      <path d="M0 12h40M40 12l-8-8M40 12l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 px-6 lg:px-12 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">What Our Patients Say</h2>
            <p className="text-lg text-slate-600 dark:text-zinc-300">Join thousands of satisfied patients</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 bg-cream-50 dark:bg-zinc-800 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={t.photo} alt={t.name} size="md" ring />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-100">{t.name}</p>
                    <StarRating rating={t.rating} size="sm" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 text-sm">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Therapists */}
      <section className="py-20 px-6 lg:px-12 bg-cream-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">Top Physiotherapists</h2>
            <p className="text-lg text-slate-600 dark:text-zinc-300">Verified experts ready to help you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {therapists.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
                <Avatar src={t.photo} alt={t.name} size="xl" verified={t.verified} ring className="mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{t.name}</h3>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm mt-2">{t.specialty}</span>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <StarRating rating={t.rating} size="sm" />
                  <span className="text-sm text-slate-600 dark:text-zinc-400">{t.rating}</span>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-zinc-100 mt-3">Rs {t.price}<span className="text-sm font-normal text-slate-500">/care session</span></p>
                <Link to="/register"><Button variant="secondary" size="sm" className="mt-4 w-full">Book Now</Button></Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-16 px-6 lg:px-12 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Your Recovery?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of patients who found relief with PhysioConnect</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"><Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">Get Started Free</Button></Link>
            <Link to="/register?role=therapist"><Button variant="ghost" size="lg" className="border-white text-white hover:bg-white/10">Join as Therapist</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-slate-900 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <p className="text-xl font-bold text-white">{branding.companyName}</p>
              <p className="text-slate-400 mt-2 max-w-md">{branding.tagline}</p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Patients</h4>
              <div className="space-y-2">
                <Link to="/terms/customer" className="block text-slate-400 hover:text-white transition-colors">Terms & Conditions</Link>
                <Link to="/register" className="block text-slate-400 hover:text-white transition-colors">Sign Up</Link>
                <a href="#how-it-works" className="block text-slate-400 hover:text-white transition-colors">How It Works</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">FAQs</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Therapists</h4>
              <div className="space-y-2">
                <Link to="/terms/therapist" className="block text-slate-400 hover:text-white transition-colors">Terms & Conditions</Link>
                <Link to="/register?role=therapist" className="block text-slate-400 hover:text-white transition-colors">Join as Therapist</Link>
                <a href="#pricing" className="block text-slate-400 hover:text-white transition-colors">Pricing Plans</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} {branding.companyName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/terms/customer" className="text-slate-400 hover:text-white transition-colors">Patient Terms</Link>
              <Link to="/terms/therapist" className="text-slate-400 hover:text-white transition-colors">Therapist Terms</Link>
              <a href="mailto:support@physioconnect.com" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
