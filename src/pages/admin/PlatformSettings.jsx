import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { useBranding } from '../../context/BrandingContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function PlatformSettings() {
  const { branding, updateBranding, resetBranding } = useBranding();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: branding.companyName || '',
    tagline: branding.tagline || '',
    contactEmail: branding.contactEmail || '',
    contactPhone: branding.contactPhone || '',
    primaryColor: branding.primaryColor || '#0d9488',
    accentColor: branding.accentColor || '#fbbf24'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      updateBranding(formData);
      setLoading(false);
      notify.success('Settings updated successfully');
    }, 500);
  };

  const handleReset = () => {
    resetBranding();
    setFormData({
      companyName: 'PhysioConnect',
      tagline: 'Find Your Perfect Physiotherapist',
      contactEmail: 'support@physioconnect.com',
      contactPhone: '+91 98765 43210',
      primaryColor: '#0d9488',
      accentColor: '#fbbf24'
    });
    notify.info('Settings reset to default');
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Platform Settings</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Customize your platform branding and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Branding</h3>
            <div className="space-y-5">
              <Input
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
              />
              <Input
                label="Tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="Enter tagline"
              />
            </div>
          </Card>

          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <Input
                label="Contact Email"
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="support@example.com"
              />
              <Input
                label="Contact Phone"
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
          </Card>

          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Theme Colors</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={handleChange}
                    name="primaryColor"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="accentColor"
                    value={formData.accentColor}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={handleChange}
                    name="accentColor"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="feature">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Preview</h3>
            <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-xl">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  {formData.companyName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-zinc-100">{formData.companyName}</h4>
                  <p className="text-sm text-slate-600 dark:text-zinc-400">{formData.tagline}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-zinc-900 text-sm font-medium"
                  style={{ backgroundColor: formData.accentColor }}
                >
                  Accent Button
                </button>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="ghost" onClick={handleReset} className="flex-1">
              Reset to Default
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </AdminLayout>
  );
}
