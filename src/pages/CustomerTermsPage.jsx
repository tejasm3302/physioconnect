import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { localDB } from '../utils/localDB';

export default function CustomerTermsPage() {
  const { theme, toggleTheme } = useTheme();
  const [platformFeeSettings, setPlatformFeeSettings] = useState({ enabled: true, percentage: 10 });
  const [cancellationSettings, setCancellationSettings] = useState({ enabled: true, freeWindowHours: 18, feePercentage: 20 });

  useEffect(() => {
    const platformSettings = localDB.getPlatformFeeSettings();
    const cancelSettings = localDB.getCancellationSettings();
    setPlatformFeeSettings(platformSettings);
    setCancellationSettings(cancelSettings);
  }, []);

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
              Patient Terms of Service
            </h1>
            <p className="text-slate-600 dark:text-zinc-400">
              Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Welcome */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">1</span>
                Welcome to PhysioConnect
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>PhysioConnect is a platform that connects patients with verified physiotherapists. By creating an account, you agree to these terms.</p>
              </div>
            </section>

            {/* Account Registration */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">2</span>
                Account Registration
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>You must provide accurate information including your full name, email, and phone number</li>
                  <li>You can optionally upload a profile photo</li>
                  <li>You can sign up using email/password or through Google/Apple login</li>
                  <li>You are responsible for keeping your login credentials secure</li>
                  <li>You must be at least 18 years old to create an account</li>
                </ul>
              </div>
            </section>

            {/* Health Profile */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">3</span>
                Health Profile
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p>You can optionally provide health information to help therapists serve you better:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Medical conditions and health history</li>
                  <li>Current medications</li>
                  <li>Allergies</li>
                  <li>Emergency contact information</li>
                </ul>
                <p className="text-amber-600 dark:text-amber-400 font-medium">This information is stored securely in your browser's local storage and is only visible to you and the therapists you book with.</p>
              </div>
            </section>

            {/* Browsing Therapists */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">4</span>
                Browsing & Selecting Therapists
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>You can browse all verified therapists on our platform</li>
                  <li>Filter therapists by specialization (Sports Rehab, Orthopedic, Neurological, etc.)</li>
                  <li>Sort by rating, price, or experience</li>
                  <li>View therapist profiles including their qualifications, experience, hourly rates, and patient reviews</li>
                  <li>Only therapists with verified credentials and active subscriptions are visible</li>
                </ul>
              </div>
            </section>

            {/* Booking & Managed Care */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">5</span>
                Booking & Managed Care
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <p><strong>Visit Types Available:</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>In-Person Visit:</strong> Visit the therapist at their clinic</li>
                  <li><strong>Video Consultation:</strong> Online session via video call</li>
                  <li><strong>Home Visit:</strong> Therapist visits your location</li>
                </ul>
                <p className="mt-4"><strong>Booking Process:</strong></p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Select a therapist from the browse page</li>
                  <li>Choose your preferred date and available time slot</li>
                  <li>Select your care session duration (30 min, 45 min, or 60 min)</li>
                  <li>Choose visit type</li>
                  <li>Add any notes for the therapist (optional)</li>
                  <li>Confirm your booking</li>
                </ul>
                <p className="mt-4 text-amber-600 dark:text-amber-400 font-medium">After your booking is accepted, your ongoing care relationship is managed inside PhysioConnect for continuity and follow-ups.</p>
              </div>
            </section>

            {/* Booking Status */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">6</span>
                Booking Status
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Pending:</strong> Waiting for therapist to accept</li>
                  <li><strong>Confirmed:</strong> Therapist has accepted your booking</li>
                  <li><strong>Completed:</strong> Session completed and added to your managed care history</li>
                  <li><strong>Cancelled:</strong> Booking was cancelled by you or the therapist</li>
                  <li><strong>Declined:</strong> Therapist declined your booking request</li>
                </ul>
              </div>
            </section>

            {/* Platform Fee */}
            {platformFeeSettings.enabled && (
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">7</span>
                  Platform Fee
                </h2>
                <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Current Platform Fee: {platformFeeSettings.percentage}%
                    </p>
                  </div>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>A platform fee of <strong>{platformFeeSettings.percentage}%</strong> is added to each booking, with loyalty reductions during active care relationships</li>
                    <li>This fee helps us maintain the platform and provide quality service</li>
                    <li>The fee breakdown is shown before you confirm your booking</li>
                    <li>Example: For a ₹1,000 therapist fee, platform fee would be ₹{Math.round(1000 * platformFeeSettings.percentage / 100)}, total: ₹{1000 + Math.round(1000 * platformFeeSettings.percentage / 100)}</li>
                  </ul>
                </div>
              </section>
            )}

            {/* Cancellation */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">{platformFeeSettings.enabled ? '8' : '7'}</span>
                Cancellation & Refund Policy
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                {cancellationSettings.enabled ? (
                  <>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="font-semibold text-amber-800 dark:text-amber-200">
                        Free cancellation up to {cancellationSettings.freeWindowHours} hours before appointment
                      </p>
                    </div>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Free Cancellation:</strong> Cancel more than {cancellationSettings.freeWindowHours} hours before your appointment for a full refund</li>
                      <li><strong>Late Cancellation:</strong> Cancel within {cancellationSettings.freeWindowHours} hours of your appointment and a {cancellationSettings.feePercentage}% cancellation fee applies</li>
                      <li>The refund amount (after deducting cancellation fee) will be shown before you confirm cancellation</li>
                      <li>Refund information is displayed in your booking history</li>
                    </ul>
                  </>
                ) : (
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You can cancel a pending or confirmed booking at any time</li>
                    <li>Full refund is provided for all cancellations</li>
                    <li>We recommend cancelling as early as possible</li>
                  </ul>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">8</span>
                Reviews & Ratings
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>After a session is marked as completed, you can leave a review and continue your care plan</li>
                  <li>Rate your experience from 1 to 5 stars</li>
                  <li>Write a detailed review to help other patients</li>
                  <li>Reviews are public and visible on the therapist's profile</li>
                  <li>Please provide honest and constructive feedback</li>
                </ul>
              </div>
            </section>

            {/* Data Storage */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">9</span>
                Data Storage & Privacy
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>All your data is stored locally in your browser (localStorage)</li>
                  <li>Data is not sent to any external servers</li>
                  <li>Clearing your browser data will remove your account information</li>
                  <li>Your password is encoded for security</li>
                  <li>Profile photos are stored as base64 encoded images locally</li>
                </ul>
              </div>
            </section>

            {/* Account Management */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">10</span>
                Account Management
              </h2>
              <div className="pl-13 space-y-3 text-slate-600 dark:text-zinc-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>You can update your profile information at any time</li>
                  <li>You can change your profile photo</li>
                  <li>You can update your health profile</li>
                  <li>Account deletion can be requested through the admin</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 text-lg font-bold">11</span>
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
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all text-center"
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

