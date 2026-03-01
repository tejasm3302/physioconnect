import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import localDB from '../../utils/localDB';

export default function TherapistReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const bookings = localDB.getBookings() || [];
    const reviewed = bookings.filter(
      b => b.therapistId === user?.id && b.rating && b.rating > 0
    );
    setReviews(reviewed);
  }, [user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0
  }));

  const filtered = reviews.filter(r => {
    if (filter === 'all') return true;
    return r.rating === parseInt(filter);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const users = localDB.getUsers() || [];

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">My Reviews</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">See what patients are saying about you</p>
        </div>

        {/* Rating Summary */}
        <Card variant="feature">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center min-w-[180px]">
              <div className="text-5xl font-bold text-slate-800 dark:text-zinc-100">{avgRating}</div>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className={`w-6 h-6 ${s <= Math.round(parseFloat(avgRating)) ? 'text-amber-400' : 'text-slate-300 dark:text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-500 dark:text-zinc-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-zinc-400 w-8">{star} ★</span>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-zinc-500 w-12 text-right">{count} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {['all', '5', '4', '3', '2', '1'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                }`}
              >
                {f === 'all' ? 'All Reviews' : `${f} Stars`}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* Reviews List */}
        {sorted.length === 0 ? (
          <EmptyState
            icon={(props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
            title="No Reviews Yet"
            description={filter !== 'all' ? 'No reviews match this filter.' : 'Complete sessions to receive reviews from patients.'}
          />
        ) : (
          <div className="space-y-4">
            {sorted.map((review, idx) => {
              const customer = users.find(u => u.id === review.customerId);
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card variant="list">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={customer?.profilePhoto}
                        alt={review.customerName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-zinc-100">{review.customerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <Badge variant={
                                review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'
                              }>
                                {review.rating}.0
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-zinc-500">
                            {new Date(review.date || review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </div>
                        </div>
                        {review.review && (
                          <p className="mt-3 text-slate-600 dark:text-zinc-400 leading-relaxed">
                            "{review.review}"
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-lg">
                            {review.visitType || 'In-Person'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-lg">
                            {review.duration || 60} mins
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </TherapistLayout>
  );
}
