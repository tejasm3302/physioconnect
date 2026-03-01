import { v4 as uuidv4 } from 'uuid';
import { localDB } from './localDB';
import { SUBSCRIPTION_PLANS } from '../config/subscriptionPlans';
import { IMAGES } from '../config/images';
import { ROLES, BOOKING_STATUS, SUBSCRIPTION_STATUS } from '../config/constants';

export function seedDatabase() {
  if (localDB.isSeeded()) {
    return;
  }

  const now = new Date();
  const adminId = uuidv4();
  const therapist1Id = uuidv4();
  const therapist2Id = uuidv4();
  const therapist3Id = uuidv4();
  const customer1Id = uuidv4();
  const customer2Id = uuidv4();

  const users = [
    {
      id: adminId,
      role: ROLES.ADMIN,
      email: 'admin@physioconnect.com',
      password: btoa('admin123'),
      fullName: 'Admin User',
      phone: '+91 98765 43210',
      profilePhoto: IMAGES.defaultAvatar,
      address: 'PhysioConnect HQ, Mumbai',
      currency: 'INR',
      createdAt: new Date(now - 180 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: therapist1Id,
      role: ROLES.THERAPIST,
      email: 'sarah@physio.com',
      password: btoa('physio123'),
      fullName: 'Dr. Sarah Mitchell',
      phone: '+91 98765 11111',
      profilePhoto: IMAGES.doctor1,
      address: 'Sports Clinic, Bandra, Mumbai',
      currency: 'INR',
      specialization: 'Sports Rehabilitation',
      experience: 8,
      hourlyRate: 1500,
      bio: 'Specialized in sports injuries and rehabilitation with 8 years of experience working with professional athletes. I focus on getting you back to peak performance through personalized treatment plans.',
      degreePhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
      verified: true,
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
      ],
      rating: 4.8,
      totalReviews: 124,
      subscription: {
        planId: 'quarterly',
        planName: 'Quarterly',
        startDate: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: SUBSCRIPTION_STATUS.ACTIVE,
        trialEndsAt: null
      },
      createdAt: new Date(now - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: therapist2Id,
      role: ROLES.THERAPIST,
      email: 'arjun@physio.com',
      password: btoa('physio123'),
      fullName: 'Dr. Arjun Patel',
      phone: '+91 98765 22222',
      profilePhoto: IMAGES.doctor3,
      address: 'Orthopedic Center, Andheri, Mumbai',
      currency: 'INR',
      specialization: 'Orthopedic',
      experience: 12,
      hourlyRate: 2000,
      bio: 'With 12 years of orthopedic physiotherapy experience, I specialize in joint replacements, fracture rehabilitation, and chronic musculoskeletal conditions. My approach combines manual therapy with evidence-based exercises.',
      degreePhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
      verified: true,
      availability: [
        { day: 'Monday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
        { day: 'Tuesday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
        { day: 'Wednesday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
        { day: 'Thursday', slots: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'] },
        { day: 'Saturday', slots: ['09:00', '10:00', '11:00', '12:00'] }
      ],
      rating: 4.9,
      totalReviews: 256,
      subscription: {
        planId: 'monthly',
        planName: 'Monthly',
        startDate: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(now + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: SUBSCRIPTION_STATUS.ACTIVE,
        trialEndsAt: null
      },
      createdAt: new Date(now - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: therapist3Id,
      role: ROLES.THERAPIST,
      email: 'priya@physio.com',
      password: btoa('physio123'),
      fullName: 'Dr. Priya Reddy',
      phone: '+91 98765 33333',
      profilePhoto: IMAGES.doctor2,
      address: 'Neuro Rehab Center, Koramangala, Bangalore',
      currency: 'INR',
      specialization: 'Neurological',
      experience: 6,
      hourlyRate: 1200,
      bio: 'Passionate about helping patients with neurological conditions regain their independence. Specialized in stroke rehabilitation, Parkinson\'s disease management, and spinal cord injury recovery.',
      degreePhoto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
      verified: false,
      availability: [
        { day: 'Monday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '11:00', '15:00', '16:00'] }
      ],
      rating: 4.6,
      totalReviews: 45,
      subscription: {
        planId: null,
        planName: null,
        startDate: null,
        expiryDate: null,
        status: SUBSCRIPTION_STATUS.TRIAL,
        trialEndsAt: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: customer1Id,
      role: ROLES.CUSTOMER,
      email: 'rahul@email.com',
      password: btoa('patient123'),
      fullName: 'Rahul Sharma',
      phone: '+91 98765 44444',
      profilePhoto: IMAGES.patient1,
      address: 'Malad West, Mumbai',
      currency: 'INR',
      healthProfile: {
        age: 32,
        gender: 'Male',
        height: '175 cm',
        weight: '78 kg',
        conditions: ['Lower back pain', 'Desk job posture issues'],
        medications: ['None'],
        allergies: ['None']
      },
      profileCompleted: true,
      createdAt: new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: customer2Id,
      role: ROLES.CUSTOMER,
      email: 'anita@email.com',
      password: btoa('patient123'),
      fullName: 'Anita Desai',
      phone: '+91 98765 55555',
      profilePhoto: IMAGES.patient2,
      address: 'Hauz Khas, Delhi',
      currency: 'INR',
      healthProfile: {
        age: 45,
        gender: 'Female',
        height: '162 cm',
        weight: '65 kg',
        conditions: ['Knee osteoarthritis', 'Previous ACL surgery'],
        medications: ['Glucosamine supplements'],
        allergies: ['Aspirin']
      },
      profileCompleted: true,
      createdAt: new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const bookings = [
    {
      id: uuidv4(),
      customerId: customer1Id,
      customerName: 'Rahul Sharma',
      therapistId: therapist1Id,
      therapistName: 'Dr. Sarah Mitchell',
      date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.COMPLETED,
      price: 1500,
      rating: 5,
      review: 'Excellent session! Dr. Sarah understood my issues perfectly and provided a comprehensive treatment plan.',
      notes: 'Lower back pain assessment and initial treatment',
      createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer1Id,
      customerName: 'Rahul Sharma',
      therapistId: therapist1Id,
      therapistName: 'Dr. Sarah Mitchell',
      date: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '14:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.CONFIRMED,
      price: 1500,
      rating: null,
      review: null,
      notes: 'Follow-up session for back pain treatment',
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      customerName: 'Anita Desai',
      therapistId: therapist2Id,
      therapistName: 'Dr. Arjun Patel',
      date: new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.COMPLETED,
      price: 2000,
      rating: 5,
      review: 'Dr. Arjun is extremely knowledgeable about knee issues. His exercises have really helped reduce my pain.',
      notes: 'Knee rehabilitation session',
      createdAt: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      customerName: 'Anita Desai',
      therapistId: therapist2Id,
      therapistName: 'Dr. Arjun Patel',
      date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '15:00',
      duration: 60,
      visitType: 'home',
      status: BOOKING_STATUS.COMPLETED,
      price: 2500,
      rating: 4,
      review: 'Good session at home. Very convenient.',
      notes: 'Home visit for knee exercises',
      createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer1Id,
      customerName: 'Rahul Sharma',
      therapistId: therapist2Id,
      therapistName: 'Dr. Arjun Patel',
      date: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00',
      duration: 60,
      visitType: 'online',
      status: BOOKING_STATUS.PENDING,
      price: 1500,
      rating: null,
      review: null,
      notes: 'Online consultation for posture assessment',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      customerName: 'Anita Desai',
      therapistId: therapist1Id,
      therapistName: 'Dr. Sarah Mitchell',
      date: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.CANCELLED,
      price: 1500,
      rating: null,
      review: null,
      notes: 'Initial assessment - cancelled due to schedule conflict',
      createdAt: new Date(now - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer1Id,
      customerName: 'Rahul Sharma',
      therapistId: therapist3Id,
      therapistName: 'Dr. Priya Reddy',
      date: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '15:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.CONFIRMED,
      price: 1200,
      rating: null,
      review: null,
      notes: 'Consultation for nerve-related issues',
      createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      customerId: customer2Id,
      customerName: 'Anita Desai',
      therapistId: therapist2Id,
      therapistName: 'Dr. Arjun Patel',
      date: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '16:00',
      duration: 60,
      visitType: 'clinic',
      status: BOOKING_STATUS.PENDING,
      price: 2000,
      rating: null,
      review: null,
      notes: 'Regular knee therapy session',
      createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const payments = [
    {
      id: uuidv4(),
      therapistId: therapist1Id,
      planId: 'quarterly',
      planName: 'Quarterly',
      amount: 1499,
      paymentId: 'pay_' + uuidv4().substring(0, 14),
      method: 'upi',
      status: 'success',
      date: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      therapistId: therapist2Id,
      planId: 'monthly',
      planName: 'Monthly',
      amount: 599,
      paymentId: 'pay_' + uuidv4().substring(0, 14),
      method: 'card',
      status: 'success',
      date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      therapistId: therapist1Id,
      planId: 'monthly',
      planName: 'Monthly',
      amount: 599,
      paymentId: 'pay_' + uuidv4().substring(0, 14),
      method: 'netbanking',
      status: 'success',
      date: new Date(now - 120 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const branding = {
    companyName: 'PhysioConnect',
    tagline: 'Find Your Perfect Physiotherapist',
    logo: null,
    primaryColor: '#0d9488',
    accentColor: '#fbbf24',
    contactEmail: 'support@physioconnect.com',
    contactPhone: '+91 98765 43210'
  };

  localDB.setUsers(users);
  localDB.setBookings(bookings);
  localDB.setPayments(payments);
  localDB.setBranding(branding);
  localDB.setSubscriptionPlans(SUBSCRIPTION_PLANS);
  localDB.setSeeded();

  console.log('Database seeded successfully!');
}

export default seedDatabase;
