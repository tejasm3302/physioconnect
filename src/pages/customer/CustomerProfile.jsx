import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import localDB from '../../utils/localDB';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import ImageUpload from '../../components/ui/ImageUpload';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [healthProfile, setHealthProfile] = useState({
    age: user?.healthProfile?.age || '',
    gender: user?.healthProfile?.gender || '',
    height: user?.healthProfile?.height || '',
    weight: user?.healthProfile?.weight || '',
    conditions: user?.healthProfile?.conditions?.join(', ') || '',
    medications: user?.healthProfile?.medications?.join(', ') || '',
    allergies: user?.healthProfile?.allergies?.join(', ') || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHealthChange = (e) => {
    setHealthProfile({ ...healthProfile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (base64) => {
    setProfilePhoto(base64);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedHealthProfile = {
      age: parseInt(healthProfile.age) || 0,
      gender: healthProfile.gender,
      height: healthProfile.height,
      weight: healthProfile.weight,
      conditions: healthProfile.conditions.split(',').map(s => s.trim()).filter(Boolean),
      medications: healthProfile.medications.split(',').map(s => s.trim()).filter(Boolean),
      allergies: healthProfile.allergies.split(',').map(s => s.trim()).filter(Boolean)
    };

    setTimeout(() => {
      updateUser({
        ...formData,
        profilePhoto,
        healthProfile: updatedHealthProfile,
        profileCompleted: true
      });
      setLoading(false);
      notify.success('Profile updated successfully');
    }, 500);
  };

  return (
    <CustomerLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">My Profile</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage your account and health information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="feature">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <ImageUpload
                currentImage={profilePhoto}
                onImageChange={handlePhotoChange}
                label=""
                size="lg"
                aspectRatio="square"
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">{user?.fullName}</h3>
                <p className="text-slate-600 dark:text-zinc-400">{user?.email}</p>
                <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4">Personal Information</h4>
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
              <Input label="Phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </Card>

          <Card variant="feature">
            <h4 className="font-semibold text-slate-800 dark:text-zinc-100 mb-4">Health Profile</h4>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">This information helps therapists provide better care</p>
            
            <div className="grid md:grid-cols-2 gap-5">
              <Input label="Age" type="number" name="age" value={healthProfile.age} onChange={handleHealthChange} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Gender</label>
                <select
                  name="gender"
                  value={healthProfile.gender}
                  onChange={handleHealthChange}
                  className="w-full h-12 py-3 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input label="Height" name="height" placeholder="e.g., 175 cm" value={healthProfile.height} onChange={handleHealthChange} />
              <Input label="Weight" name="weight" placeholder="e.g., 70 kg" value={healthProfile.weight} onChange={handleHealthChange} />
            </div>

            <div className="space-y-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Medical Conditions</label>
                <textarea
                  name="conditions"
                  value={healthProfile.conditions}
                  onChange={handleHealthChange}
                  placeholder="List your conditions, separated by commas"
                  className="w-full h-20 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Current Medications</label>
                <textarea
                  name="medications"
                  value={healthProfile.medications}
                  onChange={handleHealthChange}
                  placeholder="List your medications, separated by commas"
                  className="w-full h-20 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Allergies</label>
                <textarea
                  name="allergies"
                  value={healthProfile.allergies}
                  onChange={handleHealthChange}
                  placeholder="List your allergies, separated by commas"
                  className="w-full h-20 p-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 resize-none"
                />
              </div>
            </div>
          </Card>

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
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
              <Button type="submit" loading={pwdLoading} size="sm">Update Password</Button>
            </form>
          )}
        </Card>
      </motion.div>
    </CustomerLayout>
  );
}
