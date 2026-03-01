import { useEffect } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { DataProvider } from './context/DataContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { NotificationProvider } from './context/NotificationContext';

import { seedDatabase } from './utils/seedData';
import { localDB } from './utils/localDB';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomerTermsPage from './pages/CustomerTermsPage';
import TherapistTermsPage from './pages/TherapistTermsPage';

import CustomerRoute from './guards/CustomerRoute';
import TherapistRoute from './guards/TherapistRoute';
import AdminRoute from './guards/AdminRoute';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseTherapists from './pages/customer/BrowseTherapists';
import BookTherapist from './pages/customer/BookTherapist';
import MyBookings from './pages/customer/MyBookings';
import BookingDetail from './pages/customer/BookingDetail';
import CustomerProfile from './pages/customer/CustomerProfile';

import TherapistDashboard from './pages/therapist/TherapistDashboard';
import Subscription from './pages/therapist/Subscription';
import AppointmentRequests from './pages/therapist/AppointmentRequests';
import ActiveSessions from './pages/therapist/ActiveSessions';
import TherapistEarnings from './pages/therapist/TherapistEarnings';
import TherapistProfile from './pages/therapist/TherapistProfile';
import TherapistReviews from './pages/therapist/TherapistReviews';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageSubscriptionPricing from './pages/admin/ManageSubscriptionPricing';
import RevenueReports from './pages/admin/RevenueReports';
import VerifyTherapists from './pages/admin/VerifyTherapists';
import ManageUsers from './pages/admin/ManageUsers';
import PlatformSettings from './pages/admin/PlatformSettings';
import PlatformFeeAdmin from './pages/admin/PlatformFeeAdmin';

const router = createHashRouter([
  // Terms pages - standalone routes
  { path: '/terms/customer', element: <CustomerTermsPage /> },
  { path: '/terms/therapist', element: <TherapistTermsPage /> },
  
  // Main app routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  
  // Customer routes
  { path: '/customer', element: <CustomerRoute><CustomerDashboard /></CustomerRoute> },
  { path: '/customer/browse', element: <CustomerRoute><BrowseTherapists /></CustomerRoute> },
  { path: '/customer/book/:therapistId', element: <CustomerRoute><BookTherapist /></CustomerRoute> },
  { path: '/customer/bookings', element: <CustomerRoute><MyBookings /></CustomerRoute> },
  { path: '/customer/bookings/:bookingId', element: <CustomerRoute><BookingDetail /></CustomerRoute> },
  { path: '/customer/profile', element: <CustomerRoute><CustomerProfile /></CustomerRoute> },
  
  // Therapist routes
  { path: '/therapist', element: <TherapistRoute><TherapistDashboard /></TherapistRoute> },
  { path: '/therapist/subscription', element: <TherapistRoute><Subscription /></TherapistRoute> },
  { path: '/therapist/requests', element: <TherapistRoute><AppointmentRequests /></TherapistRoute> },
  { path: '/therapist/sessions', element: <TherapistRoute><ActiveSessions /></TherapistRoute> },
  { path: '/therapist/earnings', element: <TherapistRoute><TherapistEarnings /></TherapistRoute> },
  { path: '/therapist/reviews', element: <TherapistRoute><TherapistReviews /></TherapistRoute> },
  { path: '/therapist/profile', element: <TherapistRoute><TherapistProfile /></TherapistRoute> },
  
  // Admin routes
  { path: '/admin', element: <AdminRoute><AdminDashboard /></AdminRoute> },
  { path: '/admin/pricing', element: <AdminRoute><ManageSubscriptionPricing /></AdminRoute> },
  { path: '/admin/platform-fees', element: <AdminRoute><PlatformFeeAdmin /></AdminRoute> },
  { path: '/admin/revenue', element: <AdminRoute><RevenueReports /></AdminRoute> },
  { path: '/admin/verify', element: <AdminRoute><VerifyTherapists /></AdminRoute> },
  { path: '/admin/users', element: <AdminRoute><ManageUsers /></AdminRoute> },
  { path: '/admin/settings', element: <AdminRoute><PlatformSettings /></AdminRoute> },
  
  // 404 catch-all
  { path: '*', element: <NotFoundPage /> }
]);

function App() {
  useEffect(() => {
    localDB.ensureExtendedStorage();
    seedDatabase();
  }, []);

  return (
    <ThemeProvider>
      <BrandingProvider>
        <AuthProvider>
          <DataProvider>
            <SubscriptionProvider>
              <NotificationProvider>
                <RouterProvider router={router} />
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
              </NotificationProvider>
            </SubscriptionProvider>
          </DataProvider>
        </AuthProvider>
      </BrandingProvider>
    </ThemeProvider>
  );
}

export default App;

