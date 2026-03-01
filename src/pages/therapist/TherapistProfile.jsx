import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import localDB from '../../utils/localDB';
import { SPECIALIZATIONS, DAYS_OF_WEEK, TIME_SLOTS } from '../../config/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ImageUpload from '../../components/ui/ImageUpload';
import clsx from 'clsx';

export default function TherapistProfile() {
  const { user, updateUser } = useAuth();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [degreePhoto, setDegreePhoto] = useState(user?.degreePhoto || null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    hourlyRate: user?.hourlyRate || '',
    bio: user?.bio || ''
  });

  const [availability, setAvailability] = useState(user?.availability || []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleDay = (day) => {
    const existing = availability.find(a => a.day === day);
    if (existing) {
      setAvailability(availability.filter(a => a.day !== day));
    } else {
      setAvailability([...availability, { day, slots: [] }]);
    }
  };

  const toggleSlot = (day, slot) => {
    const dayAvail = availability.find(a => a.day === day);
    if (!dayAvail) return;

    const hasSlot = dayAvail.slots.includes(slot);
    const newSlots = hasSlot
      ? dayAvail.slots.filter(s => s !== slot)
      : [...dayAvail.slots, slot].sort();

    setAvailability(availability.map(a =>
      a.day === day ? { ...a, slots: newSlots } : a
    ));
  };

  const handlePhotoChange = (base64) => {
    setProfilePhoto(base64);
  };

  const handleDegreeChange = (base64) => {
    setDegreePhoto(base64);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      updateUser({
        ...formData,
        profilePhoto,
        degreePhoto,
        experience: parseInt(formData.experience) || 0,
        hourlyRate: parseInt(formData.hourlyRate) || 0,
        availability
      });
      setLoading(false);
      notify.success('Profile updated successfully');
    }, 500);
  };

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">My Profile</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage your professional profile</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          {['profile', 'availability'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors capitalize',
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'profile' && (
            <>
              <Card variant="feature">
                <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <ImageUpload
                      currentImage={profilePhoto}
                      onImageChange={handlePhotoChange}
                      label="Profile Photo"
                      size="lg"
                      aspectRatio="square"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{user?.fullName}</h3>
                    <p className="text-slate-600 dark:text-zinc-400">{user?.specialization}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={user?.verified ? 'success' : 'warning'}>
                        {user?.verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </div>
                    
                    <div className="mt-4">
                      <ImageUpload
                        currentImage={degreePhoto}
                        onImageChange={handleDegreeChange}
                        label="Degree Certificate (Required for Verification)"
                        aspectRatio="certificate"
                      />
                    </div>
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4">Personal Information</h4>
                <div className="grid md:grid-cols-2 gap-5">
                  <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                  <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  <Input label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Clinic Address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </Card>

              <Card variant="feature">
                <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4">Professional Details</h4>
                <div className="grid md:grid-cols-2 gap-5">
                  <Select
                    label="Specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    options={SPECIALIZATIONS.map(s => ({ value: s, label: s }))}
                  />
                  <Input label="Years of Experience" type="number" name="experience" value={formData.experience} onChange={handleChange} />
                  <Input label="Hourly Rate (₹)" type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} />
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell patients about yourself, your experience, and your approach..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none"
                  />
                </div>
              </Card>
            </>
          )}

          {activeTab === 'availability' && (
            <Card variant="feature">
              <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4">Set Your Availability</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Select the days and time slots you're available for appointments</p>
              
              <div className="space-y-6">
                {DAYS_OF_WEEK.map((day) => {
                  const dayAvail = availability.find(a => a.day === day);
                  const isActive = !!dayAvail;

                  return (
                    <div key={day} className="border border-slate-200 dark:border-zinc-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-slate-800 dark:text-zinc-100">{day}</span>
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={clsx(
                            'w-12 h-6 rounded-full transition-colors relative',
                            isActive ? 'bg-primary-600' : 'bg-slate-300 dark:bg-zinc-600'
                          )}
                        >
                          <div className={clsx(
                            'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                            isActive ? 'translate-x-6' : 'translate-x-0.5'
                          )} />
                        </button>
                      </div>
                      {isActive && (
                        <div className="flex flex-wrap gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => toggleSlot(day, slot)}
                              className={clsx(
                                'px-3 py-1.5 text-sm rounded-lg border-2 transition-colors',
                                dayAvail.slots.includes(slot)
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                  : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-primary-300'
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Button type="submit" loading={loading} className="w-full">Save Changes</Button>
        </form>

        {/* Change Password Section */}
        <Card variant="feature">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-zinc-100">Change Password</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Update your account password</p>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              {showChangePassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showChangePassword && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (atob(user.password) !== currentPassword) {
                  toast.error('Current password is incorrect');
                  return;
                }
                if (newPassword.length < 6) {
                  toast.error('New password must be at least 6 characters');
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  toast.error('Passwords do not match');
                  return;
                }
                setPwdLoading(true);
                setTimeout(() => {
                  const users = localDB.getUsers() || [];
                  const updated = users.map(u =>
                    u.id === user.id ? { ...u, password: btoa(newPassword) } : u
                  );
                  localDB.setUsers(updated);
                  updateUser({ password: btoa(newPassword) });
                  setPwdLoading(false);
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  toast.success('Password changed successfully!');
                }, 500);
              }}
              className="space-y-4"
            >
              <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" required />
              <Input label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" required />
              <Button type="submit" loading={pwdLoading} size="sm">Update Password</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </TherapistLayout>
  );
}
