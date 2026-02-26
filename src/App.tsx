import React, { useState, useReducer, useEffect, useMemo } from 'react';
import { 
  Leaf, 
  LayoutDashboard, 
  TrendingUp, 
  Info, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Droplets,
  Bean,
  Zap,
  Wheat,
  Sprout,
  CircleDot,
  Clock,
  FileText,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { AppState, AppAction, Commodity, PriceData } from './types';
import { INITIAL_DATA } from './constants';

// --- Reducer ---
function appReducer(state: AppState, action: AppAction): AppState {
  const timestamp = new Date().toLocaleString();
  
  switch (action.type) {
    case 'UPDATE_PRICE': {
      const newCommodities = state.commodities.map(c => {
        if (c.id === action.commodityId) {
          return {
            ...c,
            prices: c.prices.map(p => 
              p.state === action.state 
                ? { ...p, price: action.price, unit: action.unit, lastUpdated: new Date().toISOString().split('T')[0] } 
                : p
            )
          };
        }
        return c;
      });
      return {
        ...state,
        commodities: newCommodities,
        activityLog: [{ id: Date.now().toString(), timestamp, action: `Updated ${action.commodityId} price in ${action.state}` }, ...state.activityLog].slice(0, 10)
      };
    }
    case 'BULK_UPDATE': {
      const newCommodities = state.commodities.map(c => {
        if (c.id === action.commodityId) {
          const priceMap = new Map(action.updates.map(u => [u.state, u]));
          return {
            ...c,
            prices: c.prices.map(p => {
              const update = priceMap.get(p.state);
              return update ? { ...p, price: update.price, unit: update.unit, lastUpdated: new Date().toISOString().split('T')[0] } : p;
            })
          };
        }
        return c;
      });
      return {
        ...state,
        commodities: newCommodities,
        activityLog: [{ id: Date.now().toString(), timestamp, action: `Bulk updated ${action.commodityId} prices` }, ...state.activityLog].slice(0, 10)
      };
    }
    case 'UPDATE_COMMODITY':
      return {
        ...state,
        commodities: state.commodities.map(c => c.id === action.commodityId ? { ...c, ...action.data } : c),
        activityLog: [{ id: Date.now().toString(), timestamp, action: `Updated commodity details for ${action.commodityId}` }, ...state.activityLog].slice(0, 10)
      };
    case 'UPDATE_HERO':
      return {
        ...state,
        hero: action.data,
        activityLog: [{ id: Date.now().toString(), timestamp, action: 'Updated hero section content' }, ...state.activityLog].slice(0, 10)
      };
    case 'ADD_STATE':
      if (state.states.includes(action.state)) return state;
      return {
        ...state,
        states: [...state.states, action.state],
        commodities: state.commodities.map(c => ({
          ...c,
          prices: [...c.prices, { state: action.state, price: 0, unit: c.baseUnit, lastUpdated: '-', change: 0 }]
        })),
        activityLog: [{ id: Date.now().toString(), timestamp, action: `Added new state: ${action.state}` }, ...state.activityLog].slice(0, 10)
      };
    case 'REMOVE_STATE':
      return {
        ...state,
        states: state.states.filter(s => s !== action.state),
        commodities: state.commodities.map(c => ({
          ...c,
          prices: c.prices.filter(p => p.state !== action.state)
        })),
        activityLog: [{ id: Date.now().toString(), timestamp, action: `Removed state: ${action.state}` }, ...state.activityLog].slice(0, 10)
      };
    case 'ADD_LOG':
      return {
        ...state,
        activityLog: [{ id: Date.now().toString(), timestamp, action: action.action }, ...state.activityLog].slice(0, 10)
      };
    default:
      return state;
  }
}

// --- Icons Mapping ---
const iconMap: Record<string, React.ElementType> = {
  Droplets, Bean, Zap, Wheat, Sprout, CircleDot
};

// --- Components ---

const Navbar = ({ onAdminClick, isAdmin }: { onAdminClick: () => void, isAdmin: boolean }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            <span className="text-slate-900">AdI</span>
            <span className="text-primary">Insight</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-primary transition-colors">Dashboard</a>
          <a href="#" className="hover:text-primary transition-colors">Commodities</a>
          <a href="#" className="hover:text-primary transition-colors">Market Trends</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            {time.toLocaleTimeString()} | {time.toLocaleDateString()}
          </div>
          <button 
            onClick={onAdminClick}
            className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            {isAdmin ? <LayoutDashboard className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ config }: { config: AppState['hero'] }) => (
  <section className="relative overflow-hidden bg-primary py-20 lg:py-32 hero-pattern grain-overlay">
    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center lg:text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-semibold uppercase tracking-widest mb-6">
          Real-Time Nigerian Agro Commodity Intelligence
        </span>
        <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          {config.headline}
        </h2>
        <p className="text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
          {config.subheading}
        </p>
        <button className="px-8 py-4 bg-accent hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 transition-all transform hover:-translate-y-1 active:scale-95">
          {config.ctaText}
        </button>
      </motion.div>
    </div>
    
    {/* Decorative elements */}
    <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 pointer-events-none">
      <Leaf className="w-full h-full text-white rotate-12 translate-x-1/4 translate-y-1/4" />
    </div>
  </section>
);

const CommodityCard: React.FC<{ commodity: Commodity }> = ({ commodity }) => {
  const Icon = iconMap[commodity.icon] || Leaf;
  const avgPrice = useMemo(() => {
    const validPrices = commodity.prices.filter(p => p.price > 0);
    return validPrices.length > 0 
      ? validPrices.reduce((acc, p) => acc + p.price, 0) / validPrices.length 
      : 0;
  }, [commodity.prices]);

  const trend = commodity.history[commodity.history.length - 1].price >= commodity.history[0].price;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trend ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {trend ? '+' : ''}{((commodity.history[commodity.history.length - 1].price / commodity.history[0].price - 1) * 100).toFixed(1)}%
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1">{commodity.name}</h3>
      <p className="text-xs text-slate-500 mb-4 line-clamp-1">{commodity.description}</p>
      
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-2xl font-mono font-bold text-slate-900">
            ₦{avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-slate-400 ml-1">/ {commodity.baseUnit}</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">National Average</p>
        </div>
        
        <div className="h-12 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={commodity.history}>
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={trend ? "#10b981" : "#f43f5e"} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const PriceTable = ({ commodities, states }: { commodities: Commodity[], states: string[] }) => {
  const [activeTab, setActiveTab] = useState(commodities[0].id);
  const [search, setSearch] = useState('');
  
  const activeCommodity = commodities.find(c => c.id === activeTab)!;
  const filteredPrices = activeCommodity.prices.filter(p => 
    p.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Live Market Prices</h2>
          <p className="text-slate-500">Real-time breakdown of commodity prices across Nigerian states.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
        {commodities.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveTab(c.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === c.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Change (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="wait">
                {filteredPrices.map((p, idx) => (
                  <motion.tr 
                    key={`${activeTab}-${p.state}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">{p.state}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{p.unit}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {p.lastUpdated}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.change >= 0 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {p.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(p.change).toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredPrices.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            No data found for the selected state.
          </div>
        )}
      </div>
    </section>
  );
};

// --- Admin Panel ---

const AdminPanel = ({ state, dispatch, onLogout }: { state: AppState, dispatch: React.Dispatch<AppAction>, onLogout: () => void }) => {
  const [activeView, setActiveView] = useState<'prices' | 'bulk' | 'commodities' | 'hero' | 'states' | 'logs'>('prices');
  
  // Price Edit State
  const [editPrice, setEditPrice] = useState({ commodityId: state.commodities[0].id, state: state.states[0], price: '', unit: '' });
  
  // Bulk Update State
  const [bulkData, setBulkData] = useState('');
  const [bulkCommodity, setBulkCommodity] = useState(state.commodities[0].id);

  // Hero Edit State
  const [heroForm, setHeroForm] = useState(state.hero);

  // State Management
  const [newStateName, setNewStateName] = useState('');

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ 
      type: 'UPDATE_PRICE', 
      commodityId: editPrice.commodityId, 
      state: editPrice.state, 
      price: parseFloat(editPrice.price), 
      unit: editPrice.unit 
    });
    alert('Price updated successfully!');
  };

  const handleBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = bulkData.trim().split('\n');
      const updates = lines.map(line => {
        const [stateName, price, unit] = line.split(',').map(s => s.trim());
        if (!stateName || !price || !unit) throw new Error('Invalid format');
        return { state: stateName, price: parseFloat(price), unit };
      });
      dispatch({ type: 'BULK_UPDATE', commodityId: bulkCommodity, updates });
      setBulkData('');
      alert('Bulk update successful!');
    } catch (err) {
      alert('Error parsing CSV data. Ensure format: State,Price,Unit');
    }
  };

  const handleHeroUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_HERO', data: heroForm });
    alert('Hero section updated!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary-light" />
            <span className="font-serif font-bold text-xl">Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'prices', label: 'Edit Prices', icon: Edit3 },
            { id: 'bulk', label: 'Bulk Update', icon: Upload },
            { id: 'commodities', label: 'Commodity Details', icon: FileText },
            { id: 'hero', label: 'Hero Editor', icon: LayoutDashboard },
            { id: 'states', label: 'Manage States', icon: Plus },
            { id: 'logs', label: 'Activity Log', icon: Clock },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === item.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeView.replace('-', ' ')}</h2>
          <div className="text-sm text-slate-500">Logged in as Administrator</div>
        </header>

        <div className="max-w-4xl">
          {activeView === 'prices' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handlePriceUpdate} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Select Commodity</label>
                    <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                      value={editPrice.commodityId}
                      onChange={(e) => setEditPrice({ ...editPrice, commodityId: e.target.value })}
                    >
                      {state.commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Select State</label>
                    <select 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                      value={editPrice.state}
                      onChange={(e) => setEditPrice({ ...editPrice, state: e.target.value })}
                    >
                      {state.states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">New Price (₦)</label>
                    <input 
                      type="number"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                      value={editPrice.price}
                      onChange={(e) => setEditPrice({ ...editPrice, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Unit</label>
                    <input 
                      type="text"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                      value={editPrice.unit}
                      onChange={(e) => setEditPrice({ ...editPrice, unit: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {activeView === 'bulk' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleBulkUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Select Commodity</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    value={bulkCommodity}
                    onChange={(e) => setBulkCommodity(e.target.value)}
                  >
                    {state.commodities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">CSV Data (State, Price, Unit)</label>
                  <textarea 
                    rows={8}
                    placeholder="Lagos, 9000, kg&#10;Kano, 7200, kg&#10;Abuja, 8500, kg"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 font-mono text-sm"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                  />
                </div>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
                  <Upload className="w-4 h-4" />
                  Process Bulk Update
                </button>
              </form>
            </div>
          )}

          {activeView === 'hero' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <form onSubmit={handleHeroUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Headline</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    value={heroForm.headline}
                    onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Subheading</label>
                  <textarea 
                    rows={3}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    value={heroForm.subheading}
                    onChange={(e) => setHeroForm({ ...heroForm, subheading: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">CTA Text</label>
                  <input 
                    type="text"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    value={heroForm.ctaText}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                  />
                </div>
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
                  <Save className="w-4 h-4" />
                  Update Hero Section
                </button>
              </form>
            </div>
          )}

          {activeView === 'states' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-4">
                  <input 
                    type="text"
                    placeholder="Enter state name..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (newStateName) {
                        dispatch({ type: 'ADD_STATE', state: newStateName });
                        setNewStateName('');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add State
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">State Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.states.map(s => (
                      <tr key={s} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{s}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => dispatch({ type: 'REMOVE_STATE', state: s })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'logs' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {state.activityLog.map(log => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 font-medium">{log.action}</p>
                      <p className="text-xs text-slate-400 mt-1">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_DATA);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'adinsight2024') {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      setError('');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  if (isAdmin) {
    return <AdminPanel state={state} dispatch={dispatch} onLogout={() => setIsAdmin(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onAdminClick={() => setShowLogin(true)} isAdmin={isAdmin} />
      
      <main className="flex-1">
        <Hero config={state.hero} />
        
        <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.commodities.map(c => (
              <CommodityCard key={c.id} commodity={c} />
            ))}
          </div>
        </section>

        <PriceTable commodities={state.commodities} states={state.states} />
      </main>

      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="w-8 h-8 text-primary-light" />
                <h2 className="text-3xl font-serif font-bold tracking-tight">
                  <span className="text-white">AdI</span>
                  <span className="text-primary-light">Insight</span>
                </h2>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed">
                AdIInsight is Nigeria's leading platform for real-time agricultural commodity intelligence. 
                We empower farmers, traders, and investors with accurate data to navigate the dynamic agro-market.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-slate-500">Quick Links</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-primary-light transition-colors">Market Analysis</a></li>
                <li><a href="#" className="hover:text-primary-light transition-colors">State Reports</a></li>
                <li><a href="#" className="hover:text-primary-light transition-colors">Pricing Methodology</a></li>
                <li><a href="#" className="hover:text-primary-light transition-colors">Partner with Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 uppercase tracking-wider text-xs text-slate-500">Contact</h4>
              <ul className="space-y-4 text-slate-400">
                <li>info@adinsight.ng</li>
                <li>+234 800 ADI INSIGHT</li>
                <li>Lagos, Nigeria</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2024 AdIInsight Intelligence. All rights reserved.</p>
            <p className="italic text-xs">Disclaimer: Market prices are indicative and subject to change based on local market conditions.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-slate-900">Admin Login</h3>
                  </div>
                  <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Access Password</label>
                    <input 
                      type="password"
                      autoFocus
                      required
                      placeholder="••••••••"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
                  </div>
                  <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                    Enter Dashboard
                  </button>
                </form>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">
                  Authorized personnel only. All access attempts are logged.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
