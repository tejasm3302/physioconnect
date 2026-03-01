import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useData } from '../../context/DataContext';
import { isTherapistListable } from '../../utils/subscriptionUtils';
import { formatCurrency } from '../../utils/currency';
import { SPECIALIZATIONS } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import StarRating from '../../components/ui/StarRating';
import EmptyState from '../../components/ui/EmptyState';

export default function BrowseTherapists() {
  const { getTherapists } = useData();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const allTherapists = getTherapists() || [];
  
  const listableTherapists = useMemo(() => {
    return allTherapists.filter(t => isTherapistListable(t));
  }, [allTherapists]);

  const filteredTherapists = useMemo(() => {
    let result = [...listableTherapists];
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.fullName.toLowerCase().includes(searchLower) ||
        t.specialization?.toLowerCase().includes(searchLower)
      );
    }
    
    if (specialty) {
      result = result.filter(t => t.specialization === specialty);
    }
    
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    } else if (sortBy === 'experience') {
      result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    }
    
    return result;
  }, [listableTherapists, search, specialty, sortBy]);

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Find a Therapist</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Browse verified physiotherapists and book your appointment</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            placeholder="Search by name or specialty..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <Select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
            placeholder="All Specializations"
            className="md:w-56"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'rating', label: 'Highest Rated' },
              { value: 'price_low', label: 'Price: Low to High' },
              { value: 'price_high', label: 'Price: High to Low' },
              { value: 'experience', label: 'Most Experienced' }
            ]}
            placeholder="Sort By"
            className="md:w-48"
          />
        </div>

        {filteredTherapists.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {filteredTherapists.map((therapist, index) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="feature" hover className="h-full flex flex-col">
                  <div className="text-center mb-4">
                    <Avatar
                      src={therapist.profilePhoto}
                      alt={therapist.fullName}
                      size="xl"
                      verified={therapist.verified}
                      ring
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{therapist.fullName}</h3>
                    <Badge variant="primary" className="mt-2">{therapist.specialization || 'General'}</Badge>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <StarRating rating={therapist.rating || 0} size="sm" />
                      <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {therapist.rating?.toFixed(1) || '0.0'} ({therapist.totalReviews || 0} reviews)
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-zinc-400 text-center line-clamp-2">
                      {therapist.bio || 'Experienced physiotherapist ready to help you recover.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-zinc-400">
                      <span>Experience</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-100">{therapist.experience || 0} years</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600 dark:text-zinc-400">Session Fee</span>
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(therapist.hourlyRate || 0)}
                      </span>
                    </div>
                    <Link to={`/customer/book/${therapist.id}`}>
                      <Button className="w-full">Book Appointment</Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            title="No therapists found"
            description="Try adjusting your search or filters to find therapists"
          />
        )}
      </motion.div>
    </CustomerLayout>
  );
}
