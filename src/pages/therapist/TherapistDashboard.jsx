import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { localDB } from '../../utils/localDB';
import { getSubscriptionStatus } from '../../utils/subscriptionUtils';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS, SUBSCRIPTION_STATUS } from '../../config/constants';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const { getBookingsForTherapist, getActiveRelationshipsForTherapist, getUserById } = useData();
  const [platformFeeSettings, setPlatformFeeSettings] = useState({ enabled: false, percentage: 10 });

  useEffect(() => {
    const settings = localDB.getPlatformFeeSettings();
    setPlatformFeeSettings(settings);
  }, []);

  const bookings = getBookingsForTherapist(user?.id) || [];
  const activeRelationships = getActiveRelationshipsForTherapist(user?.id) || [];
  const subscriptionStatus = getSubscriptionStatus(user?.subscription);

  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length;
    const upcoming = bookings.filter(b => 
      b.status === BOOKING_STATUS.CONFIRMED && 
      new Date(b.date) >= new Date()
    ).length;
    const completed = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
    
    // Calculate gross earnings (therapist fee portion)
    const grossEarnings = bookings
      .filter(b => b.status === BOOKING_STATUS.COMPLETED)
      .reduce((sum, b) => sum + (b.therapistFee || b.price), 0);
    
    // Calculate platform fees paid
    const platformFeePaid = bookings
      .filter(b => b.status === BOOKING_STATUS.COMPLETED)
      .reduce((sum, b) => sum + (b.platformFee || 0), 0);
    
    // Calculate cancellation fee income
    const cancellationIncome = bookings
      .filter(b => b.status === BOOKING_STATUS.CANCELLED && b.cancellationFeeTherapist > 0)
      .reduce((sum, b) => sum + b.cancellationFeeTherapist, 0);
    
    const netEarnings = grossEarnings + cancellationIncome;
    
    return { pending, upcoming, completed, grossEarnings, platformFeePaid, cancellationIncome, netEarnings };
  }, [bookings]);

  const recentBookings = bookings
    .filter(b => b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const statusBanner = () => {
    const { status, daysRemaining } = subscriptionStatus;
    
    if (!user?.verified) {
      return (
        <Card variant="feature" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Verification Pending</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Your profile is under review. You'll be notified once verified.</p>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    if (status === SUBSCRIPTION_STATUS.EXPIRED) {
      return (
        <Card variant="feature" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Subscription Expired</p>
                <p className="text-sm text-red-600 dark:text-red-400">Your profile is hidden from patients. Renew to continue receiving bookings.</p>
              </div>
            </div>
            <Link to="/therapist/subscription"><Button size="sm">Renew Now</Button></Link>
          </div>
        </Card>
      );
    }

    if (status === SUBSCRIPTION_STATUS.EXPIRING_SOON) {
      return (
        <Card variant="feature" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Subscription Expiring Soon</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">{daysRemaining} days remaining. Renew to avoid interruption.</p>
              </div>
            </div>
            <Link to="/therapist/subscription"><Button size="sm">Renew</Button></Link>
          </div>
        </Card>
      );
    }

    if (status === SUBSCRIPTION_STATUS.TRIAL) {
      return (
        <Card variant="feature" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">Trial Period Active</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{daysRemaining} days remaining in your free trial.</p>
              </div>
            </div>
            <Link to="/therapist/subscription"><Button size="sm">View Plans</Button></Link>
          </div>
        </Card>
      );
    }

    return (
      <Card variant="feature" className="bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-lime-100 dark:bg-lime-900/50 rounded-lg">
            <svg className="w-6 h-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-lime-800 dark:text-lime-200">Your {user?.subscription?.planName} plan is active</p>
            <p className="text-sm text-lime-600 dark:text-lime-400">{daysRemaining} days remaining</p>
          </div>
        </div>
      </Card>
    );
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Welcome back, Dr. {user?.fullName?.split(' ').pop()}!</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Here's your practice overview</p>
        </div>

        {statusBanner()}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Requests"
            value={stats.pending}
            variant="warning"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Upcoming Sessions"
            value={stats.upcoming}
            variant="primary"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            title="Completed Sessions"
            value={stats.completed}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Net Earnings"
            value={formatCurrency(stats.netEarnings)}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <Card variant="feature">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Active Care Relationships</h2>
            <Badge variant="primary">{activeRelationships.length} Active</Badge>
          </div>
          {activeRelationships.length > 0 ? (
            <div className="space-y-3">
              {activeRelationships.slice(0, 5).map((relationship) => {
                const customer = getUserById(relationship.customerId);
                return (
                  <div key={relationship.id} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={customer?.profilePhoto} alt={customer?.fullName} size="md" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-zinc-100">{customer?.fullName || 'Patient'}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Care managed until {formatDate(relationship.expiresAt)}</p>
                      </div>
                    </div>
                    <Link to="/therapist/sessions"><Button size="sm" variant="ghost">Manage Sessions</Button></Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-400">Complete first sessions to activate long-term managed care relationships.</p>
          )}
        </Card>

        {/* Earnings Breakdown */}
        {platformFeeSettings.enabled && (
          <Card variant="feature">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Earnings Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-zinc-400">Gross Earnings</p>
                <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(stats.grossEarnings)}</p>
              </div>
              {stats.cancellationIncome > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-sm text-amber-600 dark:text-amber-400">Cancellation Income</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">+{formatCurrency(stats.cancellationIncome)}</p>
                </div>
              )}
              <div className="p-4 bg-lime-50 dark:bg-lime-900/20 rounded-xl">
                <p className="text-sm text-lime-600 dark:text-lime-400">Net Earnings</p>
                <p className="text-xl font-bold text-lime-700 dark:text-lime-300">{formatCurrency(stats.netEarnings)}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-3">
              * Platform fee ({platformFeeSettings.percentage}%) is paid by customers at booking time. Your earnings shown above are already net of platform fees.
            </p>
          </Card>
        )}

        <Card variant="feature">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Recent Bookings</h2>
            <Link to="/therapist/requests" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
          </div>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <Avatar src={null} alt={booking.customerName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-zinc-100">{booking.customerName}</p>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">{formatDate(booking.date)} at {formatTime(booking.time)}</p>
                  </div>
                  <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                  <span className="font-semibold text-slate-800 dark:text-zinc-100">{formatCurrency(booking.price)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-zinc-400">No pending bookings</p>
            </div>
          )}
        </Card>
      </motion.div>
    </TherapistLayout>
  );
}


