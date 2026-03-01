import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { formatCurrency } from '../../utils/currency';
import { formatCardNumber, formatExpiry, getCardType, validateUPI } from '../../utils/validators';

const tabs = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'netbanking', label: 'NetBanking' }
];

const upiApps = [
  { id: 'gpay', name: 'Google Pay', icon: '💳' },
  { id: 'phonepe', name: 'PhonePe', icon: '📱' },
  { id: 'paytm', name: 'Paytm', icon: '💰' }
];

const banks = [
  { id: 'sbi', name: 'SBI' },
  { id: 'hdfc', name: 'HDFC' },
  { id: 'icici', name: 'ICICI' },
  { id: 'axis', name: 'Axis' },
  { id: 'kotak', name: 'Kotak' },
  { id: 'pnb', name: 'PNB' }
];

export default function RazorpayModal({ isOpen, onClose, amount, planName, onSuccess, onFailure, therapistFee = null, platformFee = null }) {
  const [activeTab, setActiveTab] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const resetForm = () => {
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setSelectedBank('');
    setTermsAccepted(false);
    setStatus(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const processPayment = () => {
    setLoading(true);
    
    setTimeout(() => {
      const success = Math.random() > 0.1;
      setLoading(false);
      setStatus(success ? 'success' : 'failed');
      
      setTimeout(() => {
        if (success) {
          onSuccess(activeTab);
        } else {
          onFailure();
        }
        handleClose();
      }, 1500);
    }, 2000);
  };

  const handlePay = () => {
    if (activeTab === 'upi' && !validateUPI(upiId)) {
      return;
    }
    if (activeTab === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      return;
    }
    if (activeTab === 'netbanking' && !selectedBank) {
      return;
    }
    processPayment();
  };

  const cardType = getCardType(cardNumber);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#072654] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-[#072654] font-bold">R</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">PhysioConnect</p>
                    <p className="text-blue-200 text-sm">{planName} Plan</p>
                  </div>
                </div>
                <button onClick={handleClose} className="text-white/70 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-[#0a3266] px-6 py-4">
              <p className="text-blue-200 text-sm">Amount to pay</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(amount)}</p>
              {therapistFee !== null && platformFee !== null && platformFee > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-400/30 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Therapist Fee</span>
                    <span className="text-white">{formatCurrency(therapistFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">Platform Fee</span>
                    <span className="text-white">{formatCurrency(platformFee)}</span>
                  </div>
                </div>
              )}
            </div>

            {status ? (
              <div className="p-12 text-center">
                {status === 'success' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <svg className="w-10 h-10 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                )}
                <p className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                  {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                </p>
                <p className="text-slate-500 dark:text-zinc-400 mt-2">
                  {status === 'success' ? 'Your subscription is now active' : 'Please try again'}
                </p>
              </div>
            ) : loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-zinc-400">Processing payment...</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-zinc-700">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        'flex-1 py-4 text-sm font-medium transition-colors relative',
                        activeTab === tab.id
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                      )}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activePaymentTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                        />
                      </div>
                      <p className="text-center text-sm text-slate-500 dark:text-zinc-400">or pay using</p>
                      <div className="grid grid-cols-3 gap-3">
                        {upiApps.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => setUpiId(`demo@${app.id}`)}
                            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-primary-500 transition-colors text-center"
                          >
                            <span className="text-2xl">{app.icon}</span>
                            <p className="text-xs mt-1 text-slate-600 dark:text-zinc-400">{app.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                          />
                          {cardType && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 uppercase">
                              {cardType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'netbanking' && (
                    <div className="grid grid-cols-3 gap-3">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={clsx(
                            'p-4 rounded-xl border-2 transition-colors text-center',
                            selectedBank === bank.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-slate-200 dark:border-zinc-700 hover:border-primary-300'
                          )}
                        >
                          <p className="font-medium text-slate-800 dark:text-zinc-100">{bank.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="px-6 pb-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-zinc-400">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`${window.location.origin}${window.location.pathname}#/terms/therapist`, '_blank');
                        }}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Terms & Conditions
                      </button>
                      {' '}and subscription policy. I understand that my subscription will auto-renew unless cancelled.
                    </span>
                  </label>
                </div>

                {/* Pay Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={handlePay}
                    disabled={!termsAccepted}
                    className={clsx(
                      "w-full h-12 font-semibold rounded-xl transition-colors",
                      termsAccepted 
                        ? "bg-primary-600 hover:bg-primary-500 text-white" 
                        : "bg-slate-200 dark:bg-zinc-700 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
                    )}
                  >
                    Pay {formatCurrency(amount)}
                  </button>
                </div>

                {/* Footer */}
                <div className="px-6 pb-4 text-center">
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    🔒 Secured by Razorpay
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
