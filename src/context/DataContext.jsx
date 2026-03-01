import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { localDB } from '../utils/localDB';
import { v4 as uuidv4 } from 'uuid';
import { BOOKING_STATUS, RELATIONSHIP_STATUS, ROLES } from '../config/constants';
import {
  calculateRelationshipExpiry,
  withResolvedStatus
} from '../utils/relationshipUtils';
import runtime from '../config/runtime';
import backendApi from '../services/backendApi';

const DataContext = createContext(null);

function mergeById(existing, incoming) {
  const map = new Map((existing || []).map(item => [item.id, item]));
  (incoming || []).forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function normalizeRow(row) {
  if (!row) return row;
  return {
    id: row.id,
    customerId: row.customerId || row.customer_id,
    therapistId: row.therapistId || row.therapist_id,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
    expiresAt: row.expiresAt || row.expires_at,
    status: row.status,
    title: row.title,
    goals: row.goals,
    totalSessions: row.totalSessions || row.total_sessions,
    completedSessions: row.completedSessions || row.completed_sessions,
    bookingId: row.bookingId || row.booking_id,
    carePlanId: row.carePlanId || row.care_plan_id,
    summary: row.summary,
    therapistName: row.therapistName || row.therapist_name,
    customerName: row.customerName || row.customer_name
  };
}

export function DataProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    const handleStorageChange = () => {
      triggerRefresh();
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      triggerRefresh();
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getUsers = useCallback(() => {
    return localDB.getUsers();
  }, [refreshKey]);

  const getUserById = useCallback((id) => {
    const users = localDB.getUsers();
    return users.find(u => u.id === id);
  }, [refreshKey]);

  const getTherapists = useCallback(() => {
    const users = localDB.getUsers();
    return users.filter(u => u.role === ROLES.THERAPIST);
  }, [refreshKey]);

  const getCustomers = useCallback(() => {
    const users = localDB.getUsers();
    return users.filter(u => u.role === ROLES.CUSTOMER);
  }, [refreshKey]);

  const updateUser = useCallback((userId, updates) => {
    const users = localDB.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localDB.setUsers(users);
      triggerRefresh();
      return users[index];
    }
    return null;
  }, []);

  const deleteUser = useCallback((userId) => {
    const users = localDB.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localDB.setUsers(filtered);
    triggerRefresh();
  }, []);

  const getBookings = useCallback(() => {
    return localDB.getBookings();
  }, [refreshKey]);

  const getBookingById = useCallback((id) => {
    const bookings = localDB.getBookings();
    return bookings.find(b => b.id === id);
  }, [refreshKey]);

  const getBookingsForCustomer = useCallback((customerId) => {
    const bookings = localDB.getBookings();
    return bookings.filter(b => b.customerId === customerId);
  }, [refreshKey]);

  const getBookingsForTherapist = useCallback((therapistId) => {
    const bookings = localDB.getBookings();
    return bookings.filter(b => b.therapistId === therapistId);
  }, [refreshKey]);

  const createBooking = useCallback((bookingData) => {
    const bookings = localDB.getBookings();
    const newBooking = {
      id: uuidv4(),
      ...bookingData,
      status: BOOKING_STATUS.PENDING,
      rating: null,
      review: null,
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    localDB.setBookings(bookings);
    triggerRefresh();
    return newBooking;
  }, []);

  const updateBooking = useCallback((bookingId, updates) => {
    const bookings = localDB.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      localDB.setBookings(bookings);
      triggerRefresh();
      return bookings[index];
    }
    return null;
  }, []);

  const cancelBooking = useCallback((bookingId) => {
    return updateBooking(bookingId, { status: BOOKING_STATUS.CANCELLED });
  }, [updateBooking]);

  const syncRelationshipsForCustomer = useCallback((customerId) => {
    if (!runtime.useBackend || !customerId) return;
    backendApi.relationships.forCustomer(customerId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getRelationships(), normalized);
        localDB.setRelationships(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const syncRelationshipsForTherapist = useCallback((therapistId) => {
    if (!runtime.useBackend || !therapistId) return;
    backendApi.relationships.forTherapist(therapistId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getRelationships(), normalized);
        localDB.setRelationships(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const syncCarePlansForCustomer = useCallback((customerId) => {
    if (!runtime.useBackend || !customerId) return;
    backendApi.carePlans.forCustomer(customerId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getCarePlans(), normalized);
        localDB.setCarePlans(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const syncCarePlansForTherapist = useCallback((therapistId) => {
    if (!runtime.useBackend || !therapistId) return;
    backendApi.carePlans.forTherapist(therapistId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getCarePlans(), normalized);
        localDB.setCarePlans(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const syncHistoryForCustomer = useCallback((customerId) => {
    if (!runtime.useBackend || !customerId) return;
    backendApi.sessionHistory.forCustomer(customerId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getSessionHistory(), normalized);
        localDB.setSessionHistory(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const syncHistoryForTherapist = useCallback((therapistId) => {
    if (!runtime.useBackend || !therapistId) return;
    backendApi.sessionHistory.forTherapist(therapistId)
      .then((rows) => {
        const normalized = rows.map(normalizeRow);
        const merged = mergeById(localDB.getSessionHistory(), normalized);
        localDB.setSessionHistory(merged);
        triggerRefresh();
      })
      .catch(() => {});
  }, []);

  const getRelationships = useCallback(() => {
    const relationships = localDB.getRelationships();
    const resolved = relationships.map(withResolvedStatus);
    const changed = resolved.some((r, idx) => r.status !== relationships[idx]?.status);
    if (changed) {
      localDB.setRelationships(resolved);
    }
    return resolved;
  }, [refreshKey]);

  const getRelationship = useCallback((customerId, therapistId) => {
    return getRelationships().find(
      r => r.customerId === customerId && r.therapistId === therapistId
    ) || null;
  }, [getRelationships]);

  const getActiveRelationship = useCallback((customerId, therapistId) => {
    const relationship = getRelationship(customerId, therapistId);
    if (!relationship) return null;
    return relationship.status === RELATIONSHIP_STATUS.ACTIVE ? relationship : null;
  }, [getRelationship]);

  const getActiveRelationshipsForCustomer = useCallback((customerId) => {
    syncRelationshipsForCustomer(customerId);
    return getRelationships().filter(
      r => r.customerId === customerId && r.status === RELATIONSHIP_STATUS.ACTIVE
    );
  }, [getRelationships, syncRelationshipsForCustomer]);

  const getActiveRelationshipsForTherapist = useCallback((therapistId) => {
    syncRelationshipsForTherapist(therapistId);
    return getRelationships().filter(
      r => r.therapistId === therapistId && r.status === RELATIONSHIP_STATUS.ACTIVE
    );
  }, [getRelationships, syncRelationshipsForTherapist]);

  const upsertRelationship = useCallback((customerId, therapistId) => {
    const relationships = localDB.getRelationships();
    const index = relationships.findIndex(
      r => r.customerId === customerId && r.therapistId === therapistId
    );

    const now = new Date().toISOString();

    if (index !== -1) {
      const updatedRelationship = {
        ...relationships[index],
        createdAt: relationships[index].createdAt || now,
        expiresAt: calculateRelationshipExpiry(now),
        status: RELATIONSHIP_STATUS.ACTIVE
      };
      relationships[index] = updatedRelationship;
      localDB.setRelationships(relationships);
      return updatedRelationship;
    }

    const newRelationship = {
      id: uuidv4(),
      customerId,
      therapistId,
      createdAt: now,
      expiresAt: calculateRelationshipExpiry(now),
      status: RELATIONSHIP_STATUS.ACTIVE
    };

    relationships.push(newRelationship);
    localDB.setRelationships(relationships);
    return newRelationship;
  }, []);

  const getCarePlans = useCallback(() => {
    return localDB.getCarePlans();
  }, [refreshKey]);

  const getCarePlansForCustomer = useCallback((customerId) => {
    syncCarePlansForCustomer(customerId);
    return localDB.getCarePlans().filter(plan => plan.customerId === customerId);
  }, [refreshKey, syncCarePlansForCustomer]);

  const getCarePlansForTherapist = useCallback((therapistId) => {
    syncCarePlansForTherapist(therapistId);
    return localDB.getCarePlans().filter(plan => plan.therapistId === therapistId);
  }, [refreshKey, syncCarePlansForTherapist]);

  const updateCarePlan = useCallback((planId, updates) => {
    const plans = localDB.getCarePlans();
    const index = plans.findIndex(p => p.id === planId);
    if (index === -1) return null;

    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localDB.setCarePlans(plans);
    triggerRefresh();
    return plans[index];
  }, []);

  const getSessionHistory = useCallback(() => {
    return localDB.getSessionHistory();
  }, [refreshKey]);

  const getSessionHistoryForCustomer = useCallback((customerId) => {
    syncHistoryForCustomer(customerId);
    return localDB.getSessionHistory()
      .filter(item => item.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [refreshKey, syncHistoryForCustomer]);

  const getSessionHistoryForTherapist = useCallback((therapistId) => {
    syncHistoryForTherapist(therapistId);
    return localDB.getSessionHistory()
      .filter(item => item.therapistId === therapistId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [refreshKey, syncHistoryForTherapist]);

  const markBookingCompleted = useCallback(async (bookingId, options = {}) => {
    if (runtime.useBackend) {
      try {
        await backendApi.bookings.complete({
          bookingId,
          planTitle: options.planTitle,
          planGoals: options.planGoals,
          totalSessions: options.totalSessions,
          sessionNotes: options.sessionNotes
        });
      } catch {
        return null;
      }
    }

    const bookings = localDB.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) return null;

    const booking = bookings[bookingIndex];
    const completedAt = new Date().toISOString();
    const updatedBooking = {
      ...booking,
      status: BOOKING_STATUS.COMPLETED,
      completedAt
    };
    bookings[bookingIndex] = updatedBooking;
    localDB.setBookings(bookings);

    const relationship = upsertRelationship(booking.customerId, booking.therapistId);

    const plans = localDB.getCarePlans();
    const existingPlanIndex = plans.findIndex(
      p =>
        p.customerId === booking.customerId &&
        p.therapistId === booking.therapistId &&
        p.status === 'active'
    );

    let carePlan;
    if (existingPlanIndex !== -1) {
      const existing = plans[existingPlanIndex];
      const nextCompleted = Math.min(
        existing.totalSessions,
        (existing.completedSessions || 0) + 1
      );

      carePlan = {
        ...existing,
        title: options.planTitle || existing.title,
        goals: options.planGoals || existing.goals,
        totalSessions: options.totalSessions || existing.totalSessions,
        completedSessions: nextCompleted,
        lastSessionAt: completedAt,
        status: nextCompleted >= (options.totalSessions || existing.totalSessions)
          ? 'completed'
          : 'active',
        updatedAt: completedAt
      };

      plans[existingPlanIndex] = carePlan;
    } else {
      const totalSessions = options.totalSessions || 6;
      carePlan = {
        id: uuidv4(),
        customerId: booking.customerId,
        therapistId: booking.therapistId,
        title: options.planTitle || 'Guided Recovery Care Plan',
        goals: options.planGoals || 'Consistent progress through therapist-managed follow-ups on PhysioConnect.',
        totalSessions,
        completedSessions: 1,
        createdAt: completedAt,
        lastSessionAt: completedAt,
        status: totalSessions <= 1 ? 'completed' : 'active',
        updatedAt: completedAt
      };
      plans.push(carePlan);
    }

    localDB.setCarePlans(plans);

    const sessionHistory = localDB.getSessionHistory();
    sessionHistory.push({
      id: uuidv4(),
      bookingId: booking.id,
      customerId: booking.customerId,
      therapistId: booking.therapistId,
      therapistName: booking.therapistName,
      customerName: booking.customerName,
      carePlanId: carePlan.id,
      summary: options.sessionNotes || booking.notes || 'Session completed and recorded in managed care history.',
      createdAt: completedAt
    });
    localDB.setSessionHistory(sessionHistory);

    triggerRefresh();

    return {
      booking: updatedBooking,
      relationship,
      carePlan
    };
  }, [upsertRelationship]);

  const getPayments = useCallback(() => {
    return localDB.getPayments();
  }, [refreshKey]);

  const getPaymentsForTherapist = useCallback((therapistId) => {
    const payments = localDB.getPayments();
    return payments.filter(p => p.therapistId === therapistId);
  }, [refreshKey]);

  const createPayment = useCallback((paymentData) => {
    const payments = localDB.getPayments();
    const newPayment = {
      id: uuidv4(),
      paymentId: 'pay_' + uuidv4().substring(0, 14),
      ...paymentData,
      date: new Date().toISOString()
    };
    payments.push(newPayment);
    localDB.setPayments(payments);
    triggerRefresh();
    return newPayment;
  }, []);

  const getSubscriptionPlans = useCallback(() => {
    return localDB.getSubscriptionPlans();
  }, [refreshKey]);

  const updateSubscriptionPlans = useCallback((plans) => {
    localDB.setSubscriptionPlans(plans);
    triggerRefresh();
  }, []);

  const value = {
    refreshKey,
    triggerRefresh,
    getUsers,
    getUserById,
    getTherapists,
    getCustomers,
    updateUser,
    deleteUser,
    getBookings,
    getBookingById,
    getBookingsForCustomer,
    getBookingsForTherapist,
    createBooking,
    updateBooking,
    cancelBooking,
    getRelationships,
    getRelationship,
    getActiveRelationship,
    getActiveRelationshipsForCustomer,
    getActiveRelationshipsForTherapist,
    upsertRelationship,
    getCarePlans,
    getCarePlansForCustomer,
    getCarePlansForTherapist,
    updateCarePlan,
    getSessionHistory,
    getSessionHistoryForCustomer,
    getSessionHistoryForTherapist,
    markBookingCompleted,
    getPayments,
    getPaymentsForTherapist,
    createPayment,
    getSubscriptionPlans,
    updateSubscriptionPlans
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;
