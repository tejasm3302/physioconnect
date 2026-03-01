import { STORAGE_KEYS } from '../config/constants';

export const localDB = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  ensureExtendedStorage: () => {
    const safeArrayKeys = [
      STORAGE_KEYS.RELATIONSHIPS,
      STORAGE_KEYS.CARE_PLANS,
      STORAGE_KEYS.SESSION_HISTORY
    ];

    safeArrayKeys.forEach((key) => {
      if (localDB.get(key) === null) {
        localDB.set(key, []);
      }
    });

    if (localDB.get(STORAGE_KEYS.USER_PROFILES) === null) {
      localDB.set(STORAGE_KEYS.USER_PROFILES, {});
    }
  },

  getUsers: () => localDB.get(STORAGE_KEYS.USERS) || [],
  setUsers: (users) => localDB.set(STORAGE_KEYS.USERS, users),

  getBookings: () => localDB.get(STORAGE_KEYS.BOOKINGS) || [],
  setBookings: (bookings) => localDB.set(STORAGE_KEYS.BOOKINGS, bookings),

  getPayments: () => localDB.get(STORAGE_KEYS.PAYMENTS) || [],
  setPayments: (payments) => localDB.set(STORAGE_KEYS.PAYMENTS, payments),

  getRelationships: () => {
    const data = localDB.get(STORAGE_KEYS.RELATIONSHIPS);
    if (data === null) {
      localDB.set(STORAGE_KEYS.RELATIONSHIPS, []);
      return [];
    }
    return data;
  },
  setRelationships: (relationships) => localDB.set(STORAGE_KEYS.RELATIONSHIPS, relationships),

  getCarePlans: () => {
    const data = localDB.get(STORAGE_KEYS.CARE_PLANS);
    if (data === null) {
      localDB.set(STORAGE_KEYS.CARE_PLANS, []);
      return [];
    }
    return data;
  },
  setCarePlans: (plans) => localDB.set(STORAGE_KEYS.CARE_PLANS, plans),

  getSessionHistory: () => {
    const data = localDB.get(STORAGE_KEYS.SESSION_HISTORY);
    if (data === null) {
      localDB.set(STORAGE_KEYS.SESSION_HISTORY, []);
      return [];
    }
    return data;
  },
  setSessionHistory: (history) => localDB.set(STORAGE_KEYS.SESSION_HISTORY, history),

  getBranding: () => localDB.get(STORAGE_KEYS.BRANDING) || getDefaultBranding(),
  setBranding: (branding) => localDB.set(STORAGE_KEYS.BRANDING, branding),

  getCurrentUser: () => localDB.get(STORAGE_KEYS.CURRENT_USER),
  setCurrentUser: (user) => localDB.set(STORAGE_KEYS.CURRENT_USER, user),
  removeCurrentUser: () => localDB.remove(STORAGE_KEYS.CURRENT_USER),

  getTheme: () => localDB.get(STORAGE_KEYS.THEME) || 'light',
  setTheme: (theme) => localDB.set(STORAGE_KEYS.THEME, theme),

  getUserProfiles: () => localDB.get(STORAGE_KEYS.USER_PROFILES) || {},
  setUserProfiles: (profiles) => localDB.set(STORAGE_KEYS.USER_PROFILES, profiles),
  getUserProfileById: (userId) => {
    if (!userId) return null;
    const profiles = localDB.getUserProfiles();
    return profiles[userId] || null;
  },
  setUserProfileById: (userId, profilePatch) => {
    if (!userId) return false;
    const profiles = localDB.getUserProfiles();
    profiles[userId] = {
      ...(profiles[userId] || {}),
      ...profilePatch
    };
    return localDB.setUserProfiles(profiles);
  },

  getSubscriptionPlans: () => localDB.get(STORAGE_KEYS.SUBSCRIPTION_PLANS),
  setSubscriptionPlans: (plans) => localDB.set(STORAGE_KEYS.SUBSCRIPTION_PLANS, plans),

  getPlatformFeeSettings: () =>
    localDB.get(STORAGE_KEYS.PLATFORM_FEE_SETTINGS) || {
      enabled: true,
      percentage: 10,
      type: 'percentage'
    },
  setPlatformFeeSettings: (settings) => localDB.set(STORAGE_KEYS.PLATFORM_FEE_SETTINGS, settings),

  getCancellationSettings: () =>
    localDB.get(STORAGE_KEYS.CANCELLATION_SETTINGS) || {
      enabled: true,
      freeWindowHours: 18,
      feePercentage: 20,
      adminShare: 60,
      therapistShare: 40
    },
  setCancellationSettings: (settings) => localDB.set(STORAGE_KEYS.CANCELLATION_SETTINGS, settings),

  isSeeded: () => localDB.get(STORAGE_KEYS.SEEDED) === true,
  setSeeded: () => localDB.set(STORAGE_KEYS.SEEDED, true)
};

function getDefaultBranding() {
  return {
    companyName: 'PhysioConnect',
    tagline: 'Find Your Perfect Physiotherapist',
    logo: null,
    primaryColor: '#0d9488',
    accentColor: '#fbbf24',
    contactEmail: 'support@physioconnect.com',
    contactPhone: '+91 98765 43210'
  };
}

export default localDB;