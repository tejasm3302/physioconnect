export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 599,
    duration: 30,
    tier: 1,
    features: [
      'Profile listing',
      'Up to 20 bookings/month',
      'Basic analytics',
      'Email support'
    ],
    popular: false,
    bestValue: false
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 1499,
    duration: 90,
    tier: 2,
    features: [
      'Profile listing',
      'Unlimited bookings',
      'Advanced analytics',
      'Priority support',
      'Featured badge'
    ],
    popular: true,
    bestValue: false
  },
  {
    id: 'half-yearly',
    name: 'Half-Yearly',
    price: 2699,
    duration: 180,
    tier: 3,
    features: [
      'Profile listing',
      'Unlimited bookings',
      'Advanced analytics',
      'Priority support',
      'Featured badge',
      'Top search placement'
    ],
    popular: false,
    bestValue: false
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 4499,
    duration: 365,
    tier: 4,
    features: [
      'Profile listing',
      'Unlimited bookings',
      'Premium analytics',
      '24/7 Priority support',
      'Featured badge',
      'Top search placement',
      'Promotional features'
    ],
    popular: false,
    bestValue: true
  }
];

export const TRIAL_DURATION = 14;

export default SUBSCRIPTION_PLANS;
