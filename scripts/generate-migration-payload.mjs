import fs from 'node:fs';

const MS_DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const ids = {
  admin: '00000000-0000-0000-0000-000000000001',
  therapist1: '00000000-0000-0000-0000-000000000011',
  therapist2: '00000000-0000-0000-0000-000000000012',
  therapist3: '00000000-0000-0000-0000-000000000013',
  customer1: '00000000-0000-0000-0000-000000000021',
  customer2: '00000000-0000-0000-0000-000000000022'
};

const users = [
  {
    id: ids.admin,
    role: 'admin',
    email: 'admin@physioconnect.com',
    password: Buffer.from('admin123').toString('base64'),
    fullName: 'Admin User',
    phone: '+91 98765 43210',
    verified: true,
    createdAt: new Date(now - 180 * MS_DAY).toISOString()
  },
  {
    id: ids.therapist1,
    role: 'therapist',
    email: 'sarah@physio.com',
    password: Buffer.from('physio123').toString('base64'),
    fullName: 'Dr. Sarah Mitchell',
    phone: '+91 98765 11111',
    verified: true,
    createdAt: new Date(now - 120 * MS_DAY).toISOString()
  },
  {
    id: ids.therapist2,
    role: 'therapist',
    email: 'arjun@physio.com',
    password: Buffer.from('physio123').toString('base64'),
    fullName: 'Dr. Arjun Patel',
    phone: '+91 98765 22222',
    verified: true,
    createdAt: new Date(now - 200 * MS_DAY).toISOString()
  },
  {
    id: ids.therapist3,
    role: 'therapist',
    email: 'priya@physio.com',
    password: Buffer.from('physio123').toString('base64'),
    fullName: 'Dr. Priya Reddy',
    phone: '+91 98765 33333',
    verified: false,
    createdAt: new Date(now - 14 * MS_DAY).toISOString()
  },
  {
    id: ids.customer1,
    role: 'customer',
    email: 'rahul@email.com',
    password: Buffer.from('patient123').toString('base64'),
    fullName: 'Rahul Sharma',
    phone: '+91 98765 44444',
    verified: true,
    createdAt: new Date(now - 60 * MS_DAY).toISOString()
  },
  {
    id: ids.customer2,
    role: 'customer',
    email: 'anita@email.com',
    password: Buffer.from('patient123').toString('base64'),
    fullName: 'Anita Desai',
    phone: '+91 98765 55555',
    verified: true,
    createdAt: new Date(now - 90 * MS_DAY).toISOString()
  }
];

const bookings = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    customerId: ids.customer1,
    therapistId: ids.therapist1,
    date: new Date(now - 7 * MS_DAY).toISOString().slice(0, 10),
    time: '10:00',
    duration: 60,
    visitType: 'clinic',
    status: 'completed',
    price: 1500,
    notes: 'Lower back pain assessment and initial treatment',
    createdAt: new Date(now - 10 * MS_DAY).toISOString(),
    completedAt: new Date(now - 7 * MS_DAY).toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    customerId: ids.customer1,
    therapistId: ids.therapist1,
    date: new Date(now + 2 * MS_DAY).toISOString().slice(0, 10),
    time: '14:00',
    duration: 60,
    visitType: 'clinic',
    status: 'confirmed',
    price: 1500,
    notes: 'Follow-up session for back pain treatment',
    createdAt: new Date(now - 3 * MS_DAY).toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    customerId: ids.customer2,
    therapistId: ids.therapist2,
    date: new Date(now - 14 * MS_DAY).toISOString().slice(0, 10),
    time: '11:00',
    duration: 60,
    visitType: 'clinic',
    status: 'completed',
    price: 2000,
    notes: 'Knee rehabilitation session',
    createdAt: new Date(now - 20 * MS_DAY).toISOString(),
    completedAt: new Date(now - 14 * MS_DAY).toISOString()
  }
];

const payments = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    therapistId: ids.therapist1,
    planId: 'quarterly',
    planName: 'Quarterly',
    amount: 1499,
    method: 'upi',
    status: 'success',
    paymentId: 'pay_seed_00000001',
    date: new Date(now - 30 * MS_DAY).toISOString()
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    therapistId: ids.therapist2,
    planId: 'monthly',
    planName: 'Monthly',
    amount: 599,
    method: 'card',
    status: 'success',
    paymentId: 'pay_seed_00000002',
    date: new Date(now - 5 * MS_DAY).toISOString()
  }
];

const relationships = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    customerId: ids.customer1,
    therapistId: ids.therapist1,
    createdAt: new Date(now - 7 * MS_DAY).toISOString(),
    expiresAt: new Date(now + 23 * MS_DAY).toISOString(),
    status: 'active'
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    customerId: ids.customer2,
    therapistId: ids.therapist2,
    createdAt: new Date(now - 14 * MS_DAY).toISOString(),
    expiresAt: new Date(now + 16 * MS_DAY).toISOString(),
    status: 'active'
  }
];

const carePlans = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    customerId: ids.customer1,
    therapistId: ids.therapist1,
    title: 'Lower Back Recovery Plan',
    goals: 'Reduce pain and improve mobility over structured sessions.',
    totalSessions: 6,
    completedSessions: 2,
    status: 'active',
    createdAt: new Date(now - 10 * MS_DAY).toISOString(),
    updatedAt: new Date(now - 2 * MS_DAY).toISOString()
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    customerId: ids.customer2,
    therapistId: ids.therapist2,
    title: 'Knee Strength & Stability Plan',
    goals: 'Improve knee strength and function with progressive therapy.',
    totalSessions: 8,
    completedSessions: 3,
    status: 'active',
    createdAt: new Date(now - 20 * MS_DAY).toISOString(),
    updatedAt: new Date(now - 1 * MS_DAY).toISOString()
  }
];

const sessionHistory = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    bookingId: '10000000-0000-0000-0000-000000000001',
    customerId: ids.customer1,
    therapistId: ids.therapist1,
    carePlanId: '40000000-0000-0000-0000-000000000001',
    summary: 'Initial assessment completed. Started mobility routine.',
    createdAt: new Date(now - 7 * MS_DAY).toISOString()
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    bookingId: '10000000-0000-0000-0000-000000000003',
    customerId: ids.customer2,
    therapistId: ids.therapist2,
    carePlanId: '40000000-0000-0000-0000-000000000002',
    summary: 'Knee rehab session with targeted strengthening progression.',
    createdAt: new Date(now - 14 * MS_DAY).toISOString()
  }
];

const payload = { users, bookings, payments, relationships, carePlans, sessionHistory };

fs.writeFileSync('migration-payload.json', JSON.stringify(payload, null, 2));
console.log('Generated migration-payload.json');
