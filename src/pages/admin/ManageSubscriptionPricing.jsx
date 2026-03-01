import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '../../components/layout/AdminLayout';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/currency';
import localDB from '../../utils/localDB';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const defaultFeatures = [
  'Profile listing',
  'Basic analytics',
  'Email support',
  'Booking management'
];

export default function ManageSubscriptionPricing() {
  const { getSubscriptionPlans, updateSubscriptionPlans } = useData();
  const notify = useNotification();

  const [plans, setPlans] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, plan: null, isNew: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, plan: null });
  const [loading, setLoading] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    duration: '',
    tier: '',
    features: [],
    popular: false,
    bestValue: false,
    active: true,
    offerTag: '',
    originalPrice: ''
  });

  useEffect(() => {
    const storedPlans = getSubscriptionPlans() || [];
    setPlans(storedPlans);
  }, []);

  const openAddModal = () => {
    const maxTier = plans.length > 0 ? Math.max(...plans.map(p => p.tier || 0)) : 0;
    setEditForm({
      name: '',
      price: '',
      duration: '',
      tier: (maxTier + 1).toString(),
      features: [...defaultFeatures],
      popular: false,
      bestValue: false,
      active: true,
      offerTag: '',
      originalPrice: ''
    });
    setEditModal({ open: true, plan: null, isNew: true });
  };

  const openEditModal = (plan) => {
    setEditForm({
      name: plan.name || '',
      price: plan.price?.toString() || '',
      duration: plan.duration?.toString() || '',
      tier: plan.tier?.toString() || '1',
      features: plan.features || [],
      popular: plan.popular || false,
      bestValue: plan.bestValue || false,
      active: plan.active !== false,
      offerTag: plan.offerTag || '',
      originalPrice: plan.originalPrice?.toString() || ''
    });
    setEditModal({ open: true, plan, isNew: false });
  };

  const openDeleteModal = (plan) => {
    setDeleteModal({ open: true, plan });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditForm({ ...editForm, features: [...editForm.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setEditForm({
      ...editForm,
      features: editForm.features.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    if (!editForm.name.trim()) {
      notify.error('Please enter a plan name');
      return;
    }
    if (!editForm.price || parseInt(editForm.price) <= 0) {
      notify.error('Please enter a valid price');
      return;
    }
    if (!editForm.duration || parseInt(editForm.duration) <= 0) {
      notify.error('Please enter a valid duration');
      return;
    }
    if (editForm.features.length === 0) {
      notify.error('Please add at least one feature');
      return;
    }

    setLoading(true);

    const planData = {
      id: editModal.isNew ? uuidv4() : editModal.plan.id,
      name: editForm.name.trim(),
      price: parseInt(editForm.price),
      duration: parseInt(editForm.duration),
      tier: parseInt(editForm.tier) || 1,
      features: editForm.features,
      popular: editForm.popular,
      bestValue: editForm.bestValue,
      active: editForm.active,
      offerTag: editForm.offerTag.trim() || null,
      originalPrice: editForm.originalPrice ? parseInt(editForm.originalPrice) : null,
      createdAt: editModal.isNew ? new Date().toISOString() : editModal.plan.createdAt,
      updatedAt: new Date().toISOString()
    };

    let updatedPlans;
    if (editModal.isNew) {
      updatedPlans = [...plans, planData];
    } else {
      updatedPlans = plans.map(p => p.id === editModal.plan.id ? planData : p);
    }

    // If this plan is marked as popular, unmark others
    if (planData.popular) {
      updatedPlans = updatedPlans.map(p => ({
        ...p,
        popular: p.id === planData.id ? true : false
      }));
    }

    // If this plan is marked as bestValue, unmark others
    if (planData.bestValue) {
      updatedPlans = updatedPlans.map(p => ({
        ...p,
        bestValue: p.id === planData.id ? true : false
      }));
    }

    // Sort by tier
    updatedPlans.sort((a, b) => (a.tier || 0) - (b.tier || 0));

    setTimeout(() => {
      setPlans(updatedPlans);
      updateSubscriptionPlans(updatedPlans);
      localDB.setSubscriptionPlans(updatedPlans);
      setLoading(false);
      setEditModal({ open: false, plan: null, isNew: false });
      notify.success(editModal.isNew ? 'Plan created successfully!' : 'Plan updated successfully!');
    }, 500);
  };

  const handleDelete = () => {
    // Check if any therapist has this plan
    const users = localDB.getUsers() || [];
    const subscribedTherapists = users.filter(
      u => u.role === 'therapist' && 
      u.subscription?.planId === deleteModal.plan.id &&
      u.subscription?.status === 'active'
    );

    if (subscribedTherapists.length > 0) {
      notify.error(`Cannot delete: ${subscribedTherapists.length} therapist(s) are currently subscribed to this plan`);
      setDeleteModal({ open: false, plan: null });
      return;
    }

    if (plans.length <= 1) {
      notify.error('Cannot delete: At least one plan must exist');
      setDeleteModal({ open: false, plan: null });
      return;
    }

    setLoading(true);
    const updatedPlans = plans.filter(p => p.id !== deleteModal.plan.id);

    setTimeout(() => {
      setPlans(updatedPlans);
      updateSubscriptionPlans(updatedPlans);
      localDB.setSubscriptionPlans(updatedPlans);
      setLoading(false);
      setDeleteModal({ open: false, plan: null });
      notify.success('Plan deleted successfully!');
    }, 500);
  };

  const togglePlanStatus = (plan) => {
    const updatedPlans = plans.map(p =>
      p.id === plan.id ? { ...p, active: !p.active } : p
    );
    setPlans(updatedPlans);
    updateSubscriptionPlans(updatedPlans);
    localDB.setSubscriptionPlans(updatedPlans);
    notify.success(`Plan ${plan.active ? 'deactivated' : 'activated'} successfully`);
  };

  const duplicatePlan = (plan) => {
    const maxTier = Math.max(...plans.map(p => p.tier || 0));
    const newPlan = {
      ...plan,
      id: uuidv4(),
      name: `${plan.name} (Copy)`,
      tier: maxTier + 1,
      popular: false,
      bestValue: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedPlans = [...plans, newPlan].sort((a, b) => (a.tier || 0) - (b.tier || 0));
    setPlans(updatedPlans);
    updateSubscriptionPlans(updatedPlans);
    localDB.setSubscriptionPlans(updatedPlans);
    notify.success('Plan duplicated successfully!');
  };

  const activePlans = plans.filter(p => p.active !== false);
  const inactivePlans = plans.filter(p => p.active === false);

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Subscription Plans</h1>
            <p className="text-slate-600 dark:text-zinc-400 mt-1">
              Manage subscription plans, pricing, and special offers
            </p>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Plan
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="stat">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Total Plans</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{plans.length}</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Active Plans</p>
            <p className="text-2xl font-bold text-lime-600">{activePlans.length}</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Inactive Plans</p>
            <p className="text-2xl font-bold text-amber-600">{inactivePlans.length}</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-slate-500 dark:text-zinc-400">Special Offers</p>
            <p className="text-2xl font-bold text-primary-600">{plans.filter(p => p.offerTag).length}</p>
          </Card>
        </div>

        {/* Active Plans */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Active Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {activePlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative ${(plan.popular || plan.bestValue || plan.offerTag) ? 'mt-8' : ''}`}
                >
                  {/* Badges with improved visibility */}
                  {(plan.popular || plan.bestValue || plan.offerTag) && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {plan.popular && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-full shadow-xl border-2 border-white dark:border-zinc-800 whitespace-nowrap">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Popular
                          </span>
                        </div>
                      )}
                      {plan.bestValue && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-lime-500 to-green-500 text-white text-sm font-bold rounded-full shadow-xl border-2 border-white dark:border-zinc-800 whitespace-nowrap">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Best Value
                          </span>
                        </div>
                      )}
                      {plan.offerTag && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-xl border-2 border-white dark:border-zinc-800 animate-pulse whitespace-nowrap">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {plan.offerTag}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Card 
                    variant="pricing" 
                    className={`${plan.popular ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20' : ''} ${plan.bestValue ? 'ring-2 ring-lime-500 shadow-lg shadow-lime-500/20' : ''} ${plan.offerTag && !plan.popular && !plan.bestValue ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''}`}
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{plan.name}</h3>
                      <div className="mt-3">
                        {plan.originalPrice && (
                          <span className="text-lg text-slate-400 line-through mr-2">
                            {formatCurrency(plan.originalPrice)}
                          </span>
                        )}
                        <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm">{plan.duration} days</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {formatCurrency(Math.round(plan.price / plan.duration))}/day
                      </p>
                    </div>

                    <ul className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-400">
                          <svg className="w-4 h-4 text-lime-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-primary-500">+{plan.features.length - 5} more features</li>
                      )}
                    </ul>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(plan)} className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicatePlan(plan)} title="Duplicate">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => togglePlanStatus(plan)} title="Deactivate">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Inactive Plans */}
        {inactivePlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Inactive Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inactivePlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="relative"
                >
                  <Card variant="pricing" className="border-2 border-dashed border-slate-300 dark:border-zinc-600">
                    <div className="absolute top-2 right-2">
                      <Badge variant="default">Inactive</Badge>
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-slate-500 dark:text-zinc-400">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-slate-400">
                          {formatCurrency(plan.price)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{plan.duration} days</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(plan)} className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => togglePlanStatus(plan)} className="flex-1">
                        Activate
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDeleteModal(plan)} title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary Table */}
        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Pricing Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Plan</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Price</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Duration</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Price/Day</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Status</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Offer</th>
                  <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                {plans.map((plan) => (
                  <tr key={plan.id} className={plan.active === false ? 'opacity-50' : ''}>
                    <td className="py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-800 dark:text-zinc-100">{plan.name}</span>
                        {plan.popular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Popular
                          </span>
                        )}
                        {plan.bestValue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-lime-500 to-green-500 text-white text-xs font-semibold rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Best
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {plan.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">{formatCurrency(plan.originalPrice)}</span>
                        )}
                        <span className="text-slate-800 dark:text-zinc-100">{formatCurrency(plan.price)}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-zinc-400">{plan.duration} days</td>
                    <td className="py-3 text-slate-600 dark:text-zinc-400">{formatCurrency(Math.round(plan.price / plan.duration))}</td>
                    <td className="py-3">
                      <Badge variant={plan.active !== false ? 'success' : 'default'}>
                        {plan.active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {plan.offerTag ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-sm">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {plan.offerTag}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => togglePlanStatus(plan)}
                          className={`p-1 rounded ${plan.active !== false ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-lime-600 hover:bg-lime-50 dark:hover:bg-lime-900/20'}`}
                        >
                          {plan.active !== false ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        {plan.active === false && (
                          <button
                            onClick={() => openDeleteModal(plan)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tips Card */}
        <Card variant="feature" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tips for Festival Offers</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Create a new plan with a festive name (e.g., "Diwali Special", "New Year Offer")</li>
                <li>• Add an offer tag to highlight the discount</li>
                <li>• Set the original price to show the discount</li>
                <li>• Mark it as "Popular" or "Best Value" to attract attention</li>
                <li>• Deactivate it after the festival to hide without deleting</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={editModal.open}
          onClose={() => setEditModal({ open: false, plan: null, isNew: false })}
          title={editModal.isNew ? 'Create New Plan' : `Edit ${editModal.plan?.name} Plan`}
          size="lg"
        >
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plan Name *"
                placeholder="e.g., Monthly, Diwali Special"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label="Tier (for sorting)"
                type="number"
                min="1"
                placeholder="1"
                value={editForm.tier}
                onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹) *"
                type="number"
                min="1"
                placeholder="599"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
              <Input
                label="Duration (days) *"
                type="number"
                min="1"
                placeholder="30"
                value={editForm.duration}
                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
              />
            </div>

            {/* Offer Settings */}
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-5">
              <h4 className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">Offer Settings (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Offer Tag"
                  placeholder="e.g., 20% OFF, Diwali Special"
                  value={editForm.offerTag}
                  onChange={(e) => setEditForm({ ...editForm, offerTag: e.target.value })}
                />
                <Input
                  label="Original Price (₹)"
                  type="number"
                  placeholder="Show strike-through price"
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-5">
              <h4 className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">Badges</h4>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.popular}
                    onChange={(e) => setEditForm({ ...editForm, popular: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">Mark as Popular</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Popular
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.bestValue}
                    onChange={(e) => setEditForm({ ...editForm, bestValue: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">Mark as Best Value</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-lime-500 to-green-500 text-white text-xs font-semibold rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Best Value
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-lime-600 focus:ring-lime-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">Active (visible to users)</span>
                </label>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-slate-200 dark:border-zinc-700 pt-5">
              <h4 className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">Features *</h4>
              <div className="space-y-3">
                {editForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                      <svg className="w-4 h-4 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-zinc-300">{feature}</span>
                    </div>
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg text-sm bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button size="sm" variant="ghost" onClick={addFeature}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-zinc-700">
            <Button 
              variant="ghost" 
              onClick={() => setEditModal({ open: false, plan: null, isNew: false })} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              {editModal.isNew ? 'Create Plan' : 'Save Changes'}
            </Button>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, plan: null })}
          title="Delete Plan"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Delete "{deleteModal.plan?.name}" Plan?
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Note: You can only delete inactive plans with no active subscribers.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ open: false, plan: null })} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              loading={loading} 
              className="flex-1"
            >
              Delete Plan
            </Button>
          </div>
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}
