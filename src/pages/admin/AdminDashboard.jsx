import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { localDB } from '../../utils/localDB';
import { formatCurrency } from '../../utils/currency';
import { ROLES, BOOKING_STATUS } from '../../config/constants';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  // Fetch data directly from localStorage to ensure fresh data
  useEffect(() => {
    const fetchData = () => {
      setUsers(localDB.getUsers() || []);
      setBookings(localDB.getBookings() || []);
      setPayments(localDB.getPayments() || []);
    };

    fetchData();
    
    // Refresh on interval
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const therapists = users.filter(u => u.role === ROLES.THERAPIST);
    const customers = users.filter(u => u.role === ROLES.CUSTOMER);
    const verifiedTherapists = therapists.filter(t => t.verified);
    const pendingVerification = therapists.filter(t => !t.verified);
    const subscriptionRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedSessions = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;

    // Platform fee revenue from bookings
    const platformFeeRevenue = bookings
      .filter(b => b.status === BOOKING_STATUS.COMPLETED)
      .reduce((sum, b) => sum + (b.platformFee || 0), 0);

    // Cancellation fee revenue (admin's share)
    const cancellationFeeRevenue = bookings
      .filter(b => b.status === BOOKING_STATUS.CANCELLED && b.cancellationFeeAdmin > 0)
      .reduce((sum, b) => sum + (b.cancellationFeeAdmin || 0), 0);

    const totalRevenue = subscriptionRevenue + platformFeeRevenue + cancellationFeeRevenue;

    return {
      totalUsers: users.length,
      therapists: therapists.length,
      customers: customers.length,
      verifiedTherapists: verifiedTherapists.length,
      pendingVerification: pendingVerification.length,
      subscriptionRevenue,
      platformFeeRevenue,
      cancellationFeeRevenue,
      totalRevenue,
      completedSessions
    };
  }, [users, bookings, payments]);

  const recentPayments = payments.slice(-5).reverse();
  const pendingTherapists = users
    .filter(u => u.role === ROLES.THERAPIST && !u.verified)
    .slice(0, 5);

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            variant="primary"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
          <StatCard
            title="Therapists"
            value={stats.therapists}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            variant="warning"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Pending Verification"
            value={stats.pendingVerification}
            variant="danger"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
        </div>

        {/* Revenue Breakdown */}
        <Card variant="feature">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Revenue Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Subscriptions</span>
              </div>
              <p className="text-2xl font-bold text-teal-800 dark:text-teal-200">{formatCurrency(stats.subscriptionRevenue)}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">From therapist plans</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Platform Fees</span>
              </div>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(stats.platformFeeRevenue)}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">From completed bookings</p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Cancellation Fees</span>
              </div>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(stats.cancellationFeeRevenue)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Admin's share from late cancellations</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="feature">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Pending Verifications</h2>
              <Link to="/admin/verify" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
            </div>
            {pendingTherapists.length > 0 ? (
              <div className="space-y-4">
                {pendingTherapists.map(therapist => (
                  <div key={therapist.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                    <Avatar src={therapist.profilePhoto} alt={therapist.fullName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-zinc-100">{therapist.fullName}</p>
                      <p className="text-sm text-slate-600 dark:text-zinc-400">{therapist.specialization || 'General'}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No pending verifications</p>
            )}
          </Card>

          <Card variant="feature">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Recent Payments</h2>
              <Link to="/admin/revenue" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
            </div>
            {recentPayments.length > 0 ? (
              <div className="space-y-4">
                {recentPayments.map(payment => {
                  const therapist = users.find(u => u.id === payment.therapistId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-zinc-100">{therapist?.fullName || 'Unknown'}</p>
                        <p className="text-sm text-slate-600 dark:text-zinc-400">{payment.planName} Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lime-600 dark:text-lime-400">+{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No payments yet</p>
            )}
          </Card>
        </div>

        <Card variant="feature">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{stats.customers}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Patients</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{stats.verifiedTherapists}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Verified Therapists</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{stats.completedSessions}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Completed Sessions</p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-3xl font-bold text-slate-800 dark:text-zinc-100">{payments.length}</p>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Total Subscriptions</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
