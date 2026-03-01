import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatDate';
import { BOOKING_STATUS } from '../../config/constants';
import { localDB } from '../../utils/localDB';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';

export default function TherapistEarnings() {
  const { user } = useAuth();
  const { getBookingsForTherapist } = useData();
  const [platformFeeSettings, setPlatformFeeSettings] = useState({ enabled: false, percentage: 0 });

  useEffect(() => {
    const settings = localDB.getPlatformFeeSettings();
    setPlatformFeeSettings(settings);
  }, []);

  const bookings = getBookingsForTherapist(user?.id) || [];

  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED);
    const cancelled = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED && b.cancellationFeeTherapist > 0);
    
    // Gross earnings (what customers paid, therapist fee only)
    const grossTotal = completed.reduce((sum, b) => sum + (b.therapistFee || b.price), 0);
    
    // Platform fees deducted
    const platformFeesDeducted = completed.reduce((sum, b) => sum + (b.platformFee || 0), 0);
    
    // Cancellation fee income
    const cancellationIncome = cancelled.reduce((sum, b) => sum + (b.cancellationFeeTherapist || 0), 0);
    
    // Net earnings (gross - platform fees + cancellation income)
    const netTotal = grossTotal + cancellationIncome;
    
    const now = new Date();
    const thisMonth = completed.filter(b => {
      const date = new Date(b.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const monthlyGross = thisMonth.reduce((sum, b) => sum + (b.therapistFee || b.price), 0);
    const monthlyPlatformFees = thisMonth.reduce((sum, b) => sum + (b.platformFee || 0), 0);
    const monthlyNet = monthlyGross;

    const lastMonth = completed.filter(b => {
      const date = new Date(b.date);
      const lastMonthDate = new Date(now);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });
    const lastMonthNet = lastMonth.reduce((sum, b) => sum + (b.therapistFee || b.price), 0);

    return { 
      grossTotal, 
      netTotal, 
      platformFeesDeducted,
      cancellationIncome,
      monthlyGross,
      monthlyNet, 
      monthlyPlatformFees,
      lastMonthNet, 
      sessions: completed.length 
    };
  }, [bookings]);

  const completedBookings = bookings
    .filter(b => b.status === BOOKING_STATUS.COMPLETED)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const cancellationIncomeBookings = bookings
    .filter(b => b.status === BOOKING_STATUS.CANCELLED && b.cancellationFeeTherapist > 0)
    .sort((a, b) => new Date(b.cancelledAt || b.date) - new Date(a.cancelledAt || a.date));

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthBookings = completedBookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate.getMonth() === date.getMonth() && bDate.getFullYear() === date.getFullYear();
      });
      const gross = monthBookings.reduce((sum, b) => sum + (b.therapistFee || b.price), 0);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        earnings: gross
      });
    }
    return months;
  }, [completedBookings]);

  const maxEarning = Math.max(...monthlyData.map(m => m.earnings), 1);

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Earnings</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Track your revenue and earnings</p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Net Earnings"
            value={formatCurrency(stats.netTotal)}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthlyNet)}
            variant="primary"
            trend={stats.monthlyNet >= stats.lastMonthNet ? 'up' : 'down'}
            trendValue={`${Math.abs(Math.round(((stats.monthlyNet - stats.lastMonthNet) / (stats.lastMonthNet || 1)) * 100))}%`}
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <StatCard
            title="Cancellation Income"
            value={formatCurrency(stats.cancellationIncome)}
            variant="warning"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Total Sessions"
            value={stats.sessions}
            variant="default"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
        </div>

        {/* Platform Fee Info */}
        {platformFeeSettings.enabled && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Platform Fee Information</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  A {platformFeeSettings.percentage}% platform fee is charged to customers on each booking. 
                  Your earnings shown here are your therapist fees (what you receive), not including the platform fee.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Monthly Chart */}
        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-6">Monthly Earnings</h3>
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-t-lg relative" style={{ height: '160px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.earnings / maxEarning) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg"
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-zinc-400">{month.month}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">{formatCurrency(month.earnings)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Recent Transactions</h3>
          {completedBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Patient</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Type</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400 text-right">Your Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {completedBookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id}>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{formatDate(booking.date)}</td>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{booking.customerName}</td>
                      <td className="py-3 text-slate-600 dark:text-zinc-400 capitalize">{booking.visitType}</td>
                      <td className="py-3 text-right font-semibold text-lime-600 dark:text-lime-400">
                        +{formatCurrency(booking.therapistFee || booking.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No transactions yet</p>
          )}
        </Card>

        {/* Cancellation Fee Income */}
        {cancellationIncomeBookings.length > 0 && (
          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Cancellation Fee Income</h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
              When customers cancel late, you receive a portion of the cancellation fee.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Patient</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400 text-right">Total Fee</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400 text-right">Your Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {cancellationIncomeBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{formatDate(booking.cancelledAt || booking.date)}</td>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{booking.customerName}</td>
                      <td className="py-3 text-right text-slate-600 dark:text-zinc-400">
                        {formatCurrency(booking.cancellationFee)}
                      </td>
                      <td className="py-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                        +{formatCurrency(booking.cancellationFeeTherapist)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </motion.div>
    </TherapistLayout>
  );
}
