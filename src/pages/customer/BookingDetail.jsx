import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/currency';
import { BOOKING_STATUS } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import Modal from '../../components/ui/Modal';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { getBookingById, getUserById, updateBooking, cancelBooking } = useData();
  const notify = useNotification();

  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const booking = getBookingById(bookingId);
  const therapist = booking ? getUserById(booking.therapistId) : null;

  if (!booking) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <p className="text-slate-600 dark:text-zinc-400">Booking not found</p>
          <Button onClick={() => navigate('/customer/bookings')} className="mt-4">Back to Bookings</Button>
        </div>
      </CustomerLayout>
    );
  }

  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'primary',
    cancelled: 'danger'
  };

  const handleCancel = () => {
    cancelBooking(booking.id);
    notify.success('Booking cancelled');
    navigate('/customer/bookings');
  };

  const handleReview = () => {
    if (rating === 0) {
      notify.error('Please select a rating');
      return;
    }
    setLoading(true);
    
    updateBooking(booking.id, { rating, review });
    
    setTimeout(() => {
      setLoading(false);
      setReviewModal(false);
      notify.success('Review submitted successfully');
    }, 500);
  };

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customer/bookings')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800">
            <svg className="w-5 h-5 text-slate-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Booking Details</h1>
            <p className="text-slate-600 dark:text-zinc-400">View your appointment information</p>
          </div>
        </div>

        <Card variant="feature">
          <div className="flex items-center justify-between mb-6">
            <Badge variant={statusColors[booking.status]} size="lg">{booking.status}</Badge>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Booking ID: {booking.id.slice(0, 8)}</p>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl mb-6">
            <Avatar src={therapist?.profilePhoto} alt={booking.therapistName} size="xl" verified={therapist?.verified} />
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{booking.therapistName}</h3>
              <p className="text-slate-600 dark:text-zinc-400">{therapist?.specialization}</p>
              {therapist?.rating && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={therapist.rating} size="sm" />
                  <span className="text-sm text-slate-600 dark:text-zinc-400">{therapist.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-zinc-400">Date & Time</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100">{formatDate(booking.date)}</p>
              <p className="text-slate-600 dark:text-zinc-300">{formatTime(booking.time)} ({booking.duration} min)</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <p className="text-sm text-slate-500 dark:text-zinc-400">Visit Type</p>
              <p className="font-semibold text-slate-800 dark:text-zinc-100 capitalize">{booking.visitType}</p>
              <p className="text-slate-600 dark:text-zinc-300">
                {booking.visitType === 'home' ? 'Home visit' : booking.visitType === 'online' ? 'Video call' : 'At clinic'}
              </p>
            </div>
          </div>

          {booking.notes && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl mb-6">
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-1">Notes</p>
              <p className="text-slate-800 dark:text-zinc-100">{booking.notes}</p>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-zinc-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600 dark:text-zinc-400">Session Fee</span>
              <span className="text-xl font-bold text-slate-800 dark:text-zinc-100">{formatCurrency(booking.price)}</span>
            </div>
          </div>

          {booking.rating && (
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-6 mt-6">
              <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-2">Your Review</h4>
              <StarRating rating={booking.rating} size="md" />
              {booking.review && <p className="text-slate-600 dark:text-zinc-300 mt-2">{booking.review}</p>}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            {booking.status === BOOKING_STATUS.COMPLETED && !booking.rating && (
              <Button onClick={() => setReviewModal(true)} className="flex-1">Leave Review</Button>
            )}
            {(booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.CONFIRMED) && (
              <Button variant="danger" onClick={handleCancel} className="flex-1">Cancel Booking</Button>
            )}
          </div>
        </Card>

        <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Leave a Review" size="md">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-600 dark:text-zinc-400 mb-4">How was your session with {booking.therapistName}?</p>
              <StarRating rating={rating} onChange={setRating} editable size="lg" className="justify-center" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Your Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                className="w-full h-24 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button onClick={handleReview} loading={loading} className="w-full">Submit Review</Button>
          </div>
        </Modal>
      </motion.div>
    </CustomerLayout>
  );
}
