export const ROLES = {
  ADMIN: 'admin',
  THERAPIST: 'therapist',
  CUSTOMER: 'customer'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
  NONE: 'none'
};

export const VISIT_TYPES = {
  HOME: 'home',
  CLINIC: 'clinic',
  ONLINE: 'online'
};

export const SPECIALIZATIONS = [
  'Sports Rehabilitation',
  'Orthopedic',
  'Neurological',
  'Pediatric',
  'Geriatric',
  'Cardiopulmonary',
  'Post-Surgical',
  'Chronic Pain Management'
];

export const CURRENCIES = {
  INR: { symbol: 'Rs ', code: 'INR', name: 'Indian Rupee' },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
  EUR: { symbol: 'EUR ', code: 'EUR', name: 'Euro' }
};

export const DEFAULT_CURRENCY = 'INR';

export const RELATIONSHIP_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired'
};

export const RELATIONSHIP_DURATION_DAYS = 30;
export const RELATIONSHIP_REMINDER_DAYS = 5;
export const LOYALTY_PLATFORM_FEE_DISCOUNT_PERCENT = 50;

export const STORAGE_KEYS = {
  USERS: 'physioconnect_users',
  BOOKINGS: 'physioconnect_bookings',
  PAYMENTS: 'physioconnect_payments',
  RELATIONSHIPS: 'physioconnect_relationships',
  CARE_PLANS: 'physioconnect_care_plans',
  SESSION_HISTORY: 'physioconnect_session_history',
  BRANDING: 'physioconnect_branding',
  CURRENT_USER: 'physioconnect_current_user',
  USER_PROFILES: 'physioconnect_user_profiles',
  THEME: 'physioconnect_theme',
  SUBSCRIPTION_PLANS: 'physioconnect_subscription_plans',
  PLATFORM_FEE_SETTINGS: 'physioconnect_platform_fee_settings',
  CANCELLATION_SETTINGS: 'physioconnect_cancellation_settings',
  SEEDED: 'physioconnect_seeded'
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
];

export default {
  ROLES,
  BOOKING_STATUS,
  SUBSCRIPTION_STATUS,
  VISIT_TYPES,
  SPECIALIZATIONS,
  CURRENCIES,
  DEFAULT_CURRENCY,
  RELATIONSHIP_STATUS,
  RELATIONSHIP_DURATION_DAYS,
  RELATIONSHIP_REMINDER_DAYS,
  LOYALTY_PLATFORM_FEE_DISCOUNT_PERCENT,
  STORAGE_KEYS,
  DAYS_OF_WEEK,
  TIME_SLOTS
};

