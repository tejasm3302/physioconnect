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
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Tabs from '../../components/ui/Tabs';

export default function ManageUsers() {
  const { deleteUser } = useData();
  const notify = useNotification();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });
  const [detailModal, setDetailModal] = useState({ open: false, user: null });
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch users directly from localStorage to ensure fresh data
  const fetchData = useCallback(() => {
    setUsers(localDB.getUsers() || []);
    setBookings(localDB.getBookings() || []);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchData();
    
    // Refresh every 500ms for real-time updates on same browser
    const interval = setInterval(fetchData, 500);
    
    // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.USERS || e.key === STORAGE_KEYS.BOOKINGS) {
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

  const handleManualRefresh = () => {
    fetchData();
    notify.success('Data refreshed successfully');
  };

  const getUserStats = (userId, role) => {
    const userBookings = bookings.filter(b => 
      role === ROLES.CUSTOMER ? b.customerId === userId : b.therapistId === userId
    );
    const completedBookings = userBookings.filter(b => b.status === 'completed');
    const totalSpent = role === ROLES.CUSTOMER 
      ? completedBookings.reduce((sum, b) => sum + (b.price || 0), 0)
      : completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    
    return {
      totalBookings: userBookings.length,
      completedBookings: completedBookings.length,
      pendingBookings: userBookings.filter(b => b.status === 'pending').length,
      totalAmount: totalSpent
    };
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => u.role !== ROLES.ADMIN);

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(u =>
        u.fullName.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, search, roleFilter]);

  const handleDelete = () => {
    deleteUser(deleteModal.userId);
    notify.success('User deleted successfully');
    setDeleteModal({ open: false, userId: null, userName: '' });
  };

  const openUserDetails = (user) => {
    setDetailModal({ open: true, user });
  };

  const roleColors = {
    therapist: 'primary',
    customer: 'success'
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Manage Users</h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">View and manage all platform users</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button variant="ghost" size="sm" onClick={() => {
              const csvRows = [['Name', 'Email', 'Role', 'Phone', 'Joined', 'Status', 'Total Bookings', 'Completed', 'Total Amount']];
              filteredUsers.forEach(u => {
                const stats = getUserStats(u.id, u.role);
                csvRows.push([
                  u.fullName, u.email, u.role === ROLES.CUSTOMER ? 'Patient' : 'Therapist',
                  u.phone || '', formatDate(u.createdAt),
                  u.role === ROLES.THERAPIST ? (u.verified ? 'Verified' : 'Pending') : 'Active',
                  stats.totalBookings, stats.completedBookings, stats.totalAmount
                ]);
              });
              const csv = csvRows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
              notify.success('Users exported as CSV');
            }}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={handleManualRefresh}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="stat" className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
              {users.filter(u => u.role !== ROLES.ADMIN).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Total Users</p>
          </Card>
          <Card variant="stat" className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">
              {users.filter(u => u.role === ROLES.THERAPIST).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Therapists</p>
          </Card>
          <Card variant="stat" className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === ROLES.CUSTOMER).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Patients</p>
          </Card>
          <Card variant="stat" className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {users.filter(u => u.role === ROLES.THERAPIST && !u.verified).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Pending Verification</p>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar
            placeholder="Search by name or email..."
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: ROLES.THERAPIST, label: 'Therapists' },
              { value: ROLES.CUSTOMER, label: 'Patients' }
            ]}
            placeholder="All Roles"
            className="md:w-48"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <Card variant="feature">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">User</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Role</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Email</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Bookings</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Joined</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Status</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {filteredUsers.map((user) => {
                    const stats = getUserStats(user.id, user.role);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={user.profilePhoto} alt={user.fullName} size="sm" verified={user.verified} />
                            <span className="font-medium text-slate-800 dark:text-zinc-100">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant={roleColors[user.role]} size="sm" className="capitalize">
                            {user.role === ROLES.CUSTOMER ? 'Patient' : 'Therapist'}
                          </Badge>
                        </td>
                        <td className="py-4 text-slate-600 dark:text-zinc-400">{user.email}</td>
                        <td className="py-4 text-slate-600 dark:text-zinc-400">
                          {stats.completedBookings}/{stats.totalBookings}
                        </td>
                        <td className="py-4 text-slate-600 dark:text-zinc-400">{formatDate(user.createdAt)}</td>
                        <td className="py-4">
                          {user.role === ROLES.THERAPIST ? (
                            <Badge variant={user.verified ? 'success' : 'warning'} size="sm">
                              {user.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm">Active</Badge>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUserDetails(user)}
                            >
                              View
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteModal({ open: true, userId: user.id, userName: user.fullName })}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon={(props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            title="No users found"
            description="Try adjusting your search or filters"
          />
        )}

        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, userId: null, userName: '' })}
          title="Delete User"
          size="sm"
        >
          <p className="text-slate-600 dark:text-zinc-400">
            Are you sure you want to delete <strong>{deleteModal.userName}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={() => setDeleteModal({ open: false, userId: null, userName: '' })} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete User
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={detailModal.open}
          onClose={() => setDetailModal({ open: false, user: null })}
          title="User Details"
          size="lg"
        >
          {detailModal.user && (() => {
            const user = detailModal.user;
            const stats = getUserStats(user.id, user.role);
            const userBookings = bookings.filter(b => 
              user.role === ROLES.CUSTOMER ? b.customerId === user.id : b.therapistId === user.id
            ).slice(0, 5);

            return (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar src={user.profilePhoto} alt={user.fullName} size="2xl" verified={user.verified} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{user.fullName}</h3>
                    <p className="text-slate-600 dark:text-zinc-400">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={roleColors[user.role]} className="capitalize">
                        {user.role === ROLES.CUSTOMER ? 'Patient' : 'Therapist'}
                      </Badge>
                      {user.role === ROLES.THERAPIST && (
                        <Badge variant={user.verified ? 'success' : 'warning'}>
                          {user.verified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">{stats.totalBookings}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{stats.completedBookings}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-600">{stats.pendingBookings}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary-600">₹{stats.totalAmount}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {user.role === ROLES.CUSTOMER ? 'Total Spent' : 'Total Earned'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Phone</p>
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{user.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Address</p>
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{user.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Joined</p>
                    <p className="font-medium text-slate-800 dark:text-zinc-100">{formatDate(user.createdAt)}</p>
                  </div>
                  {user.role === ROLES.THERAPIST && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Specialization</p>
                        <p className="font-medium text-slate-800 dark:text-zinc-100">{user.specialization || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Experience</p>
                        <p className="font-medium text-slate-800 dark:text-zinc-100">{user.experience || 0} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Hourly Rate</p>
                        <p className="font-medium text-slate-800 dark:text-zinc-100">₹{user.hourlyRate || 0}</p>
                      </div>
                    </>
                  )}
                  {user.role === ROLES.CUSTOMER && user.healthProfile && (
                    <>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Age</p>
                        <p className="font-medium text-slate-800 dark:text-zinc-100">{user.healthProfile.age || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Gender</p>
                        <p className="font-medium text-slate-800 dark:text-zinc-100">{user.healthProfile.gender || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>

                {user.role === ROLES.THERAPIST && user.degreePhoto && (
                  <div>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mb-2">Degree Certificate</p>
                    <img
                      src={user.degreePhoto}
                      alt="Degree Certificate"
                      className="w-40 aspect-[3/4] rounded-lg border-2 border-slate-200 dark:border-zinc-700 object-cover"
                    />
                  </div>
                )}

                {userBookings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">Recent Bookings</p>
                    <div className="space-y-2">
                      {userBookings.map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-zinc-100">
                              {user.role === ROLES.CUSTOMER ? booking.therapistName : booking.customerName}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                              {formatDate(booking.date)} at {booking.time}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              booking.status === 'completed' ? 'success' : 
                              booking.status === 'confirmed' ? 'primary' : 
                              booking.status === 'pending' ? 'warning' : 'danger'
                            }
                            size="sm"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}
