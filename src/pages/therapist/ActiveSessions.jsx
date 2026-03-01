import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/currency';
import { BOOKING_STATUS } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function ActiveSessions() {
  const { user } = useAuth();
  const { getBookingsForTherapist, markBookingCompleted, getUserById } = useData();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [completeModal, setCompleteModal] = useState({ open: false, bookingId: null });
  const [planTitle, setPlanTitle] = useState('');
  const [totalSessions, setTotalSessions] = useState('6');
  const [sessionNotes, setSessionNotes] = useState('');

  const bookings = getBookingsForTherapist(user?.id) || [];

  const filteredBookings = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return bookings
        .filter(b => b.status === BOOKING_STATUS.CONFIRMED && new Date(b.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return bookings
      .filter(b => b.status === BOOKING_STATUS.COMPLETED)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings, activeTab]);

  const resetCompletionInputs = () => {
    setPlanTitle('');
    setTotalSessions('6');
    setSessionNotes('');
  };

  const openCompleteModal = (bookingId) => {
    resetCompletionInputs();
    setCompleteModal({ open: true, bookingId });
  };

  const closeCompleteModal = () => {
    setCompleteModal({ open: false, bookingId: null });
    resetCompletionInputs();
  };

  const handleComplete = async () => {
    const result = await markBookingCompleted(completeModal.bookingId, {
      planTitle: planTitle.trim() || undefined,
      totalSessions: parseInt(totalSessions, 10) > 0 ? parseInt(totalSessions, 10) : undefined,
      sessionNotes: sessionNotes.trim() || undefined
    });

    if (result) {
      notify.success('Session completed. Care relationship is now managed via PhysioConnect.');
    }

    closeCompleteModal();
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Sessions</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage your confirmed and completed sessions</p>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const customer = getUserById(booking.customerId);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="list">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <Avatar src={customer?.profilePhoto} alt={booking.customerName} size="lg" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{booking.customerName}</h3>
                          <Badge variant={booking.status === BOOKING_STATUS.CONFIRMED ? 'success' : 'primary'} size="sm">
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                          {formatDate(booking.date)} at {formatTime(booking.time)} • {booking.duration} min
                        </p>
                        <Badge variant="default" size="sm" className="mt-2 capitalize">{booking.visitType}</Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                          {formatCurrency(booking.price)}
                        </span>
                        {booking.status === BOOKING_STATUS.CONFIRMED && (
                          <Button size="sm" onClick={() => openCompleteModal(booking.id)}>
                            Mark Complete
                          </Button>
                        )}
                        {booking.status === BOOKING_STATUS.COMPLETED && booking.rating && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < booking.rating ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Patient Rating</p>
                          </div>
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
            title={activeTab === 'upcoming' ? 'No upcoming sessions' : 'No completed sessions'}
            description={activeTab === 'upcoming' ? 'Confirmed appointments will appear here' : 'Your managed care history will appear here'}
          />
        )}

        <Modal
          isOpen={completeModal.open}
          onClose={closeCompleteModal}
          title="Complete Session"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-zinc-400">Mark this session as completed and update the patient care program.</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Care Plan Title (Optional)</label>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder="Example: Lower Back Recovery Plan"
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Target Sessions</label>
              <input
                type="number"
                min="1"
                max="30"
                value={totalSessions}
                onChange={(e) => setTotalSessions(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Session Notes (Optional)</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Add progress, focus areas, and next-step notes"
                className="w-full h-24 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={closeCompleteModal} className="flex-1">Cancel</Button>
              <Button onClick={handleComplete} className="flex-1">Confirm</Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </TherapistLayout>
  );
}

