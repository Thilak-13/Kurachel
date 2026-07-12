import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/reportApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Truck, Navigation, Users, Activity, Clock, Wrench, Percent } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-red-500 font-semibold">Error loading dashboard metrics.</div>;

  const kpis = [
    { name: 'Active Vehicles', value: data.activeVehicles, icon: Truck, color: 'bg-blue-500 text-blue-500', trend: 'In service' },
    { name: 'Available Vehicles', value: data.availableVehicles, icon: Activity, color: 'bg-emerald-500 text-emerald-500', trend: 'Ready' },
    { name: 'Vehicles in Maintenance', value: data.vehiclesInMaintenance, icon: Wrench, color: 'bg-amber-500 text-amber-500', trend: 'Scheduled/Active' },
    { name: 'Active Trips', value: data.activeTrips, icon: Navigation, color: 'bg-indigo-500 text-indigo-500', trend: 'On road' },
    { name: 'Pending Trips', value: data.pendingTrips, icon: Clock, color: 'bg-slate-500 text-slate-500', trend: 'In queue' },
    { name: 'Drivers on Duty', value: data.driversOnDuty, icon: Users, color: 'bg-cyan-500 text-cyan-500', trend: 'Logged in' },
    { name: 'Fleet Utilization', value: `${data.fleetUtilization}%`, icon: Percent, color: 'bg-purple-500 text-purple-500', trend: 'Target: 85%' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.username}!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-blue-600">{user?.role}</span>. Here is the operational summary of your fleet.
          </p>
        </div>
        <div className="text-sm text-slate-555 font-medium bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 self-start md:self-auto">
          System Time: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.name}
              className={`bg-white rounded-2xl p-5 border border-slate-200/85 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${
                kpis.length % 4 !== 0 && index === kpis.length - 1 ? 'sm:col-span-2 lg:col-span-4' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{kpi.name}</span>
                <div className={`p-2.5 rounded-xl bg-opacity-10 ${kpi.color}`}>
                  <Icon className="w-5 h-5 font-bold" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</span>
                <span className="text-xs font-semibold text-slate-400">{kpi.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trip Volume (Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Weekly Trip Volume</h3>
            <p className="text-xs text-slate-500">Number of successfully dispatched trips by day</p>
          </div>
          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyTrips} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="trips" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status Distribution (Pie Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Vehicle Status Distribution</h3>
            <p className="text-xs text-slate-500">Allocation and availability breakdown of fleet vehicles</p>
          </div>
          <div className="h-80 w-full flex-1 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.vehicleStatusDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.vehicleStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span className="text-xs font-semibold text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
