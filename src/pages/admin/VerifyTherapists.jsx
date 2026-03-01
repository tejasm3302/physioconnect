import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES, STORAGE_KEYS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';
import { localDB } from '../../utils/localDB';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';

export default function VerifyTherapists() {
  const { updateUser } = useData();
  const notify = useNotification();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [therapists, setTherapists] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch therapists directly from localStorage
  const fetchTherapists = useCallback(() => {
    const allUsers = localDB.getUsers() || [];
    const therapistUsers = allUsers.filter(u => u.role === ROLES.THERAPIST);
    setTherapists(therapistUsers);
    setLastRefresh(new Date());
  }, []);

  // Initial fetch and interval
  useEffect(() => {
    fetchTherapists();
    
    // Refresh every 500ms for real-time updates on same browser
    const interval = setInterval(fetchTherapists, 500);
    
    // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.USERS) {
        fetchTherapists();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchTherapists]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchTherapists();
    notify.success('Data refreshed successfully');
  };

  const filteredTherapists = useMemo(() => {
    if (activeTab === 'pending') {
      return therapists.filter(t => !t.verified);
    }
    return therapists.filter(t => t.verified);
  }, [therapists, activeTab]);

  const handleVerify = (therapistId) => {
    updateUser(therapistId, { verified: true });
    notify.success('Therapist verified successfully');
    setDetailModal(false);
  };

  const handleReject = (therapistId) => {
    updateUser(therapistId, { verified: false });
    notify.info('Therapist verification rejected');
    setDetailModal(false);
  };

  const openDetails = (therapist) => {
    setSelectedTherapist(therapist);
    setDetailModal(true);
  };

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' }
  ];

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Verify Therapists</h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">Review and verify therapist credentials</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button variant="ghost" size="sm" onClick={handleManualRefresh}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="stat" className="text-center">
            <p className="text-2xl font-bold text-amber-600">{therapists.filter(t => !t.verified).length}</p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Pending</p>
          </Card>
          <Card variant="stat" className="text-center">
            <p className="text-2xl font-bold text-green-600">{therapists.filter(t => t.verified).length}</p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Verified</p>
          </Card>
          <Card variant="stat" className="text-center">
            <p className="text-2xl font-bold text-blue-600">{therapists.length}</p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">Total</p>
          </Card>
          <Card variant="stat" className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {therapists.filter(t => {
                const today = new Date();
                const created = new Date(t.createdAt);
                const diffDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </p>
            <p className="text-sm text-slate-600 dark:text-zinc-400">New This Week</p>
          </Card>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {filteredTherapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist, index) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="feature" className="h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar src={therapist.profilePhoto} alt={therapist.fullName} size="xl" verified={therapist.verified} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 dark:text-zinc-100">{therapist.fullName}</h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-400">{therapist.specialization || 'General'}</p>
                      <Badge variant={therapist.verified ? 'success' : 'warning'} size="sm" className="mt-2">
                        {therapist.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400">Email</span>
                      <span className="text-slate-800 dark:text-zinc-100">{therapist.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400">Experience</span>
                      <span className="text-slate-800 dark:text-zinc-100">{therapist.experience || 0} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-zinc-400">Joined</span>
                      <span className="text-slate-800 dark:text-zinc-100">{formatDate(therapist.createdAt)}</span>
                    </div>
                  </div>

                  <Button variant="ghost" onClick={() => openDetails(therapist)} className="w-full">
                    View Details
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
            title={activeTab === 'pending' ? 'No pending verifications' : 'No verified therapists'}
            description={activeTab === 'pending' ? 'All therapists have been reviewed' : 'Verified therapists will appear here'}
          />
        )}

        <Modal
          isOpen={detailModal}
          onClose={() => setDetailModal(false)}
          title="Therapist Details"
          size="lg"
        >
          {selectedTherapist && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar src={selectedTherapist.profilePhoto} alt={selectedTherapist.fullName} size="2xl" verified={selectedTherapist.verified} />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{selectedTherapist.fullName}</h3>
                  <p className="text-slate-600 dark:text-zinc-400">{selectedTherapist.specialization}</p>
                  <Badge variant={selectedTherapist.verified ? 'success' : 'warning'} className="mt-2">
                    {selectedTherapist.verified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Email</p>
                  <p className="font-medium text-slate-800 dark:text-zinc-100">{selectedTherapist.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Phone</p>
                  <p className="font-medium text-slate-800 dark:text-zinc-100">{selectedTherapist.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Experience</p>
                  <p className="font-medium text-slate-800 dark:text-zinc-100">{selectedTherapist.experience || 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Hourly Rate</p>
                  <p className="font-medium text-slate-800 dark:text-zinc-100">₹{selectedTherapist.hourlyRate || 0}</p>
                </div>
              </div>

              {selectedTherapist.bio && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Bio</p>
                  <p className="text-slate-800 dark:text-zinc-100">{selectedTherapist.bio}</p>
                </div>
              )}

              {selectedTherapist.degreePhoto && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Degree Certificate</p>
                  <img
                    src={selectedTherapist.degreePhoto}
                    alt="Degree Certificate"
                    className="w-52 aspect-[3/4] rounded-lg border-2 border-slate-200 dark:border-zinc-700 shadow-md object-cover cursor-zoom-in hover:shadow-xl transition-shadow"
                  />
                </div>
              )}

              {!selectedTherapist.verified && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-zinc-700">
                  <Button variant="danger" onClick={() => handleReject(selectedTherapist.id)} className="flex-1">
                    Reject
                  </Button>
                  <Button onClick={() => handleVerify(selectedTherapist.id)} className="flex-1">
                    Verify Therapist
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}
