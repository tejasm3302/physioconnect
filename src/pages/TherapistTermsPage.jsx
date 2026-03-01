import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import localDB from '../utils/localDB';
import { formatCurrency } from '../utils/currency';

export default function TherapistTermsPage() {
  const { theme, toggleTheme } = useTheme();
  const [plans, setPlans] = useState([]);

  // Fetch dynamic pricing from localStorage
  useEffect(() => {
    const storedPlans = localDB.getSubscriptionPlans();
    if (storedPlans && storedPlans.length > 0) {
      setPlans(storedPlans);
    }
  }, []);

  // Filter active plans and sort by tier
  const activePlans = plans.filter(p => p.active !== false).sort((a, b) => (a.tier || 0) - (b.tier || 0));
  
  // Find monthly plan for savings calculation
  const monthlyPlan = plans.find(p => p.tier === 1 || p.id === 'monthly') || { price: 599, duration: 30 };

  // Calculate savings compared to monthly
  const calculateSavings = (plan) => {
    if (!monthlyPlan || plan.id === monthlyPlan.id || plan.duration === monthlyPlan.duration) return 0;
    const monthlyPerDay = monthlyPlan.price / monthlyPlan.duration;
    const planPerDay = plan.price / plan.duration;
    return Math.round((1 - planPerDay / monthlyPerDay) * 100);
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-teal-600 dark:text-teal-400">
            PhysioConnect
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
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
            <Link to="/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
              Back to Register
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Therapist Terms of Service
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Welcome */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">1</span>
                Welcome to PhysioConnect
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>PhysioConnect is a managed-care marketplace that connects verified physiotherapists with patients seeking continuity of care. By registering as a therapist, you agree to these terms.</p>
              </div>
            </section>

            {/* Registration */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">2</span>
                Account Registration
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>When registering as a therapist, you must provide:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Full Name:</strong> Your legal name as it appears on your credentials</li>
                  <li><strong>Email Address:</strong> A valid email for account access</li>
                  <li><strong>Phone Number:</strong> For patient communication</li>
                  <li><strong>Password:</strong> A secure password for your account</li>
                  <li><strong>Profile Photo:</strong> A professional photo (optional but recommended)</li>
                  <li><strong>Degree Certificate:</strong> Upload your physiotherapy degree/certification for verification</li>
                </ul>
                <p className="text-amber-600 dark:text-amber-400 font-medium mt-4">You can also sign up using Google or Apple login for convenience.</p>
              </div>
            </section>

            {/* Verification */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">3</span>
                Verification Process
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>After registration, your account will be in <strong>"Pending Verification"</strong> status</li>
                  <li>Our admin team will review your uploaded degree certificate</li>
                  <li>Upon successful verification, you will receive a <strong>verified badge</strong> on your profile</li>
                  <li>Only verified therapists with active subscriptions are visible to patients</li>
                  <li>You can check your verification status on your dashboard</li>
                </ul>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-400 font-medium">Important: Uploading fraudulent or fake credentials will result in immediate account termination.</p>
                </div>
              </div>
            </section>

            {/* Profile Setup */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">4</span>
                Profile Setup
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>Complete your profile to attract more patients:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Specialization:</strong> Select your area of expertise (Sports Rehab, Orthopedic, Neurological, Pediatric, Geriatric, etc.)</li>
                  <li><strong>Experience:</strong> Years of professional experience</li>
                  <li><strong>Hourly Rate:</strong> Set your consultation fee (in ₹)</li>
                  <li><strong>Bio:</strong> Write about your qualifications, approach, and expertise</li>
                  <li><strong>Availability:</strong> Set your available days and time slots</li>
                </ul>
              </div>
            </section>

            {/* Subscription Plans - FULLY DYNAMIC */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">5</span>
                Subscription Plans
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>To be listed on the platform and receive patient bookings, you need an active subscription:</p>
                
                <div className="mt-4 grid gap-4">
                  {/* Free Trial */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <h4 className="font-bold text-slate-800 dark:text-white">Free Trial</h4>
                    <p className="text-slate-600 dark:text-zinc-400">14 days free trial for new therapists to explore the platform</p>
                  </div>
                  
                  {/* Dynamic Plans - All Active Plans */}
                  {activePlans.map((plan) => {
                    const savings = calculateSavings(plan);
                    
                    // Determine card styling based on badges
                    let cardClass = 'p-4 rounded-xl relative overflow-hidden ';
                    let titleClass = 'font-bold text-lg ';
                    
                    if (plan.popular) {
                      cardClass += 'bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-300 dark:border-teal-700';
                      titleClass += 'text-teal-700 dark:text-teal-400';
                    } else if (plan.bestValue) {
                      cardClass += 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700';
                      titleClass += 'text-amber-700 dark:text-amber-400';
                    } else if (plan.offerTag) {
                      cardClass += 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700';
                      titleClass += 'text-purple-700 dark:text-purple-400';
                    } else {
                      cardClass += 'bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700';
                      titleClass += 'text-slate-800 dark:text-white';
                    }
                    
                    return (
                      <div key={plan.id} className={cardClass}>
                        {/* Badges - Enhanced with solid background */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {plan.popular && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg border-2 border-white dark:border-zinc-700">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Popular
                            </span>
                          )}
                          {plan.bestValue && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-lime-500 to-green-600 text-white shadow-lg border-2 border-white dark:border-zinc-700">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Best Value
                            </span>
                          )}
                          {plan.offerTag && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border-2 border-white dark:border-zinc-700 animate-pulse">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                              </svg>
                              {plan.offerTag}
                            </span>
                          )}
                        </div>
                        
                        <h4 className={titleClass}>
                          {plan.name} - {' '}
                          {plan.originalPrice && (
                            <span className="line-through text-slate-400 dark:text-zinc-500 mr-1 text-base">
                              {formatCurrency(plan.originalPrice)}
                            </span>
                          )}
                          {formatCurrency(plan.price)}
                        </h4>
                        <p className="text-slate-600 dark:text-zinc-400 mt-1">
                          {plan.duration} days of platform access
                          {savings > 0 && (
                            <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                              - Save {savings}%
                            </span>
                          )}
                        </p>
                        {plan.originalPrice && (
                          <p className="text-green-600 dark:text-green-400 text-sm mt-1 font-medium">
                            You save {formatCurrency(plan.originalPrice - plan.price)}!
                          </p>
                        )}
                        {plan.features && plan.features.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-slate-600 dark:text-zinc-400">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                  
                  {activePlans.length === 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl text-center border border-slate-200 dark:border-zinc-700">
                      <p className="text-slate-500 dark:text-zinc-400">No active plans available. Please check back later.</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-400 text-sm">
                    <strong>Note:</strong> Prices and plans shown above are dynamically fetched from the platform. The administrator may add special offers, festival discounts, or update pricing at any time. Always check the subscription page for the most current pricing before subscribing.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">6</span>
                Subscription Payment
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>Payment methods available:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>UPI:</strong> Google Pay, PhonePe, Paytm, or any UPI ID</li>
                  <li><strong>Credit/Debit Card:</strong> Visa, Mastercard, RuPay</li>
                  <li><strong>Net Banking:</strong> All major Indian banks supported</li>
                </ul>
                <p className="mt-4">After successful payment:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your subscription activates immediately</li>
                  <li>You can download a payment receipt</li>
                  <li>View all payment history in your dashboard</li>
                </ul>
              </div>
            </section>

            {/* Profile Visibility */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">7</span>
                Profile Visibility
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>Your profile is visible to patients only when:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Your account is <strong>verified</strong> by admin</li>
                  <li>You have an <strong>active subscription</strong> (including trial period)</li>
                </ul>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-700 dark:text-amber-400">When your subscription expires, your profile will be hidden from patients until you renew.</p>
                </div>
              </div>
            </section>

            {/* Appointments */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">8</span>
                Managing Appointments
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p><strong>Appointment Requests:</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Patients can book appointments based on your availability</li>
                  <li>New bookings appear as "Pending" in your dashboard</li>
                  <li>You can <strong>Accept</strong> or <strong>Decline</strong> each request</li>
                  <li>Respond to requests promptly to maintain good standing</li>
                </ul>
                
                <p className="mt-4"><strong>Session Types:</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>In-Person:</strong> Patient visits your clinic</li>
                  <li><strong>Video Consultation:</strong> Online session</li>
                  <li><strong>Home Visit:</strong> You visit the patient's location</li>
                </ul>
                
                <p className="mt-4"><strong>After Session:</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Mark sessions as "Completed" when done to activate/continue managed care relationships</li>
                  <li>Patients can then leave reviews and continue follow-up care in-platform</li>
                </ul>
              </div>
            </section>

            {/* Platform Fee */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">9</span>
                Platform Fee
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    A platform fee is charged to customers on each booking
                  </p>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The platform fee is added to your hourly rate and paid by the customer</li>
                  <li>You receive your full hourly rate - the platform fee is separate</li>
                  <li>Fee percentage is set by the platform administrator</li>
                  <li>Example: Your rate ₹1,500 + Platform fee 10% = Customer pays ₹1,650, you receive ₹1,500</li>
                  <li>Your dashboard shows your net earnings (what you receive)</li>
                </ul>
              </div>
            </section>

            {/* Cancellation Fee Income */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">10</span>
                Cancellation Fee Income
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    When customers cancel late, you may receive a portion of the cancellation fee
                  </p>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>If a customer cancels within the free cancellation window, no fee is charged</li>
                  <li>If a customer cancels late (within X hours of appointment), a cancellation fee applies</li>
                  <li>The cancellation fee is split between you and the platform (percentage set by admin)</li>
                  <li>Your share of cancellation fees is shown in your Earnings dashboard</li>
                  <li>Example: 20% cancellation fee on ₹1,650 booking = ₹330 total fee. If split is 60/40, you receive ₹132</li>
                </ul>
              </div>
            </section>

            {/* Earnings */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">11</span>
                Earnings & Analytics
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Track your earnings from completed care sessions</li>
                  <li>View earnings by day, week, or month</li>
                  <li>See total sessions completed</li>
                  <li>Monitor your average rating</li>
                  <li>Earnings are calculated based on your hourly rate � care session duration</li>
                  <li>Your Earnings page shows: Gross earnings, Cancellation income, and Net total</li>
                </ul>
              </div>
            </section>

            {/* Professional Conduct */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">12</span>
                Professional Conduct
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>As a therapist on PhysioConnect, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide accurate information about your qualifications</li>
                  <li>Maintain professional behavior with all patients</li>
                  <li>Respond to appointment requests in a timely manner</li>
                  <li>Deliver quality care during sessions</li>
                  <li>Respect patient privacy and confidentiality</li>
                  <li>Not share patient information with third parties</li>
                </ul>
              </div>
            </section>

            {/* Data Storage */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">13</span>
                Data Storage
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>All data is stored locally in your browser's localStorage</li>
                  <li>Profile photos and certificates are stored as base64 encoded images</li>
                  <li>Clearing browser data will remove your account information</li>
                  <li>Data is not synced across different browsers or devices</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">14</span>
                Contact & Support
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>For any questions or concerns, please contact us:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Email: support@physioconnect.com</li>
                  <li>Phone: +91 98765 43210</li>
                </ul>
              </div>
            </section>
          </div>

          {/* Accept Button */}
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-semibold rounded-xl transition-all text-center"
            >
              I Understand - Continue to Register
            </Link>
            <Link
              to="/"
              className="px-8 py-3 border-2 border-slate-300 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} PhysioConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

