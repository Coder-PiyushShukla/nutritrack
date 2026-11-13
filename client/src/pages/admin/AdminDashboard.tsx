import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Award,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Plus,
  ArrowUpRight,
  Database,
  BarChart3,
  Calendar
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { UserAccount } from '../../types';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@studio.com',
    role: 'dieter',
    status: 'active',
    joinedDate: 'Oct 14, 2026',
    activityCount: 142,
  },
  {
    id: 'usr-2',
    name: 'Dr. Maya Lin, RD',
    email: 'maya.lin@clinical.org',
    role: 'nutritionist',
    status: 'active',
    joinedDate: 'Aug 02, 2026',
    activityCount: 88,
  },
  {
    id: 'usr-3',
    name: 'Julian Vance, M.S.',
    email: 'julian.vance@nutrition.edu',
    role: 'nutritionist',
    status: 'pending',
    joinedDate: 'Oct 29, 2026',
    activityCount: 0,
  },
  {
    id: 'usr-4',
    name: 'Chloe Sinclair',
    email: 'chloe.s@kinfolk.co',
    role: 'dieter',
    status: 'active',
    joinedDate: 'Sep 19, 2026',
    activityCount: 97,
  },
  {
    id: 'usr-5',
    name: 'Sophia Aris',
    email: 'sophia.aris@lead.net',
    role: 'admin',
    status: 'active',
    joinedDate: 'Jan 10, 2026',
    activityCount: 310,
  },
];

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'dieter' | 'nutritionist' | 'pending'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return u.status === 'pending';
    return u.role === activeTab;
  });

  const handleApprove = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'active' } : u))
    );
  };

  const handleReject = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u))
    );
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        return {
          ...u,
          status: u.status === 'active' ? 'suspended' : 'active',
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-ivory text-forest paper-grain selection:bg-lime selection:text-forest">
      <Navbar />

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-forest/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-forest/60">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <span>Platform Governance Console</span>
              <span className="text-forest/30">•</span>
              <span className="text-lime-muted font-semibold">Master Admin Access</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-forest">
              System Operations & Audits
            </h1>
            <p className="text-forest/75 text-sm sm:text-base max-w-xl">
              Supervise multi-role account verifications, review certified nutritionist credentials, 
              and inspect platform-wide health metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 bg-forest text-ivory rounded-full text-xs font-mono font-semibold">
              Live System Status: Nominal
            </span>
          </div>
        </section>

        {/* 1. KPI STAT CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-ivory border border-forest/15 shadow-card space-y-3">
            <div className="flex items-center justify-between text-forest/50">
              <span className="text-xs font-mono uppercase tracking-wider">Total Dieters</span>
              <Users className="w-5 h-5 text-forest" />
            </div>
            <div className="font-serif text-4xl font-bold text-forest">
              12,480
            </div>
            <div className="text-xs text-lime-muted font-bold font-mono">
              +18.4% month-over-month
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-ivory border border-forest/15 shadow-card space-y-3">
            <div className="flex items-center justify-between text-forest/50">
              <span className="text-xs font-mono uppercase tracking-wider">Active Subscriptions</span>
              <Award className="w-5 h-5 text-forest" />
            </div>
            <div className="font-serif text-4xl font-bold text-forest">
              9,210
            </div>
            <div className="text-xs text-lime-muted font-bold font-mono">
              73.7% holistic retention
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-ivory border border-forest/15 shadow-card space-y-3">
            <div className="flex items-center justify-between text-forest/50">
              <span className="text-xs font-mono uppercase tracking-wider">Verified Nutritionists</span>
              <ShieldCheck className="w-5 h-5 text-forest" />
            </div>
            <div className="font-serif text-4xl font-bold text-forest">
              58
            </div>
            <div className="text-xs text-forest/60 font-mono">
              1 pending application
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-ivory border border-forest/15 shadow-card space-y-3">
            <div className="flex items-center justify-between text-forest/50">
              <span className="text-xs font-mono uppercase tracking-wider">Catalog Items</span>
              <Database className="w-5 h-5 text-forest" />
            </div>
            <div className="font-serif text-4xl font-bold text-forest">
              1,420
            </div>
            <div className="text-xs text-forest/60 font-mono">
              100% verified macro data
            </div>
          </div>
        </section>

        {/* 2. USER & NUTRITIONIST MANAGEMENT SECTION */}
        <section className="bg-ivory rounded-3xl border border-forest/15 shadow-card overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-forest/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ivory-light">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: 'all', label: 'All Accounts' },
                  { id: 'dieter', label: 'Dieters' },
                  { id: 'nutritionist', label: 'Nutritionists' },
                  { id: 'pending', label: 'Pending Approvals' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-forest text-ivory shadow-subtle'
                      : 'bg-ivory border border-forest/10 text-forest/70 hover:border-forest/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-forest/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-ivory border border-forest/15 rounded-full text-xs text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-light/50 border-b border-forest/10 text-xs font-mono uppercase tracking-wider text-forest/60">
                  <th className="py-4 px-6">Account Holder</th>
                  <th className="py-4 px-6">Assigned Role</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Logs Recorded</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-ivory-light/40 transition-colors">
                    {/* User */}
                    <td className="py-4 px-6">
                      <span className="font-serif font-bold text-forest block">
                        {user.name}
                      </span>
                      <span className="text-xs text-forest/50 font-mono">
                        {user.email}
                      </span>
                    </td>

                    {/* Role Badges: Dieter=Lime, Nutritionist=Forest, Admin=Outlined */}
                    <td className="py-4 px-6">
                      {user.role === 'dieter' && (
                        <span className="px-3 py-1 rounded-full bg-lime text-forest text-xs font-bold font-mono">
                          Dieter
                        </span>
                      )}
                      {user.role === 'nutritionist' && (
                        <span className="px-3 py-1 rounded-full bg-forest text-ivory text-xs font-bold font-mono">
                          Nutritionist
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="px-3 py-1 rounded-full border border-forest text-forest text-xs font-bold font-mono">
                          Administrator
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 text-center">
                      {user.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-forest font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime" />
                          <span>Active</span>
                        </span>
                      )}
                      {user.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold px-2.5 py-0.5 rounded-full bg-amber-100">
                          Pending Approval
                        </span>
                      )}
                      {user.status === 'suspended' && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-forest/50 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-forest/40" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="py-4 px-6 text-xs text-forest/60 font-mono">
                      {user.joinedDate}
                    </td>

                    {/* Activity */}
                    <td className="py-4 px-6 text-center font-mono font-bold text-forest text-xs">
                      {user.activityCount}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      {user.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="bg-lime text-forest font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-lime-hover shadow-subtle"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(user.id)}
                            className="border border-forest/20 text-forest text-xs px-3.5 py-1.5 rounded-full hover:bg-forest/5"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className="text-xs font-semibold underline text-forest hover:text-forest-light"
                        >
                          {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
