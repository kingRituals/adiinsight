import { AppState } from './types';

export const INITIAL_STATES = [
  'Lagos', 'Kano', 'Abuja', 'Oyo', 'Kaduna', 
  'Rivers', 'Enugu', 'Katsina', 'Borno', 'Anambra',
  'Ondo', 'Ogun', 'Cross River', 'Kebbi', 'Benue'
];

const generateHistory = (basePrice: number) => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `2024-03-${20 + i}`,
    price: basePrice + (Math.random() - 0.5) * (basePrice * 0.1)
  }));
};

export const INITIAL_DATA: AppState = {
  hero: {
    headline: 'Track. Analyse. Decide.',
    subheading: 'Monitor real-time agricultural commodity prices across Nigerian states to make informed trading and investment decisions.',
    ctaText: 'View Live Prices'
  },
  states: INITIAL_STATES,
  activityLog: [
    { id: '1', timestamp: new Date().toISOString(), action: 'Platform initialized with seed data' }
  ],
  users: [
    { id: 'admin-1', username: 'admin', password: '12345', role: 'admin', createdAt: new Date().toISOString() }
  ],
  commodities: [
    {
      id: 'palm-oil',
      name: 'Red Palm Oil',
      icon: 'Droplets',
      description: 'High-quality red palm oil sourced from southern plantations.',
      baseUnit: 'Litre',
      history: generateHistory(4800),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 4500 + Math.random() * 1000,
        unit: 'Litre',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 5
      }))
    },
    {
      id: 'cocoa',
      name: 'Cocoa',
      icon: 'Bean',
      description: 'Premium cocoa beans from the western and southern regions.',
      baseUnit: 'kg',
      history: generateHistory(12000),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 11000 + Math.random() * 3000,
        unit: 'kg',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 8
      }))
    },
    {
      id: 'ginger',
      name: 'Ginger',
      icon: 'Zap',
      description: 'Dried and fresh ginger roots primarily from Kaduna state.',
      baseUnit: 'kg',
      history: generateHistory(8000),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 7000 + Math.random() * 2500,
        unit: 'kg',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 12
      }))
    },
    {
      id: 'paddy-rice',
      name: 'Paddy Rice',
      icon: 'Wheat',
      description: 'Unprocessed rice grains from the northern rice belts.',
      baseUnit: 'bag (100kg)',
      history: generateHistory(35000),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 32000 + Math.random() * 8000,
        unit: 'bag (100kg)',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 4
      }))
    },
    {
      id: 'maize',
      name: 'Maize',
      icon: 'Sprout',
      description: 'Yellow and white maize varieties for food and industrial use.',
      baseUnit: 'bag (100kg)',
      history: generateHistory(28000),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 25000 + Math.random() * 6000,
        unit: 'bag (100kg)',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 6
      }))
    },
    {
      id: 'soybean',
      name: 'Soybean',
      icon: 'CircleDot',
      description: 'High-protein soybeans for oil extraction and animal feed.',
      baseUnit: 'kg',
      history: generateHistory(950),
      prices: INITIAL_STATES.map(state => ({
        state,
        price: 850 + Math.random() * 200,
        unit: 'kg',
        lastUpdated: '2024-03-26',
        change: (Math.random() - 0.5) * 3
      }))
    }
  ]
};
