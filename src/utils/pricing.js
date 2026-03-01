import { LOYALTY_PLATFORM_FEE_DISCOUNT_PERCENT, VISIT_TYPES } from '../config/constants';

export function getTherapistFee(hourlyRate = 0, visitType = VISIT_TYPES.CLINIC) {
  return visitType === VISIT_TYPES.HOME ? hourlyRate + 500 : hourlyRate;
}

export function calculateBookingCharges({
  hourlyRate,
  visitType,
  platformFeeSettings,
  hasActiveRelationship = false
}) {
  const therapistFee = getTherapistFee(hourlyRate, visitType);
  const rawPlatformFee = platformFeeSettings?.enabled
    ? Math.round((therapistFee * (platformFeeSettings?.percentage || 0)) / 100)
    : 0;

  const loyaltyDiscount = hasActiveRelationship
    ? Math.round((rawPlatformFee * LOYALTY_PLATFORM_FEE_DISCOUNT_PERCENT) / 100)
    : 0;

  const platformFee = Math.max(0, rawPlatformFee - loyaltyDiscount);

  return {
    therapistFee,
    platformFee,
    loyaltyDiscount,
    totalAmount: therapistFee + platformFee
  };
}
