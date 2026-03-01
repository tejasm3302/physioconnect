import { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { SUBSCRIPTION_STATUS } from '../config/constants';
import { 
  getSubscriptionStatus, 
  calculateSubscriptionExpiry,
  getSubscriptionButtonState 
} from '../utils/subscriptionUtils';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, updateUser, refreshUser } = useAuth();
  const { createPayment, getSubscriptionPlans } = useData();

  const getCurrentStatus = useCallback(() => {
    if (!user || !user.subscription) {
      return { status: SUBSCRIPTION_STATUS.NONE, daysRemaining: 0 };
    }
    return getSubscriptionStatus(user.subscription);
  }, [user]);

  const subscribeToPlan = useCallback((plan, paymentMethod) => {
    const startDate = new Date().toISOString();
    const expiryDate = calculateSubscriptionExpiry(plan);

    const newSubscription = {
      planId: plan.id,
      planName: plan.name,
      startDate,
      expiryDate,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      trialEndsAt: null
    };

    const payment = createPayment({
      therapistId: user.id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      method: paymentMethod,
      status: 'success'
    });

    updateUser({ subscription: newSubscription });
    refreshUser();

    return { success: true, subscription: newSubscription, payment };
  }, [user, createPayment, updateUser, refreshUser]);

  const renewSubscription = useCallback((plan, paymentMethod) => {
    return subscribeToPlan(plan, paymentMethod);
  }, [subscribeToPlan]);

  const upgradeSubscription = useCallback((newPlan, paymentMethod) => {
    return subscribeToPlan(newPlan, paymentMethod);
  }, [subscribeToPlan]);

  const getButtonState = useCallback((targetPlan) => {
    const plans = getSubscriptionPlans();
    const currentPlan = plans?.find(p => p.id === user?.subscription?.planId);
    const currentTier = currentPlan?.tier || 0;
    const { status } = getCurrentStatus();

    return getSubscriptionButtonState(currentTier, targetPlan.tier, status);
  }, [user, getCurrentStatus, getSubscriptionPlans]);

  const value = {
    subscription: user?.subscription || null,
    getCurrentStatus,
    subscribeToPlan,
    renewSubscription,
    upgradeSubscription,
    getButtonState
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
