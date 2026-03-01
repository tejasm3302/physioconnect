import { SUBSCRIPTION_STATUS } from '../config/constants';

export function getSubscriptionStatus(subscription) {
  if (!subscription) {
    return { status: SUBSCRIPTION_STATUS.NONE, daysRemaining: 0 };
  }

  const now = new Date();
  
  if (subscription.status === SUBSCRIPTION_STATUS.TRIAL) {
    const trialEnds = new Date(subscription.trialEndsAt);
    const daysRemaining = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return { status: SUBSCRIPTION_STATUS.EXPIRED, daysRemaining: 0 };
    }
    return { status: SUBSCRIPTION_STATUS.TRIAL, daysRemaining };
  }

  if (!subscription.expiryDate) {
    return { status: SUBSCRIPTION_STATUS.NONE, daysRemaining: 0 };
  }

  const expiryDate = new Date(subscription.expiryDate);
  const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { status: SUBSCRIPTION_STATUS.EXPIRED, daysRemaining: 0 };
  }
  
  if (daysRemaining <= 14) {
    return { status: SUBSCRIPTION_STATUS.EXPIRING_SOON, daysRemaining };
  }
  
  return { status: SUBSCRIPTION_STATUS.ACTIVE, daysRemaining };
}

export function isTherapistListable(therapist) {
  if (!therapist || !therapist.verified) {
    return false;
  }

  const { status } = getSubscriptionStatus(therapist.subscription);
  
  return [
    SUBSCRIPTION_STATUS.ACTIVE,
    SUBSCRIPTION_STATUS.TRIAL,
    SUBSCRIPTION_STATUS.EXPIRING_SOON
  ].includes(status);
}

export function getSubscriptionButtonState(currentPlanTier, targetPlanTier, currentStatus) {
  if (currentStatus === SUBSCRIPTION_STATUS.NONE || 
      currentStatus === SUBSCRIPTION_STATUS.EXPIRED ||
      currentStatus === SUBSCRIPTION_STATUS.TRIAL) {
    return { label: 'Subscribe', disabled: false };
  }

  if (currentPlanTier === targetPlanTier) {
    return { label: 'Current Plan', disabled: true };
  }

  if (targetPlanTier < currentPlanTier) {
    return { label: 'Lower Plan', disabled: true };
  }

  return { label: 'Upgrade', disabled: false };
}

export function calculateSubscriptionExpiry(plan, startDate = new Date()) {
  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + plan.duration);
  return expiry.toISOString();
}

export function getTrialExpiry(days = 14) {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + days);
  return expiry.toISOString();
}

export default {
  getSubscriptionStatus,
  isTherapistListable,
  getSubscriptionButtonState,
  calculateSubscriptionExpiry,
  getTrialExpiry
};
