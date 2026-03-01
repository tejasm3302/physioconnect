import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/currency';
import { BOOKING_STATUS } from '../../config/constants';
import { localDB } from '../../utils/localDB';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function MyBookings() {
  const { user } = useAuth();
  const { getBookingsForCustomer, getUserById } = useData();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null });
  const [cancellationSettings, setCancellationSettings] = useState({
    enabled: true,
    freeWindowHours: 18,
    feePercentage: 20,
    adminShare: 60,
    therapistShare: 40
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const settings = localDB.getCancellationSettings();
    setCancellationSettings(settings);
  }, []);

  const bookings = getBookingsForCustomer(user?.id) || [];

  const filteredBookings = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return bookings.filter(b => 
        (b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED) &&
        new Date(b.date) >= now
      ).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (activeTab === 'completed') {
      return bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      return bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [bookings, activeTab, refreshKey]);

  const calculateCancellationFee = (booking) => {
    if (!cancellationSettings.enabled) {
      return { fee: 0, refund: booking.price, isLate: false };
    }

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilBooking >= cancellationSettings.freeWindowHours) {
      return { fee: 0, refund: booking.price, isLate: false, hoursUntilBooking };
    }

    const fee = Math.round(booking.price * cancellationSettings.feePercentage / 100);
    const refund = booking.price - fee;
    const adminAmount = Math.round(fee * cancellationSettings.adminShare / 100);
    const therapistAmount = fee - adminAmount;

    return { fee, refund, isLate: true, hoursUntilBooking, adminAmount, therapistAmount };
  };

  const handleCancel = () => {
    const booking = cancelModal.booking;
    if (!booking) return;

    const { fee, refund, adminAmount, therapistAmount, isLate } = calculateCancellationFee(booking);

    // Update booking in localStorage
    const allBookings = localDB.getBookings();
    const updatedBookings = allBookings.map(b => {
      if (b.id === booking.id) {
        return {
          ...b,
          status: BOOKING_STATUS.CANCELLED,
          cancelledAt: new Date().toISOString(),
          cancellationFee: fee,
          cancellationFeeAdmin: adminAmount || 0,
          cancellationFeeTherapist: therapistAmount || 0,
          refundAmount: refund,
          lateCancellation: isLate
        };
      }
      return b;
    });
    localDB.setBookings(updatedBookings);

    if (isLate && fee > 0) {
      notify.success(`Booking cancelled. Refund: ${formatCurrency(refund)} (after ${formatCurrency(fee)} cancellation fee)`);
    } else {
      notify.success(`Booking cancelled. Full refund: ${formatCurrency(refund)}`);
    }

    setCancelModal({ open: false, booking: null });
    setRefreshKey(prev => prev + 1);
  };

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  const openCancelModal = (booking) => {
    setCancelModal({ open: true, booking });
  };

  const cancellationInfo = cancelModal.booking ? calculateCancellationFee(cancelModal.booking) : null;

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">My Bookings</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage your therapy appointments</p>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const therapist = getUserById(booking.therapistId);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="list" className="flex flex-col md:flex-row md:items-center gap-4">
                    <Avatar src={therapist?.profilePhoto} alt={booking.therapistName} size="lg" verified={therapist?.verified} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{booking.therapistName}</h3>
                        <Badge variant={statusColors[booking.status]} size="sm">{booking.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                        {formatDate(booking.date)} at {formatTime(booking.time)} • {booking.visitType}
                      </p>
                      {booking.notes && (
                        <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 line-clamp-1">{booking.notes}</p>
                      )}
                      {/* Show refund info for cancelled bookings */}
                      {booking.status === BOOKING_STATUS.CANCELLED && (
                        <div className="mt-2 p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                          {booking.lateCancellation ? (
                            <div className="text-sm">
                              <span className="text-amber-600 dark:text-amber-400">Late cancellation fee: {formatCurrency(booking.cancellationFee)}</span>
                              <span className="text-slate-600 dark:text-zinc-400 ml-2">• Refunded: {formatCurrency(booking.refundAmount)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-green-600 dark:text-green-400">Full refund: {formatCurrency(booking.refundAmount || booking.price)}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(booking.price)}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{booking.duration} min</p>
                        {booking.platformFee > 0 && (
                          <p className="text-xs text-slate-400 dark:text-zinc-500">incl. {formatCurrency(booking.platformFee)} fee</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to={`/customer/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        {(booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED) && (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openCancelModal(booking)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            title={`No ${activeTab} bookings`}
            description={activeTab === 'upcoming' ? 'Book an appointment with a therapist to get started' : 'Your booking history will appear here'}
            action={activeTab === 'upcoming' ? () => window.location.href = '/customer/browse' : undefined}
            actionLabel={activeTab === 'upcoming' ? 'Find a Therapist' : undefined}
          />
        )}

        {/* Cancellation Modal with Fee Info */}
        <Modal
          isOpen={cancelModal.open}
          onClose={() => setCancelModal({ open: false, booking: null })}
          title="Cancel Booking"
          size="md"
        >
          {cancelModal.booking && cancellationInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                <p className="font-medium text-slate-800 dark:text-zinc-100">{cancelModal.booking.therapistName}</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {formatDate(cancelModal.booking.date)} at {formatTime(cancelModal.booking.time)}
                </p>
              </div>

              {cancellationSettings.enabled ? (
                cancellationInfo.isLate ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-amber-800 dark:text-amber-200">Late Cancellation</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Your appointment is in less than {cancellationSettings.freeWindowHours} hours. 
                          A cancellation fee of {cancellationSettings.feePercentage}% will be charged.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 pt-4 border-t border-amber-200 dark:border-amber-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700 dark:text-amber-300">Booking Amount</span>
                        <span className="font-medium text-amber-800 dark:text-amber-200">{formatCurrency(cancelModal.booking.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700 dark:text-amber-300">Cancellation Fee ({cancellationSettings.feePercentage}%)</span>
                        <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(cancellationInfo.fee)}</span>
                      </div>
                      <div className="flex justify-between text-base pt-2 border-t border-amber-200 dark:border-amber-800">
                        <span className="font-semibold text-amber-800 dark:text-amber-200">Refund Amount</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(cancellationInfo.refund)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Free Cancellation</p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your appointment is more than {cancellationSettings.freeWindowHours} hours away. 
                          You will receive a full refund.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                      <div className="flex justify-between">
                        <span className="font-semibold text-green-800 dark:text-green-200">Full Refund</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(cancellationInfo.refund)}</span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-green-800 dark:text-green-200">You will receive a full refund of {formatCurrency(cancelModal.booking.price)}</p>
                </div>
              )}

              <p className="text-sm text-slate-500 dark:text-zinc-400">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setCancelModal({ open: false, booking: null })} className="flex-1">
                  Keep Booking
                </Button>
                <Button variant="danger" onClick={handleCancel} className="flex-1">
                  {cancellationInfo.isLate ? `Cancel & Pay ${formatCurrency(cancellationInfo.fee)}` : 'Cancel & Get Refund'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </motion.div>
    </CustomerLayout>
  );
}
