import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Send,
  Sparkles,
  PieChart,
  UserCheck,
  Bell,
  Zap
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import LiveConsultationDrawer from '../../components/chat/LiveConsultationDrawer';
import { getSocket, identifyUser, registerListener } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile } from '../../types';

const SAMPLE_CLIENTS: ClientProfile[] = [
  {
    id: 'client-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@studio.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    goal: 'Lean Muscle & Metabolic Equilibrium',
    targetKcal: 2150,
    adherenceRate: 96,
    lastActive: '12 mins ago',
    status: 'active',
    dietPreference: 'Mediterranean Whole Foods • High Protein',
    notes: 'Client showing exceptional consistency with fiber and hydration. Recommend increasing evening magnesium and zinc sources.',
    recentMeals: [
      { name: 'Wild Blueberry & Greek Yogurt Nourish Bowl', kcal: 380, time: '08:15 AM' },
      { name: 'Forest Kale & French Puy Lentil Salad', kcal: 520, time: '01:10 PM' },
      { name: 'Ceremonial Matcha & Pistachio Energy Bites', kcal: 190, time: '04:30 PM' },
    ]
  },
  {
    id: 'client-2',
    name: 'Chloe Sinclair',
    email: 'chloe.s@kinfolk.co',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    goal: 'Plant-Based Endurance & Iron Absorption',
    targetKcal: 1900,
    adherenceRate: 91,
    lastActive: '2 hours ago',
    status: 'active',
    dietPreference: 'Strict Vegan • Gluten-Free',
    notes: 'Monitor B12 and ferritin levels. Client has adapted well to sprouted legumes and cold-pressed pumpkin seed dressings.',
    recentMeals: [
      { name: 'Sprouted Overnight Oats & Chia Seeds', kcal: 340, time: '08:45 AM' },
      { name: 'Roasted Tempeh & Tahini Nourish Plate', kcal: 510, time: '01:30 PM' },
    ]
  },
  {
    id: 'client-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@architect.net',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    goal: 'Post-Travel Reset & Insulin Sensitivity',
    targetKcal: 2300,
    adherenceRate: 74,
    lastActive: 'Yesterday',
    status: 'review_needed',
    dietPreference: 'Pescatarian • Low Sodium',
    notes: 'Travel schedule caused slight dip in weekend vegetable intake. Prescribed simplified 3-ingredient prep framework for flights.',
    recentMeals: [
      { name: 'Poached Eggs & Wild Sockeye Tartine', kcal: 420, time: '09:00 AM' },
      { name: 'Avocado Caesar with Hemp Seed Crunch', kcal: 580, time: '02:15 PM' },
    ]
  },
  {
    id: 'client-4',
    name: 'Sunita Rao',
    email: 'sunita.rao@wellness.in',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    goal: 'Hormonal Balance & Anti-Inflammatory',
    targetKcal: 1850,
    adherenceRate: 98,
    lastActive: '34 mins ago',
    status: 'active',
    dietPreference: 'Ayurvedic-Inspired Whole Food',
    notes: 'Remarkable inflammatory marker drop. Incorporating golden milk with fresh turmeric root and black pepper nightly.',
    recentMeals: [
      { name: 'Spiced Quinoa Porridge with Cardamom', kcal: 320, time: '08:00 AM' },
      { name: 'Turmeric Yellow Lentil Kitchari & Ghee', kcal: 490, time: '12:45 PM' },
      { name: 'Steamed Asparagus & Walnuts', kcal: 180, time: '05:00 PM' },
    ]
  }
];

export const NutritionistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>(SAMPLE_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [search, setSearch] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [liveAlert, setLiveAlert] = useState<{ message: string; mealType?: string; kcal?: number; timestamp: string } | null>(null);

  // Initialize Socket.IO connection for Nutritionist role
  useEffect(() => {
    const socket = getSocket();

    identifyUser({
      userId: 'usr-nutritionist-maya',
      role: 'nutritionist',
      name: 'Dr. Maya Lin, RD',
    });

    const handleMealLoggedActivity = (data: any) => {
      console.log('⚡ [Real-Time Socket.IO] Received meal_logged activity:', data);
      const clientName = data.userName || 'Aarav Mehta';
      const mealType = data.mealType || 'meal';
      const kcal = data.totalCalories || 450;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setLiveAlert({
        message: `${clientName} just logged a ${mealType} (${kcal} kcal)`,
        mealType,
        kcal,
        timestamp: timeStr,
      });

      // Dynamically update client roster in real-time
      setClients(prev =>
        prev.map(c => {
          if (c.name.toLowerCase().includes(clientName.toLowerCase().split(' ')[0])) {
            const newMeal = {
              name: `Live Entry: ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`,
              kcal,
              time: timeStr,
            };
            return {
              ...c,
              lastActive: 'Just now (Live)',
              adherenceRate: Math.min(100, c.adherenceRate + 1),
              recentMeals: [newMeal, ...c.recentMeals],
            };
          }
          return c;
        })
      );

      // Auto dismiss alert banner after 8 seconds
      setTimeout(() => {
        setLiveAlert(null);
      }, 8000);
    };

    const unreg = registerListener('activity:meal_logged', handleMealLoggedActivity);

    return () => {
      unreg();
    };
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.goal.toLowerCase().includes(search.toLowerCase()) ||
    c.dietPreference.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenClient = (client: ClientProfile) => {
    setSelectedClient(client);
    setNotesInput(client.notes);
    setIsSavedNotice(false);
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setClients(prev =>
      prev.map(c => (c.id === selectedClient.id ? { ...c, notes: notesInput } : c))
    );
    setSelectedClient(prev => (prev ? { ...prev, notes: notesInput } : null));
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-ivory text-forest paper-grain selection:bg-lime selection:text-forest">
      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-forest/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-forest/60">
              <UserCheck className="w-4 h-4 text-forest" />
              <span>Nutritionist Practice Portal</span>
              <span className="text-forest/30">•</span>
              <span className="text-lime-muted font-semibold">{user?.name || 'Dr. Maya Lin, RD'}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-forest">
              Clinical Client Roster
            </h1>
            <p className="text-forest/75 text-sm sm:text-base max-w-xl">
              Monitor client nourishment logs, review adherence percentages, and prescribe 
              holistic dietary adjustments in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-forest text-ivory text-xs px-4 py-2.5 rounded-full font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>{clients.length} Active Consultations</span>
            </div>
          </div>
        </section>

        {/* Real-Time Live Activity Notification Banner (Socket.IO) */}
        <AnimatePresence>
          {liveAlert && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              className="p-4 rounded-2xl bg-forest text-ivory border border-lime shadow-lift flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-lime text-forest flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-forest fill-forest" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-lime text-forest px-2 py-0.5 rounded-full font-bold">
                      Socket.IO Real-Time Stream
                    </span>
                    <span className="text-xs text-ivory/60">{liveAlert.timestamp}</span>
                  </div>
                  <p className="text-sm font-semibold tracking-tight text-ivory mt-0.5">
                    {liveAlert.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLiveAlert(null)}
                className="text-ivory/60 hover:text-ivory p-1.5 rounded-full hover:bg-forest-light/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter clients by name, focus, or dietary pattern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-ivory-light border border-forest/15 rounded-full text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>
          <div className="text-xs text-forest/60 flex items-center gap-2">
            <span>Showing {filteredClients.length} of {clients.length} assigned clients</span>
          </div>
        </div>

        {/* Client Roster Table (Responsive Cards on Mobile) */}
        <section className="bg-ivory rounded-3xl border border-forest/15 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-light border-b border-forest/10 text-xs font-mono uppercase tracking-wider text-forest/60">
                  <th className="py-4 px-6">Client Profile</th>
                  <th className="py-4 px-6">Nourishment Goal</th>
                  <th className="py-4 px-6 text-center">Adherence</th>
                  <th className="py-4 px-6">Last Active</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 text-sm">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => handleOpenClient(client)}
                    className="hover:bg-ivory-light/70 transition-colors cursor-pointer group"
                  >
                    {/* Client info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={client.avatar}
                          alt={client.name}
                          className="w-10 h-10 rounded-full object-cover border border-forest/15"
                        />
                        <div>
                          <span className="font-serif font-bold text-forest group-hover:text-forest-light block">
                            {client.name}
                          </span>
                          <span className="text-xs text-forest/50 font-mono">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Goal */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-forest/80 line-clamp-1">
                        {client.goal}
                      </span>
                      <span className="text-[11px] text-forest/50 block font-mono">
                        Target: {client.targetKcal} kcal/day
                      </span>
                    </td>

                    {/* Adherence */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/5 border border-forest/10">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            client.adherenceRate >= 90 ? 'bg-lime' : 'bg-forest/60'
                          }`}
                        />
                        <span className="font-mono text-xs font-bold text-forest">
                          {client.adherenceRate}%
                        </span>
                      </div>
                    </td>

                    {/* Last active */}
                    <td className="py-4 px-6 text-xs text-forest/60 font-mono">
                      {client.lastActive}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {client.status === 'active' ? (
                        <span className="px-2.5 py-1 rounded-full bg-lime/30 text-forest text-xs font-bold font-mono">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-forest text-ivory text-xs font-bold font-mono">
                          Review Needed
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClient(client);
                        }}
                        className="bg-forest text-ivory text-xs px-4 py-2 rounded-full hover:bg-forest-light transition-colors inline-flex items-center gap-1.5 font-semibold"
                      >
                        <span>Inspect Drawer</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CLIENT DETAIL DRAWER / WORKSPACE (Modal/Drawer) */}
        <AnimatePresence>
          {selectedClient && (
            <div className="fixed inset-0 z-50 flex items-center justify-end">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClient(null)}
                className="fixed inset-0 bg-forest-dark/60 backdrop-blur-sm"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl h-full bg-ivory shadow-lift border-l border-forest/15 z-10 flex flex-col overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="px-8 py-6 border-b border-forest/10 flex items-center justify-between bg-ivory-light">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedClient.avatar}
                      alt={selectedClient.name}
                      className="w-12 h-12 rounded-full object-cover border border-forest/20"
                    />
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-forest">
                        {selectedClient.name}
                      </h3>
                      <p className="text-xs text-forest/60 font-mono">
                        {selectedClient.dietPreference}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="p-2 rounded-full hover:bg-forest/10 text-forest/60 hover:text-forest transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-8 space-y-8 flex-1">
                  {/* Goal and Adherence Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
                      <span className="text-[11px] font-mono uppercase text-forest/50">
                        Adherence Rating
                      </span>
                      <div className="font-serif text-3xl font-bold text-forest">
                        {selectedClient.adherenceRate}%
                      </div>
                      <span className="text-xs text-lime-muted font-semibold block">
                        Verified Weekly Metric
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-ivory-light border border-forest/10 space-y-1">
                      <span className="text-[11px] font-mono uppercase text-forest/50">
                        Caloric Target
                      </span>
                      <div className="font-serif text-3xl font-bold text-forest">
                        {selectedClient.targetKcal}
                      </div>
                      <span className="text-xs text-forest/60 block">
                        kcal / 24 hours
                      </span>
                    </div>
                  </div>

                  {/* Recent Meal Logs for Review */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-forest">
                        Recent Logged Meals
                      </h4>
                      <span className="text-xs font-mono text-forest/50">Today</span>
                    </div>
                    <div className="space-y-2">
                      {selectedClient.recentMeals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-ivory-light border border-forest/10 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-forest block">
                              {meal.name}
                            </span>
                            <span className="text-forest/50 font-mono">{meal.time}</span>
                          </div>
                          <span className="font-mono font-bold text-forest">
                            {meal.kcal} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Recommendations & Notes Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-forest" />
                        <span>Prescribed Clinical Notes</span>
                      </h4>
                      {isSavedNotice && (
                        <span className="text-xs text-forest font-semibold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
                          <span>Saved to client diary</span>
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleSaveNotes} className="space-y-3">
                      <textarea
                        rows={5}
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Type dietary adjustments, micro-nutrient additions, or encouragement..."
                        className="w-full p-4 bg-ivory-light border border-forest/15 rounded-2xl text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-lime resize-none"
                      />
                      <button
                        type="submit"
                        className="w-full bg-lime text-forest font-semibold py-3 rounded-full hover:bg-lime-hover shadow-subtle transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Update & Sync With Client</span>
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Real-Time Socket.IO Live Consultation Chat */}
      <LiveConsultationDrawer
        currentUser={{
          userId: user?.id || 'usr-nutritionist-maya',
          name: user?.name || 'Dr. Maya Lin, RD',
          role: 'nutritionist',
        }}
        recipientName="Aarav Mehta"
        recipientRole="Active Dieter Client"
        roomId="consultation-aarav-maya"
      />

      <Footer />
    </div>
  );
};

export default NutritionistDashboard;
