import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/currency';
import { daysUntilExpiry, isNearExpiry } from '../../utils/relationshipUtils';
import { BOOKING_STATUS } from '../../config/constants';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const {
    getBookingsForCustomer,
    getTherapists,
    getActiveRelationshipsForCustomer,
    getCarePlansForCustomer,
    getSessionHistoryForCustomer,
    getUserById
  } = useData();
  const notify = useNotification();

  const bookings = getBookingsForCustomer(user?.id) || [];
  const therapists = getTherapists() || [];
  const activeRelationships = getActiveRelationshipsForCustomer(user?.id) || [];
  const carePlans = getCarePlansForCustomer(user?.id) || [];
  const sessionHistory = getSessionHistoryForCustomer(user?.id) || [];

  const upcomingBookings = bookings.filter(b =>
    (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.PENDING) &&
    new Date(b.date) >= new Date()
  ).slice(0, 3);

  const completedCount = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).length;
  const totalSpent = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED).reduce((sum, b) => sum + b.price, 0);

  const platformFeesPaid = bookings
    .filter(b => b.status === BOOKING_STATUS.COMPLETED)
    .reduce((sum, b) => sum + (b.platformFee || 0), 0);

  const totalRefunds = bookings
    .filter(b => b.status === BOOKING_STATUS.CANCELLED)
    .reduce((sum, b) => sum + (b.refundAmount || 0), 0);

  const activeCarePlans = carePlans
    .filter(plan => plan.status === 'active')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const nearExpiryRelationships = activeRelationships.filter(isNearExpiry);

  useEffect(() => {
    if (nearExpiryRelationships.length === 0) return;

    const reminderKey = 'physioconnect_relationship_reminders_seen';
    const seen = JSON.parse(localStorage.getItem(reminderKey) || '[]');

    nearExpiryRelationships.forEach((relationship) => {
      if (seen.includes(relationship.id)) return;

      const therapist = getUserById(relationship.therapistId);
      const remaining = daysUntilExpiry(relationship);
      notify.warning(`Care relationship with ${therapist?.fullName || 'your therapist'} expires in ${remaining} day(s). Rebook now to keep continuity.`);
      seen.push(relationship.id);
    });

    localStorage.setItem(reminderKey, JSON.stringify(seen));
  }, [nearExpiryRelationships.length]);

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };

  const downloadSessionReport = (entry) => {
    const report = [
      'PhysioConnect Managed Care Session Report',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `Therapist: ${entry.therapistName}`,
      `Customer: ${entry.customerName}`,
      `Session Date: ${formatDate(entry.createdAt)}`,
      '',
      'Notes:',
      entry.summary
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-report-${entry.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Here is your managed care progress on PhysioConnect</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Upcoming Appointments"
            value={upcomingBookings.length}
            variant="primary"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            title="Sessions Completed"
            value={completedCount}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            variant="warning"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          {platformFeesPaid > 0 && (
            <StatCard
              title="Platform Fees Paid"
              value={formatCurrency(platformFeesPaid)}
              variant="default"
              icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>}
            />
          )}
          {totalRefunds > 0 && (
            <StatCard
              title="Total Refunds"
              value={formatCurrency(totalRefunds)}
              variant="success"
              icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
            />
          )}
        </div>

        <Card variant="feature" className="border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Managed Care Relationships</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">Communication and continuity are protected inside PhysioConnect.</p>
            </div>
            <Badge variant="primary">Active: {activeRelationships.length}</Badge>
          </div>

          <div className="mt-4 space-y-3">
            {activeRelationships.length > 0 ? activeRelationships.map((relationship) => {
              const therapist = getUserById(relationship.therapistId);
              const remaining = daysUntilExpiry(relationship);
              return (
                <div key={relationship.id} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={therapist?.profilePhoto} alt={therapist?.fullName} size="md" verified={therapist?.verified} />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-zinc-100">{therapist?.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">Expires in {remaining} day(s)</p>
                    </div>
                  </div>
                  <Link to={`/customer/book/${relationship.therapistId}`}>
                    <Button size="sm">Instant Rebook</Button>
                  </Link>
                </div>
              );
            }) : (
              <p className="text-sm text-slate-500 dark:text-zinc-400">No active care relationships yet. Complete your first session to unlock continuity benefits.</p>
            )}
          </div>
        </Card>

        {nearExpiryRelationships.length > 0 && (
          <Card variant="feature" className="border-amber-200 dark:border-amber-800">
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Smart Rebooking Reminder</h3>
            <div className="mt-3 space-y-2">
              {nearExpiryRelationships.map((relationship) => {
                const therapist = getUserById(relationship.therapistId);
                return (
                  <p key={relationship.id} className="text-sm text-amber-700 dark:text-amber-300">
                    Your care relationship with {therapist?.fullName} ends in {daysUntilExpiry(relationship)} day(s). Rebook now to keep your progress on track.
                  </p>
                );
              })}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="feature">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Upcoming Appointments</h2>
              <Link to="/customer/bookings" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                    <Avatar src={therapists.find(t => t.id === booking.therapistId)?.profilePhoto} alt={booking.therapistName} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-zinc-100">{booking.therapistName}</p>
                      <p className="text-sm text-slate-600 dark:text-zinc-400">{formatDate(booking.date)} at {formatTime(booking.time)}</p>
                    </div>
                    <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-zinc-400 mb-4">No upcoming appointments</p>
                <Link to="/customer/browse"><Button size="sm">Find a Therapist</Button></Link>
              </div>
            )}
          </Card>

          <Card variant="feature">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Care Plan Tracker</h2>
              <Badge variant="success">In Platform</Badge>
            </div>
            {activeCarePlans.length > 0 ? (
              <div className="space-y-3">
                {activeCarePlans.slice(0, 3).map((plan) => {
                  const therapist = getUserById(plan.therapistId);
                  const progress = plan.totalSessions > 0
                    ? Math.round((plan.completedSessions / plan.totalSessions) * 100)
                    : 0;

                  return (
                    <div key={plan.id} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                      <p className="font-semibold text-slate-800 dark:text-zinc-100">{plan.title}</p>
                      <p className="text-sm text-slate-600 dark:text-zinc-400">Therapist: {therapist?.fullName || 'Assigned therapist'}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">{plan.completedSessions}/{plan.totalSessions} sessions completed</p>
                      <div className="mt-2 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-zinc-400">Your therapist-assigned care plan appears here after completion updates.</p>
            )}
          </Card>
        </div>

        <Card variant="feature">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Session History Locker</h2>
            <Badge variant="primary">Login Required</Badge>
          </div>
          {sessionHistory.length > 0 ? (
            <div className="space-y-3">
              {sessionHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-100">{entry.therapistName}</p>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">{formatDate(entry.createdAt)}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 line-clamp-1">{entry.summary}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => downloadSessionReport(entry)}>Download Report</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-400">Completed session reports will stay available here inside your account.</p>
          )}
        </Card>

        <Card variant="feature" className="bg-gradient-to-br from-primary-500 to-primary-700 border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Need immediate help?</h3>
              <p className="text-primary-100">Book a follow-up inside your managed PhysioConnect care plan.</p>
            </div>
            <Link to="/customer/browse"><Button className="bg-white text-primary-700 hover:bg-primary-50">Book Now</Button></Link>
          </div>
        </Card>
      </motion.div>
    </CustomerLayout>
  );
}
