import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { localDB } from '../../utils/localDB';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/currency';
import { getDateRange, formatTime } from '../../utils/formatDate';
import { calculateBookingCharges } from '../../utils/pricing';
import { VISIT_TYPES } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import clsx from 'clsx';

export default function BookTherapist() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserById, createBooking, getBookingsForTherapist, getBookingsForCustomer, getActiveRelationship } = useData();
  const notify = useNotification();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [visitType, setVisitType] = useState(VISIT_TYPES.CLINIC);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformFeeSettings, setPlatformFeeSettings] = useState({ enabled: false, percentage: 0 });

  useEffect(() => {
    const settings = localDB.getPlatformFeeSettings();
    setPlatformFeeSettings(settings);
  }, []);

  const therapist = getUserById(therapistId);
  const existingBookings = getBookingsForTherapist(therapistId) || [];
  const customerBookings = getBookingsForCustomer(user?.id) || [];
  const dates = getDateRange(14);
  const relationship = getActiveRelationship(user?.id, therapistId);
  const hasActiveRelationship = !!relationship;
  const hasCompletedWithTherapist = customerBookings.some(
    b => b.therapistId === therapistId && b.status === 'completed'
  );

  const availableSlots = useMemo(() => {
    if (!selectedDate || !therapist?.availability) return [];
    
    const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = therapist.availability.find(a => a.day === dayName);
    if (!dayAvailability) return [];

    const bookedTimes = existingBookings
      .filter(b => b.date === selectedDate && b.status !== 'cancelled')
      .map(b => b.time);

    return dayAvailability.slots.filter(slot => !bookedTimes.includes(slot));
  }, [selectedDate, therapist, existingBookings]);

  const charges = calculateBookingCharges({
    hourlyRate: therapist?.hourlyRate || 0,
    visitType,
    platformFeeSettings,
    hasActiveRelationship
  });
  const { therapistFee, platformFee, totalAmount, loyaltyDiscount } = charges;

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      notify.error('Please select a date and time');
      return;
    }

    setLoading(true);
    
    const booking = createBooking({
      customerId: user.id,
      customerName: user.fullName,
      therapistId: therapist.id,
      therapistName: therapist.fullName,
      date: selectedDate,
      time: selectedTime,
      duration: 60,
      visitType,
      therapistFee: therapistFee,
      platformFee: platformFee,
      platformFeePercent: platformFeeSettings.percentage,
      price: totalAmount,
      notes
    });

    setTimeout(() => {
      setLoading(false);
      notify.success('Appointment booked successfully! Your care continuity stays managed via PhysioConnect.');
      navigate('/customer/bookings');
    }, 1000);
  };

  if (!therapist) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <p className="text-slate-600 dark:text-zinc-400">Therapist not found</p>
          <Button onClick={() => navigate('/customer/browse')} className="mt-4">Browse Therapists</Button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Book Appointment</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Schedule your session with {therapist.fullName}</p>
        </div>

        {hasActiveRelationship && (
          <Card variant="feature" className="border-primary-200 dark:border-primary-800">
            <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
              Your care plan is managed via PhysioConnect. Instant rebooking and loyalty platform-fee benefits are active.
            </p>
          </Card>
        )}

        {!hasActiveRelationship && hasCompletedWithTherapist && (
          <Card variant="feature" className="border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your previous managed care relationship has expired. Continue through discovery to start a new 30-day care relationship.
            </p>
          </Card>
        )}

        {/* Progress Steps */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                step >= s ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400'
              )}>
                {s}
              </div>
              <span className={clsx(
                'text-sm font-medium hidden sm:inline',
                step >= s ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-zinc-500'
              )}>
                {s === 1 ? 'Select Date' : s === 2 ? 'Select Time' : 'Confirm'}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-slate-200 dark:bg-zinc-700 hidden sm:block" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Therapist Info */}
          <Card variant="feature" className="lg:col-span-1">
            <div className="text-center">
              <Avatar src={therapist.profilePhoto} alt={therapist.fullName} size="xl" verified={therapist.verified} ring className="mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{therapist.fullName}</h3>
              <Badge variant="primary" className="mt-2">{therapist.specialization}</Badge>
              <div className="flex items-center justify-center gap-2 mt-3">
                <StarRating rating={therapist.rating || 0} size="sm" />
                <span className="text-sm text-slate-600 dark:text-zinc-400">{therapist.rating?.toFixed(1)}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-4">{therapist.bio}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                <p className="text-sm text-slate-600 dark:text-zinc-400">Session Fee</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(therapist.hourlyRate)}</p>
              </div>
            </div>
          </Card>

          {/* Booking Form */}
          <Card variant="feature" className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Select Date</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                      className={clsx(
                        'p-3 rounded-xl text-center transition-colors border-2',
                        selectedDate === d.date
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-primary-300 dark:hover:border-primary-700'
                      )}
                    >
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{d.dayShort}</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-zinc-100">{d.dateNum}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{d.month}</p>
                    </button>
                  ))}
                </div>
                <Button onClick={() => setStep(2)} disabled={!selectedDate} className="w-full">Continue</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Select Time</h3>
                  <button onClick={() => setStep(1)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Change Date</button>
                </div>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={clsx(
                          'p-3 rounded-xl text-center font-medium transition-colors border-2',
                          selectedTime === slot
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-primary-300'
                        )}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No slots available for this date</p>
                )}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800 dark:text-zinc-100">Visit Type</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(VISIT_TYPES).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setVisitType(value)}
                        className={clsx(
                          'p-4 rounded-xl text-center transition-colors border-2',
                          visitType === value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-zinc-700 hover:border-primary-300'
                        )}
                      >
                        <span className="text-2xl">{value === 'home' ? '🏠' : value === 'clinic' ? '🏥' : '💻'}</span>
                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-100 mt-1 capitalize">{value}</p>
                        {value === 'home' && <p className="text-xs text-slate-500 dark:text-zinc-400">+₹500</p>}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setStep(3)} disabled={!selectedTime} className="w-full">Continue</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Confirm Booking</h3>
                  <button onClick={() => setStep(2)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Change Time</button>
                </div>
                
                <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-400">Date</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-100">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-400">Time</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-100">{formatTime(selectedTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-400">Visit Type</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-100 capitalize">{visitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-zinc-400">Duration</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-100">60 minutes</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-zinc-700 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-zinc-400">Therapist Fee</span>
                      <span className="font-medium text-slate-800 dark:text-zinc-100">{formatCurrency(therapistFee)}</span>
                    </div>
                    {platformFeeSettings.enabled && platformFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-zinc-400">Platform Fee ({platformFeeSettings.percentage}%)</span>
                        <span className="font-medium text-slate-800 dark:text-zinc-100">{formatCurrency(platformFee)}</span>
                      </div>
                    )}
                    {hasActiveRelationship && loyaltyDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-lime-600 dark:text-lime-400">Loyalty Benefit</span>
                        <span className="font-medium text-lime-600 dark:text-lime-400">-{formatCurrency(loyaltyDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-zinc-700">
                      <span className="font-semibold text-slate-800 dark:text-zinc-100">Total Amount</span>
                      <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or any specific requirements..."
                    className="w-full h-24 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-500 text-center">
                  By booking, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/terms/customer`, '_blank')}
                    className="text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Terms & Conditions
                  </button>
                </p>

                <Button onClick={handleBooking} loading={loading} className="w-full">Confirm Booking</Button>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </CustomerLayout>
  );
}


