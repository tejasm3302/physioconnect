import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import localDB from '../../utils/localDB';
import { formatCurrency } from '../../utils/currency';

export default function TherapistTermsPage() {
  const [plans, setPlans] = useState([]);
  const [branding, setBranding] = useState({});

  useEffect(() => {
    // Fetch dynamic plans from localStorage
    const storedPlans = localDB.getSubscriptionPlans() || [];
    const activePlans = storedPlans.filter(p => p.active !== false);
    setPlans(activePlans);

    // Fetch branding
    const storedBranding = localDB.getBranding() || {};
    setBranding(storedBranding);
  }, []);

  // Calculate savings percentage
  const calculateSavings = (plan) => {
    const monthlyPlan = plans.find(p => p.duration === 30 || p.name.toLowerCase().includes('monthly'));
    if (!monthlyPlan || plan.id === monthlyPlan.id) return null;
    
    const monthlyPerDay = monthlyPlan.price / monthlyPlan.duration;
    const planPerDay = plan.price / plan.duration;
    const savingsPercent = Math.round((1 - planPerDay / monthlyPerDay) * 100);
    
    return savingsPercent > 0 ? savingsPercent : null;
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-primary-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{branding.companyName || 'PhysioConnect'}</h1>
          <h2 className="text-xl md:text-2xl mt-2 text-white/90">Therapist Terms of Service</h2>
          <p className="text-white/70 mt-2">Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">Welcome to {branding.companyName || 'PhysioConnect'}</h3>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
              These Terms of Service govern your use of {branding.companyName || 'PhysioConnect'} as a registered physiotherapist delivering managed continuity care. 
              By creating an account and using our platform, you agree to these terms. Please read them carefully.
            </p>
          </section>

          {/* Registration & Verification */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">1. Registration & Verification</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>1.1 Account Creation:</strong> You can register using your email and password, or through Google/Apple sign-in.</p>
              <p><strong>1.2 Required Information:</strong> You must provide accurate professional information including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full legal name as per professional registration</li>
                <li>Valid email address and phone number</li>
                <li>Professional qualifications and specialization</li>
                <li>Years of experience</li>
                <li>Hourly consultation rate</li>
              </ul>
              <p><strong>1.3 Degree Certificate:</strong> You must upload a valid degree certificate or professional license for verification. Accepted formats: JPEG, PNG, PDF.</p>
              <p><strong>1.4 Verification Process:</strong> Our admin team will review your credentials within 2-3 business days. You will be notified via email once verified.</p>
              <p><strong>1.5 Profile Photo:</strong> You may optionally upload a professional profile photo. Photos should be professional and clearly show your face.</p>
            </div>
          </section>

          {/* Subscription Plans */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">2. Subscription Plans</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>2.1 Free Trial:</strong> New therapists receive a 14-day free trial upon registration. During the trial, your profile will be visible to patients.</p>
              <p><strong>2.2 Available Plans:</strong></p>
              
              {plans.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 dark:bg-zinc-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-zinc-300">Plan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-zinc-300">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-zinc-300">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-zinc-300">Savings</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-zinc-300">Special</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                      {plans.map((plan) => {
                        const savings = calculateSavings(plan);
                        return (
                          <tr key={plan.id} className={plan.popular ? 'bg-primary-50 dark:bg-primary-900/20' : ''}>
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-zinc-100">
                              {plan.name}
                              {plan.popular && <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Popular</span>}
                              {plan.bestValue && <span className="ml-2 text-xs bg-lime-500 text-white px-2 py-0.5 rounded-full">Best Value</span>}
                            </td>
                            <td className="px-4 py-3 text-slate-800 dark:text-zinc-100">
                              {plan.originalPrice && (
                                <span className="text-sm text-slate-400 line-through mr-2">{formatCurrency(plan.originalPrice)}</span>
                              )}
                              {formatCurrency(plan.price)}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-zinc-400">{plan.duration} days</td>
                            <td className="px-4 py-3 text-lime-600 dark:text-lime-400">
                              {savings ? `Save ${savings}%` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {plan.offerTag && (
                                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
                                  {plan.offerTag}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic">Loading plans...</p>
              )}

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    <strong>Note:</strong> Prices and plans are dynamically managed by the platform administrator and may be updated. 
                    Special promotional offers may be available during festivals and events. Always check the subscription page for current pricing.
                  </span>
                </p>
              </div>

              <p><strong>2.3 Payment Methods:</strong> We accept UPI, Credit/Debit Cards, and Net Banking through our secure payment gateway.</p>
              <p><strong>2.4 Auto-Renewal:</strong> Subscriptions do not auto-renew. You will receive expiry reminders 14 days before your subscription ends.</p>
              <p><strong>2.5 Refund Policy:</strong> Subscription fees are non-refundable once activated. Please choose your plan carefully.</p>
            </div>
          </section>

          {/* Profile Visibility */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">3. Profile Visibility</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>3.1 Visibility Requirements:</strong> Your profile will be visible to patients only when:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your account is verified by our admin team</li>
                <li>You have an active subscription (including free trial)</li>
              </ul>
              <p><strong>3.2 Hidden Profile:</strong> If your subscription expires or your account is not verified, your profile will be hidden from patients but your data will be preserved.</p>
              <p><strong>3.3 Profile Information:</strong> You can update your profile information at any time including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Specialization and bio</li>
                <li>Hourly rate</li>
                <li>Availability schedule</li>
                <li>Profile photo</li>
              </ul>
            </div>
          </section>

          {/* Appointment Management */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">4. Appointment Management</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>4.1 Booking Requests:</strong> When a patient books an appointment, you will receive a notification. You can accept or decline the request.</p>
              <p><strong>4.2 Visit Types:</strong> You may offer the following visit types:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>In-Person: Patient visits your clinic</li>
                <li>Video Call: Virtual consultation</li>
                <li>Home Visit: You visit the patient's location</li>
              </ul>
              <p><strong>4.3 Cancellation:</strong> You may cancel appointments with valid reason. Frequent cancellations may affect your ratings.</p>
              <p><strong>4.4 Completion:</strong> Mark appointments as completed after each care session. This activates managed relationships and ongoing care continuity within PhysioConnect.</p>
            </div>
          </section>

          {/* Earnings */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">5. Earnings & Payments</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>5.1 Setting Rates:</strong> You set your own hourly rate. This rate is visible to patients when they book.</p>
              <p><strong>5.2 Payment Collection:</strong> Currently, payments are collected directly between you and the patient. PhysioConnect does not process consultation payments.</p>
              <p><strong>5.3 Earnings Tracking:</strong> You can track your earnings and booking history in your dashboard.</p>
            </div>
          </section>

          {/* Professional Conduct */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">6. Professional Conduct</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>6.1 Standards:</strong> You must maintain professional standards at all times:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate information about your qualifications</li>
                <li>Treat all patients with respect and professionalism</li>
                <li>Maintain patient confidentiality</li>
                <li>Follow medical ethics and guidelines</li>
              </ul>
              <p><strong>6.2 Reviews & Continuity:</strong> Patients can rate and review your services. Maintain quality care plans to improve retention and reputation.</p>
              <p><strong>6.3 Violations:</strong> Violations of professional conduct may result in account suspension or termination.</p>
            </div>
          </section>

          {/* Data & Privacy */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">7. Data & Privacy</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p><strong>7.1 Data Storage:</strong> All data is stored locally in your browser's localStorage. No data is transmitted to external servers.</p>
              <p><strong>7.2 Data Retention:</strong> Your data remains stored until you clear your browser data or explicitly request deletion.</p>
              <p><strong>7.3 Patient Information:</strong> You can view basic patient information for booking purposes. Handle this information responsibly.</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-zinc-100 mb-4">8. Contact Us</h3>
            <div className="space-y-3 text-slate-600 dark:text-zinc-400">
              <p>If you have questions about these terms, please contact us:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: {branding.contactEmail || 'support@physioconnect.com'}</li>
                <li>Phone: {branding.contactPhone || '+91 98765 43210'}</li>
              </ul>
            </div>
          </section>

          {/* Agreement */}
          <section className="pt-6 border-t border-slate-200 dark:border-zinc-700">
            <p className="text-slate-600 dark:text-zinc-400 text-center">
              By registering as a therapist on {branding.companyName || 'PhysioConnect'}, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

