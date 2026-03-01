import { useMemo } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatDate';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';

export default function RevenueReports() {
  const { getPayments, getUsers } = useData();

  const payments = getPayments() || [];
  const users = getUsers() || [];

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const now = new Date();
    const thisMonth = payments.filter(p => {
      const date = new Date(p.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, p) => sum + p.amount, 0);

    const planBreakdown = payments.reduce((acc, p) => {
      acc[p.planName] = (acc[p.planName] || 0) + p.amount;
      return acc;
    }, {});

    return { total, monthlyTotal, planBreakdown, count: payments.length };
  }, [payments]);

  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
      });
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
      });
    }
    return months;
  }, [payments]);

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Revenue Reports</h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">Track platform revenue and subscriptions</p>
          </div>
          <button
            onClick={() => {
              const csvRows = [['Date', 'Therapist', 'Plan', 'Method', 'Amount', 'Status', 'Payment ID']];
              payments.forEach(p => {
                const therapist = users.find(u => u.id === p.therapistId);
                csvRows.push([
                  new Date(p.date).toLocaleDateString(), therapist?.fullName || 'Unknown',
                  p.planName, p.method, p.amount, p.status, p.paymentId || p.id
                ]);
              });
              const csv = csvRows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `revenue_${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-zinc-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.total)}
            variant="success"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthlyTotal)}
            variant="primary"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <StatCard
            title="Total Subscriptions"
            value={stats.count}
            variant="warning"
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-6">Monthly Revenue</h3>
            <div className="flex items-end gap-4 h-48">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-t-lg relative" style={{ height: '160px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(month.revenue / maxRevenue) * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="absolute bottom-0 w-full bg-gradient-to-t from-lime-600 to-lime-400 rounded-t-lg"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{month.month}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-6">Revenue by Plan</h3>
            <div className="space-y-4">
              {Object.entries(stats.planBreakdown).map(([plan, amount]) => {
                const percentage = (amount / stats.total) * 100;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800 dark:text-zinc-100">{plan}</span>
                      <span className="text-slate-600 dark:text-zinc-400">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-primary-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">All Transactions</h3>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Therapist</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Plan</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Method</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Amount</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {payments.slice().reverse().map((payment) => {
                    const therapist = users.find(u => u.id === payment.therapistId);
                    return (
                      <tr key={payment.id}>
                        <td className="py-3 text-slate-800 dark:text-zinc-100">{formatDate(payment.date)}</td>
                        <td className="py-3 text-slate-800 dark:text-zinc-100">{therapist?.fullName || 'Unknown'}</td>
                        <td className="py-3 text-slate-600 dark:text-zinc-400">{payment.planName}</td>
                        <td className="py-3 text-slate-600 dark:text-zinc-400 uppercase text-sm">{payment.method}</td>
                        <td className="py-3 font-semibold text-lime-600 dark:text-lime-400">{formatCurrency(payment.amount)}</td>
                        <td className="py-3"><Badge variant="success">{payment.status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No transactions yet</p>
          )}
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
