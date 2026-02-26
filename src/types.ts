import { LucideIcon } from 'lucide-react';

export interface PriceData {
  state: string;
  price: number;
  unit: string;
  lastUpdated: string;
  change: number; // percentage
}

export interface Commodity {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  baseUnit: string;
  prices: PriceData[];
  history: { date: string; price: number }[];
}

export interface HeroConfig {
  headline: string;
  subheading: string;
  ctaText: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface AppState {
  commodities: Commodity[];
  states: string[];
  hero: HeroConfig;
  activityLog: ActivityLogEntry[];
  users: User[];
}

export type AppAction =
  | { type: 'UPDATE_PRICE'; commodityId: string; state: string; price: number; unit: string }
  | { type: 'BULK_UPDATE'; commodityId: string; updates: { state: string; price: number; unit: string }[] }
  | { type: 'UPDATE_COMMODITY'; commodityId: string; data: Partial<Commodity> }
  | { type: 'UPDATE_HERO'; data: HeroConfig }
  | { type: 'ADD_STATE'; state: string }
  | { type: 'REMOVE_STATE'; state: string }
  | { type: 'ADD_LOG'; action: string }
  | { type: 'ADD_USER'; user: User }
  | { type: 'REMOVE_USER'; userId: string };
