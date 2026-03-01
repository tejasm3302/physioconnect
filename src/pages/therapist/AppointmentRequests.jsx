import { useMemo } from 'react';
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
import EmptyState from '../../components/ui/EmptyState';

export default function AppointmentRequests() {
  const { user } = useAuth();
  const { getBookingsForTherapist, updateBooking, getUserById } = useData();
  const notify = useNotification();

  const bookings = getBookingsForTherapist(user?.id) || [];

  const pendingRequests = useMemo(() => {
    return bookings
      .filter(b => b.status === BOOKING_STATUS.PENDING)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bookings]);

  const handleAccept = (bookingId) => {
    updateBooking(bookingId, { status: BOOKING_STATUS.CONFIRMED });
    notify.success('Appointment confirmed');
  };

  const handleDecline = (bookingId) => {
    updateBooking(bookingId, { status: BOOKING_STATUS.CANCELLED });
    notify.info('Appointment declined');
  };

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Appointment Requests</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Review and manage incoming appointment requests</p>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((booking, index) => {
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
                        <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{booking.customerName}</h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                          {formatDate(booking.date)} at {formatTime(booking.time)} • {booking.duration} min
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="primary" size="sm" className="capitalize">{booking.visitType}</Badge>
                          {customer?.healthProfile?.conditions?.length > 0 && (
                            <Badge variant="default" size="sm">{customer.healthProfile.conditions[0]}</Badge>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2 italic">"{booking.notes}"</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                          {formatCurrency(booking.price)}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="danger" size="sm" onClick={() => handleDecline(booking.id)}>Decline</Button>
                          <Button size="sm" onClick={() => handleAccept(booking.id)}>Accept</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            title="No pending requests"
            description="New appointment requests will appear here"
          />
        )}
      </motion.div>
    </TherapistLayout>
  );
}
