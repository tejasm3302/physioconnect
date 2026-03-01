import { createContext, useContext, useState, useEffect } from 'react';
import { localDB } from '../utils/localDB';
import { ROLES } from '../config/constants';
import { getTrialExpiry } from '../utils/subscriptionUtils';
import { IMAGES } from '../config/images';
import { v4 as uuidv4 } from 'uuid';
import runtime from '../config/runtime';
import backendApi from '../services/backendApi';
import { clearAccessToken, setAccessToken } from '../services/apiClient';

const AuthContext = createContext(null);

const BACKEND_PROFILE_FIELDS = [
  'profilePhoto',
  'degreePhoto',
  'address',
  'specialization',
  'experience',
  'hourlyRate',
  'bio',
  'availability',
  'currency',
  'healthProfile',
  'profileCompleted'
];

function pickProfileFields(userLike = {}) {
  return BACKEND_PROFILE_FIELDS.reduce((acc, key) => {
    if (userLike[key] !== undefined) {
      acc[key] = userLike[key];
    }
    return acc;
  }, {});
}

function mergeBackendUser(serverUser) {
  const localProfile = localDB.getUserProfileById(serverUser?.id) || {};
  return { ...serverUser, ...localProfile };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localDB.getCurrentUser();
    if (savedUser) {
      const users = localDB.getUsers();
      const freshUser = users.find((u) => u.id === savedUser.id);
      const effectiveUser = runtime.useBackend ? mergeBackendUser(savedUser) : freshUser;
      if (effectiveUser) {
        setUser(effectiveUser);
        localDB.setCurrentUser(effectiveUser);
      }
    }
    setLoading(false);
  }, []);

  const loginLocal = (email, password) => {
    const users = localDB.getUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && atob(u.password) === password
    );

    if (foundUser) {
      setUser(foundUser);
      localDB.setCurrentUser(foundUser);
      return { success: true, user: foundUser };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const login = async (email, password) => {
    if (!runtime.useBackend) {
      return loginLocal(email, password);
    }

    try {
      const response = await backendApi.auth.login({ email, password });
      setAccessToken(response.accessToken);

      const mergedUser = mergeBackendUser(response.user);
      setUser(mergedUser);
      localDB.setCurrentUser(mergedUser);

      return { success: true, user: mergedUser };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const registerLocal = (userData) => {
    const users = localDB.getUsers();

    const existingUser = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());

    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: uuidv4(),
      role: userData.role,
      email: userData.email,
      password: btoa(userData.password),
      fullName: userData.fullName,
      phone: userData.phone || '',
      profilePhoto: userData.profilePhoto || IMAGES.defaultAvatar,
      address: '',
      currency: 'INR',
      createdAt: new Date().toISOString()
    };

    if (userData.role === ROLES.CUSTOMER) {
      newUser.healthProfile = null;
      newUser.profileCompleted = false;
    } else if (userData.role === ROLES.THERAPIST) {
      newUser.specialization = userData.specialization || '';
      newUser.experience = 0;
      newUser.hourlyRate = 0;
      newUser.bio = '';
      newUser.degreePhoto = userData.degreePhoto || '';
      newUser.verified = false;
      newUser.availability = [];
      newUser.rating = 0;
      newUser.totalReviews = 0;
      newUser.subscription = {
        planId: null,
        planName: null,
        startDate: null,
        expiryDate: null,
        status: 'trial',
        trialEndsAt: getTrialExpiry(14)
      };
    }

    users.push(newUser);
    localDB.setUsers(users);
    setUser(newUser);
    localDB.setCurrentUser(newUser);

    return { success: true, user: newUser };
  };

  const register = async (userData) => {
    if (!runtime.useBackend) {
      return registerLocal(userData);
    }

    try {
      const response = await backendApi.auth.register({
        role: userData.role,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone || ''
      });
      return { success: true, user: response.user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    if (runtime.useBackend) {
      try {
        await backendApi.auth.logout();
      } catch {}
      clearAccessToken();
    }

    setUser(null);
    localDB.removeCurrentUser();
  };

  const updateUser = (updates) => {
    const users = localDB.getUsers();
    const index = users.findIndex((u) => u.id === user?.id);

    if (index !== -1) {
      const updatedUser = { ...users[index], ...updates };
      users[index] = updatedUser;
      localDB.setUsers(users);
      setUser(updatedUser);
      localDB.setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    if (runtime.useBackend && user) {
      localDB.setUserProfileById(user.id, pickProfileFields(updates));
      const updatedUser = mergeBackendUser({ ...user, ...updates });
      setUser(updatedUser);
      localDB.setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    return { success: false, error: 'User not found' };
  };

  const refreshUser = () => {
    if (user) {
      if (runtime.useBackend) {
        const savedUser = localDB.getCurrentUser();
        if (savedUser?.id === user.id) {
          setUser(mergeBackendUser(savedUser));
        }
        return;
      }

      const users = localDB.getUsers();
      const freshUser = users.find((u) => u.id === user.id);
      if (freshUser) {
        setUser(freshUser);
        localDB.setCurrentUser(freshUser);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === ROLES.ADMIN,
    isTherapist: user?.role === ROLES.THERAPIST,
    isCustomer: user?.role === ROLES.CUSTOMER
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;