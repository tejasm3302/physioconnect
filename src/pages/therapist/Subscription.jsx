import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TherapistLayout from '../../components/layout/TherapistLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useNotification } from '../../context/NotificationContext';
import { getSubscriptionStatus } from '../../utils/subscriptionUtils';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatDate';
import { SUBSCRIPTION_STATUS } from '../../config/constants';
import localDB from '../../utils/localDB';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RazorpayModal from '../../components/payment/RazorpayModal';

export default function Subscription() {
  const { user } = useAuth();
  const { getSubscriptionPlans, getPaymentsForTherapist } = useData();
  const { subscribeToPlan, getButtonState } = useSubscription();
  const notify = useNotification();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Get plans and filter only active ones
    const allPlans = getSubscriptionPlans() || localDB.getSubscriptionPlans() || [];
    const activePlans = allPlans.filter(p => p.active !== false);
    setPlans(activePlans);
    
    // Get payments
    const userPayments = getPaymentsForTherapist(user?.id) || [];
    setPayments(userPayments);
  }, [user?.id]);

  const subscriptionStatus = getSubscriptionStatus(user?.subscription);

  const handleSelectPlan = (plan) => {
    const buttonState = getButtonState(plan);
    if (buttonState.disabled) return;
    setSelectedPlan(plan);
    setPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentMethod) => {
    subscribeToPlan(selectedPlan, paymentMethod);
    setPaymentModal(false);
    setSelectedPlan(null);
    notify.success('Subscription activated successfully!');
    
    // Refresh payments
    setTimeout(() => {
      const userPayments = getPaymentsForTherapist(user?.id) || [];
      setPayments(userPayments);
    }, 500);
  };

  const handlePaymentFailure = () => {
    notify.error('Payment failed. Please try again.');
  };

  const openReceiptInNewTab = (payment) => {
    const allPlans = getSubscriptionPlans() || localDB.getSubscriptionPlans() || [];
    const plan = allPlans.find(p => p.id === payment.planId) || {};
    const validUntil = new Date(new Date(payment.date).getTime() + (plan.duration || 30) * 24 * 60 * 60 * 1000);
    
    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Payment Receipt - PhysioConnect</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8fafc; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d9488, #0f766e); color: white; padding: 30px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .content { padding: 30px; }
    .success-badge { display: inline-block; background: #22c55e; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin-bottom: 25px; }
    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; }
    .value { font-weight: 600; color: #1e293b; }
    .amount-row { background: #f1f5f9; margin: 20px -30px; padding: 20px 30px; }
    .amount-row .value { font-size: 24px; color: #0d9488; }
    .footer { padding: 20px 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #64748b; font-size: 14px; }
    .terms { margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; }
    .terms p { color: #92400e; font-size: 13px; }
    .download-btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .download-btn:hover { background: #0f766e; }
    .savings { color: #16a34a; font-size: 14px; margin-top: 5px; }
    @media print { 
      body { padding: 0; background: white; } 
      .receipt { box-shadow: none; } 
      .download-btn { display: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>PhysioConnect</h1>
      <p>Subscription Payment Receipt</p>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 20px;">
        <span class="success-badge">✓ Payment Successful</span>
      </div>
      
      <div class="row">
        <span class="label">Transaction ID</span>
        <span class="value">${payment.paymentId}</span>
      </div>
      <div class="row">
        <span class="label">Payment Date</span>
        <span class="value">${formatDate(payment.date)}</span>
      </div>
      <div class="row">
        <span class="label">Payment Method</span>
        <span class="value" style="text-transform: uppercase;">${payment.method}</span>
      </div>
      <div class="row">
        <span class="label">Therapist Name</span>
        <span class="value">${user?.fullName || 'N/A'}</span>
      </div>
      <div class="row">
        <span class="label">Email</span>
        <span class="value">${user?.email || 'N/A'}</span>
      </div>
      
      <div class="amount-row row">
        <div>
          <span class="label" style="font-size: 18px;">Plan: ${payment.planName}</span>
          ${plan.originalPrice ? `<p class="savings">You saved ${formatCurrency(plan.originalPrice - payment.amount)}!</p>` : ''}
        </div>
        <span class="value">${formatCurrency(payment.amount)}</span>
      </div>
      
      <div class="row">
        <span class="label">Plan Duration</span>
        <span class="value">${plan.duration || 30} days</span>
      </div>
      <div class="row">
        <span class="label">Subscription Start</span>
        <span class="value">${formatDate(payment.date)}</span>
      </div>
      <div class="row">
        <span class="label">Valid Until</span>
        <span class="value">${formatDate(validUntil.toISOString())}</span>
      </div>
      
      <div class="terms">
        <p><strong>Note:</strong> This is a subscription for accessing the PhysioConnect platform. Your profile will be visible to patients during the subscription period. Please refer to our Terms of Service for full details.</p>
      </div>
      
      <div style="text-align: center;" class="no-print">
        <button class="download-btn" onclick="window.print()">📄 Download as PDF</button>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for choosing PhysioConnect!</p>
      <p style="margin-top: 10px;">For support: support@physioconnect.com | +91 98765 43210</p>
      <p style="margin-top: 10px; font-size: 12px;">Generated on ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>
</body>
</html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(receiptContent);
      newWindow.document.close();
    } else {
      notify.error('Please allow popups to view the receipt');
    }
  };

  // Calculate savings for a plan compared to monthly
  const calculateSavings = (plan) => {
    const monthlyPlan = plans.find(p => p.duration === 30 || p.name.toLowerCase().includes('monthly'));
    if (!monthlyPlan || plan.id === monthlyPlan.id) return null;
    
    const monthlyPerDay = monthlyPlan.price / monthlyPlan.duration;
    const planPerDay = plan.price / plan.duration;
    const savingsPercent = Math.round((1 - planPerDay / monthlyPerDay) * 100);
    
    return savingsPercent > 0 ? savingsPercent : null;
  };

  return (
    <TherapistLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Subscription</h1>
          <p className="text-slate-600 dark:text-zinc-400 mt-1">Manage your subscription plan</p>
        </div>

        {/* Current Status */}
        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Current Plan</h3>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
                  {user?.subscription?.planName || 'No Plan'}
                </span>
                <Badge variant={
                  subscriptionStatus.status === SUBSCRIPTION_STATUS.ACTIVE ? 'success' :
                  subscriptionStatus.status === SUBSCRIPTION_STATUS.TRIAL ? 'info' :
                  subscriptionStatus.status === SUBSCRIPTION_STATUS.EXPIRING_SOON ? 'warning' : 'danger'
                }>
                  {subscriptionStatus.status}
                </Badge>
              </div>
              {user?.subscription?.expiryDate && (
                <p className="text-slate-600 dark:text-zinc-400 mt-1">
                  Expires on {formatDate(user.subscription.expiryDate)} ({subscriptionStatus.daysRemaining} days remaining)
                </p>
              )}
              {subscriptionStatus.status === SUBSCRIPTION_STATUS.TRIAL && (
                <p className="text-slate-600 dark:text-zinc-400 mt-1">
                  Trial ends in {subscriptionStatus.daysRemaining} days
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Plans */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Available Plans</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const buttonState = getButtonState(plan);
              const savings = calculateSavings(plan);
              const hasBadges = plan.popular || plan.bestValue || plan.offerTag;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative ${hasBadges ? 'mt-6' : ''}`}
                >
                  {/* Badges Container - Enhanced with solid background and shadow */}
                  {hasBadges && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-2">
                      {plan.popular && (
                        <div className="relative">
                          {/* White backdrop for visibility */}
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl border-2 border-white dark:border-zinc-800 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Popular
                          </span>
                        </div>
                      )}
                      {plan.bestValue && (
                        <div className="relative">
                          {/* White backdrop for visibility */}
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-lime-500 to-green-600 text-white shadow-xl border-2 border-white dark:border-zinc-800 whitespace-nowrap">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Best Value
                          </span>
                        </div>
                      )}
                      {plan.offerTag && (
                        <div className="relative">
                          {/* White backdrop for visibility */}
                          <div className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full blur-sm scale-110"></div>
                          <span className="relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl border-2 border-white dark:border-zinc-800 animate-pulse whitespace-nowrap">
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                            </svg>
                            {plan.offerTag}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Card 
                    variant="pricing" 
                    className={`h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20' : ''} ${plan.bestValue ? 'ring-2 ring-lime-500 shadow-lg shadow-lime-500/20' : ''} ${plan.offerTag && !plan.popular && !plan.bestValue ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''}`}
                  >
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-slate-800 dark:text-zinc-100">{plan.name}</h4>
                      <div className="mt-4">
                        {plan.originalPrice && (
                          <span className="text-lg text-slate-400 line-through mr-2">
                            {formatCurrency(plan.originalPrice)}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="text-slate-500 dark:text-zinc-400">/{plan.duration} days</span>
                      </div>
                      {savings && (
                        <p className="text-sm text-lime-600 dark:text-lime-400 mt-1">
                          Save {savings}% vs monthly
                        </p>
                      )}
                      {plan.originalPrice && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                          You save {formatCurrency(plan.originalPrice - plan.price)}!
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-lime-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-slate-600 dark:text-zinc-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={buttonState.disabled ? 'ghost' : plan.popular ? 'primary' : 'secondary'}
                      disabled={buttonState.disabled}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                    >
                      {buttonState.label}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          
          {plans.length === 0 && (
            <Card variant="feature" className="text-center py-12">
              <p className="text-slate-500 dark:text-zinc-400">No active plans available. Please check back later.</p>
            </Card>
          )}
        </div>

        {/* Payment History */}
        <Card variant="feature">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Payment History</h3>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Plan</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Amount</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Method</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Status</th>
                    <th className="pb-3 text-sm font-medium text-slate-500 dark:text-zinc-400">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{formatDate(payment.date)}</td>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{payment.planName}</td>
                      <td className="py-3 text-slate-800 dark:text-zinc-100">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 text-slate-600 dark:text-zinc-400 uppercase text-sm">{payment.method}</td>
                      <td className="py-3"><Badge variant="success">{payment.status}</Badge></td>
                      <td className="py-3">
                        <button
                          onClick={() => openReceiptInNewTab(payment)}
                          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-zinc-400 py-8">No payment history</p>
          )}
        </Card>

        {/* Terms Notice */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            By subscribing, you agree to our{' '}
            <button
              type="button"
              onClick={() => window.open(`${window.location.origin}${window.location.pathname}#/terms/therapist`, '_blank')}
              className="underline font-medium"
            >
              Therapist Terms of Service
            </button>
            . Your profile will be visible to patients during the active subscription period. Prices may be updated by the platform administrator.
          </p>
        </div>

        <RazorpayModal
          isOpen={paymentModal}
          onClose={() => { setPaymentModal(false); setSelectedPlan(null); }}
          amount={selectedPlan?.price || 0}
          planName={selectedPlan?.name || ''}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </motion.div>
    </TherapistLayout>
  );
}
