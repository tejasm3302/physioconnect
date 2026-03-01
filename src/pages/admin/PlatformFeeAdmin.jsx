import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import { localDB } from '../../utils/localDB';
import { formatCurrency } from '../../utils/currency';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function PlatformFeeAdmin() {
  const [platformFeeSettings, setPlatformFeeSettings] = useState({
    enabled: true,
    percentage: 10,
    type: 'percentage'
  });
  
  const [cancellationSettings, setCancellationSettings] = useState({
    enabled: true,
    freeWindowHours: 18,
    feePercentage: 20,
    adminShare: 60,
    therapistShare: 40
  });
  
  const [feeCollections, setFeeCollections] = useState([]);
  const [cancellationCollections, setCancellationCollections] = useState([]);
  const [stats, setStats] = useState({
    totalPlatformFees: 0,
    totalCancellationFees: 0,
    totalRevenue: 0,
    totalCollections: 0
  });

  useEffect(() => {
    loadSettings();
    loadCollections();
  }, []);

  const loadSettings = () => {
    const pfSettings = localDB.getPlatformFeeSettings();
    const cSettings = localDB.getCancellationSettings();
    setPlatformFeeSettings(pfSettings);
    setCancellationSettings(cSettings);
  };

  const loadCollections = () => {
    const bookings = localDB.getBookings() || [];
    const users = localDB.getUsers() || [];
    
    // Platform fee collections from completed bookings
    const platformFees = bookings
      .filter(b => b.status === 'completed' && b.platformFee > 0)
      .map(b => {
        const customer = users.find(u => u.id === b.customerId);
        const therapist = users.find(u => u.id === b.therapistId);
        return {
          id: b.id,
          date: b.date,
          customerName: customer?.fullName || b.customerName || 'Unknown',
          therapistName: therapist?.fullName || b.therapistName || 'Unknown',
          bookingAmount: b.price || 0,
          platformFee: b.platformFee || 0,
          type: 'platform'
        };
      });
    
    // Cancellation fee collections
    const cancellationFees = bookings
      .filter(b => b.status === 'cancelled' && b.cancellationFee > 0)
      .map(b => {
        const customer = users.find(u => u.id === b.customerId);
        const therapist = users.find(u => u.id === b.therapistId);
        return {
          id: b.id,
          date: b.cancelledAt || b.date,
          customerName: customer?.fullName || b.customerName || 'Unknown',
          therapistName: therapist?.fullName || b.therapistName || 'Unknown',
          cancellationFee: b.cancellationFee || 0,
          adminAmount: b.cancellationFeeAdmin || 0,
          therapistAmount: b.cancellationFeeTherapist || 0,
          type: 'cancellation'
        };
      });
    
    setFeeCollections(platformFees);
    setCancellationCollections(cancellationFees);
    
    const totalPlatformFees = platformFees.reduce((sum, f) => sum + f.platformFee, 0);
    const totalCancellationFees = cancellationFees.reduce((sum, f) => sum + f.adminAmount, 0);
    
    setStats({
      totalPlatformFees,
      totalCancellationFees,
      totalRevenue: totalPlatformFees + totalCancellationFees,
      totalCollections: platformFees.length + cancellationFees.length
    });
  };

  const handlePlatformFeeToggle = () => {
    const updated = { ...platformFeeSettings, enabled: !platformFeeSettings.enabled };
    setPlatformFeeSettings(updated);
    localDB.setPlatformFeeSettings(updated);
    toast.success(`Platform fee ${updated.enabled ? 'enabled' : 'disabled'}`);
  };

  const handlePlatformFeeChange = (value) => {
    const percentage = Math.min(30, Math.max(1, parseInt(value) || 0));
    const updated = { ...platformFeeSettings, percentage };
    setPlatformFeeSettings(updated);
    localDB.setPlatformFeeSettings(updated);
  };

  const handleCancellationToggle = () => {
    const updated = { ...cancellationSettings, enabled: !cancellationSettings.enabled };
    setCancellationSettings(updated);
    localDB.setCancellationSettings(updated);
    toast.success(`Cancellation fee ${updated.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleCancellationChange = (field, value) => {
    let numValue = parseInt(value) || 0;
    
    if (field === 'freeWindowHours') {
      numValue = Math.min(72, Math.max(1, numValue));
    } else if (field === 'feePercentage') {
      numValue = Math.min(50, Math.max(1, numValue));
    } else if (field === 'adminShare') {
      numValue = Math.min(100, Math.max(0, numValue));
      const updated = { 
        ...cancellationSettings, 
        adminShare: numValue,
        therapistShare: 100 - numValue
      };
      setCancellationSettings(updated);
      localDB.setCancellationSettings(updated);
      return;
    }
    
    const updated = { ...cancellationSettings, [field]: numValue };
    setCancellationSettings(updated);
    localDB.setCancellationSettings(updated);
  };

  const exportCSV = () => {
    const allCollections = [
      ...feeCollections.map(f => ({
        Date: f.date,
        Type: 'Platform Fee',
        Customer: f.customerName,
        Therapist: f.therapistName,
        'Booking Amount': f.bookingAmount,
        'Fee Collected': f.platformFee,
        'Admin Amount': f.platformFee,
        'Therapist Amount': 0
      })),
      ...cancellationCollections.map(f => ({
        Date: f.date,
        Type: 'Cancellation Fee',
        Customer: f.customerName,
        Therapist: f.therapistName,
        'Booking Amount': '-',
        'Fee Collected': f.cancellationFee,
        'Admin Amount': f.adminAmount,
        'Therapist Amount': f.therapistAmount
      }))
    ];
    
    if (allCollections.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = Object.keys(allCollections[0]);
    const csvContent = [
      headers.join(','),
      ...allCollections.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-collections-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Platform Fees</h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage platform and cancellation fees</p>
          </div>
          <Button onClick={exportCSV} variant="secondary" className="h-11 px-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Platform Fees</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalPlatformFees)}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Cancellation Fees</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalCancellationFees)}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 rounded-xl bg-gradient-to-br from-lime-500 to-green-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Collections</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCollections}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Fee Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Platform Fee</h2>
                  </div>
                  <button
                    onClick={handlePlatformFeeToggle}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      platformFeeSettings.enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        platformFeeSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Fee Percentage
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={platformFeeSettings.percentage}
                        onChange={(e) => handlePlatformFeeChange(e.target.value)}
                        disabled={!platformFeeSettings.enabled}
                        className="flex-1 h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <div className="w-16 h-11 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold text-slate-800 dark:text-zinc-100">
                        {platformFeeSettings.percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Example:</strong> For a ₹1,500 booking, platform fee will be{' '}
                        <strong>{formatCurrency(1500 * platformFeeSettings.percentage / 100)}</strong>.
                        Customer pays <strong>{formatCurrency(1500 + (1500 * platformFeeSettings.percentage / 100))}</strong> total.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Cancellation Fee Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 rounded-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Cancellation Fee</h2>
                  </div>
                  <button
                    onClick={handleCancellationToggle}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      cancellationSettings.enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-zinc-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        cancellationSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Free Cancellation Window
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={cancellationSettings.freeWindowHours}
                        onChange={(e) => handleCancellationChange('freeWindowHours', e.target.value)}
                        disabled={!cancellationSettings.enabled}
                        className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 disabled:opacity-50"
                      />
                      <span className="text-sm text-slate-600 dark:text-zinc-400 font-medium">hours before</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Late Cancellation Fee
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={cancellationSettings.feePercentage}
                        onChange={(e) => handleCancellationChange('feePercentage', e.target.value)}
                        disabled={!cancellationSettings.enabled}
                        className="flex-1 h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <div className="w-16 h-11 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold text-slate-800 dark:text-zinc-100">
                        {cancellationSettings.feePercentage}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                      Fee Split (Admin : Therapist)
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold w-12">Admin</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cancellationSettings.adminShare}
                        onChange={(e) => handleCancellationChange('adminShare', e.target.value)}
                        disabled={!cancellationSettings.enabled}
                        className="flex-1 h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold w-16 text-right">Therapist</span>
                    </div>
                    <div className="flex justify-between px-12">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                        {cancellationSettings.adminShare}%
                      </span>
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold">
                        {cancellationSettings.therapistShare}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Example:</strong> ₹1,650 booking cancelled late<br/>
                        Fee: <strong>{formatCurrency(1650 * cancellationSettings.feePercentage / 100)}</strong> → 
                        Admin: <strong>{formatCurrency(1650 * cancellationSettings.feePercentage / 100 * cancellationSettings.adminShare / 100)}</strong> | 
                        Therapist: <strong>{formatCurrency(1650 * cancellationSettings.feePercentage / 100 * cancellationSettings.therapistShare / 100)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Fee Collection History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Fee Collection History</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">Track all platform and cancellation fees collected</p>
            </div>
            
            {feeCollections.length === 0 && cancellationCollections.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">No fee collections yet</p>
                <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Fees will appear here when bookings are completed or cancelled</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Customer</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Therapist</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Fee Collected</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700 dark:text-zinc-300">Admin Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {[...feeCollections, ...cancellationCollections]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((fee, index) => (
                        <tr key={fee.id + '-' + index} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-zinc-400">
                            {new Date(fee.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              fee.type === 'platform' 
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {fee.type === 'platform' ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {fee.type === 'platform' ? 'Platform' : 'Cancellation'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-zinc-200">{fee.customerName}</td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-zinc-200">{fee.therapistName}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-slate-800 dark:text-zinc-200">
                            {formatCurrency(fee.type === 'platform' ? fee.platformFee : fee.cancellationFee)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(fee.type === 'platform' ? fee.platformFee : fee.adminAmount)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
