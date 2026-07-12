import React, { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../services/reportApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Truck, Navigation, Users, Activity, Clock, Wrench, TrendingUp,
  AlertCircle, RefreshCw, Filter
} from 'lucide-react';

const PALETTE = {
  blue:   '#3b82f6',
  emerald:'#10b981',
  amber:  '#f59e0b',
  rose:   '#ef4444',
  violet: '#8b5cf6',
  cyan:   '#06b6d4',
  slate:  '#64748b',
  indigo: '#6366f1',
};

const PIE_COLORS  = [PALETTE.blue, PALETTE.emerald, PALETTE.amber, PALETTE.rose];
const PIE_COLORS2 = [PALETTE.cyan, PALETTE.emerald, PALETTE.rose, PALETTE.slate];

const VEHICLE_TYPES  = ['All Types', 'Box Truck', 'Flatbed', 'Van', 'Tanker', 'Refrigerated'];
const VEHICLE_STATUSES = ['All Statuses', 'Available', 'On Trip', 'In Shop', 'Retired'];
const REGIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central'];

// ─── Tooltip ──────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-xl text-xs">
      {label && <p className="font-bold mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#fff' }}>
          {p.name}: <span className="font-extrabold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton Card ─────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse h-32" />
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse h-80" />
);

// ─── KPI Card ─────────────────────────────────
function KpiCard({ name, value, icon: Icon, bgColor, iconColor, trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{name}</span>
        <div className={`p-2.5 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold pb-0.5 ${trendUp ? 'text-emerald-500' : 'text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({ user }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    vehicleType: 'All Types',
    vehicleStatus: 'All Statuses',
    region: 'All Regions',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await getDashboard(filters);
      setData(stats);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // ── KPI definitions ──────────────────────────
  const kpis = data ? [
    { name: 'Active Vehicles',       value: data.activeVehicles,        icon: Truck,       bgColor: 'bg-blue-50',   iconColor: 'text-blue-600',   trend: 'On road' },
    { name: 'Available Vehicles',    value: data.availableVehicles,     icon: Activity,    bgColor: 'bg-emerald-50',iconColor: 'text-emerald-600',trend: 'Ready for dispatch', trendUp: true },
    { name: 'In Maintenance',        value: data.vehiclesInMaintenance, icon: Wrench,      bgColor: 'bg-amber-50',  iconColor: 'text-amber-600',  trend: 'Scheduled' },
    { name: 'Active Trips',          value: data.activeTrips,           icon: Navigation,  bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', trend: 'In transit' },
    { name: 'Pending Trips',         value: data.pendingTrips,          icon: Clock,       bgColor: 'bg-slate-50',  iconColor: 'text-slate-600',  trend: 'Draft / queued' },
    { name: 'Drivers on Duty',       value: data.driversOnDuty,         icon: Users,       bgColor: 'bg-cyan-50',   iconColor: 'text-cyan-600',   trend: 'Active shifts', trendUp: true },
    { name: 'Fleet Utilization',     value: `${data.fleetUtilization}%`,icon: TrendingUp,  bgColor: 'bg-violet-50', iconColor: 'text-violet-600', trend: 'Target: 85%', trendUp: data.fleetUtilization >= 85 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm
        flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.username || 'Operator'}!
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-blue-600">{user?.role}</span>
            {' '}· Fleet operational summary as of{' '}
            <span className="font-semibold">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFiltersOpen(f => !f)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl border transition-all
              ${filtersOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-bold rounded-xl
              border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all
              disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────── */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm
          flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Vehicle Type
            </label>
            <select
              value={filters.vehicleType}
              onChange={e => handleFilterChange('vehicleType', e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Vehicle Status
            </label>
            <select
              value={filters.vehicleStatus}
              onChange={e => handleFilterChange('vehicleStatus', e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {VEHICLE_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Region
            </label>
            <select
              value={filters.region}
              onChange={e => handleFilterChange('region', e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={() => setFilters({ vehicleType: 'All Types', vehicleStatus: 'All Statuses', region: 'All Regions' })}
            className="px-3 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 border
              border-slate-200 bg-white rounded-xl hover:bg-slate-50 transition-all"
          >
            Reset
          </button>
        </div>
      )}

      {/* ── Error ────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700 flex-1">{error}</p>
          <button
            onClick={loadData}
            className="text-sm font-bold text-red-600 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? [...Array(7)].map((_, i) => <SkeletonCard key={i} />)
          : kpis.map(kpi => (
            <KpiCard key={kpi.name} {...kpi} />
          ))
        }
      </div>

      {/* ── Charts Row 1: Bar Charts ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization by Type */}
        {loading ? <SkeletonChart /> : (
          <ChartCard
            title="Fleet Utilization by Vehicle Type"
            subtitle="Percentage of time vehicles are actively deployed per category"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.fleetUtilizationByType || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" tickLine={false} axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="utilization" name="Utilization %" fill={PALETTE.violet}
                    radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Weekly Trip Volume */}
        {loading ? <SkeletonChart /> : (
          <ChartCard
            title="Weekly Trip Volume"
            subtitle="Dispatched vs completed trips for the current week"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyTrips || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="trips" name="Dispatched" fill={PALETTE.blue}
                    radius={[6, 6, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="completed" name="Completed" fill={PALETTE.emerald}
                    radius={[6, 6, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* ── Charts Row 2: Pie Charts ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status Pie */}
        {loading ? <SkeletonChart /> : (
          <ChartCard
            title="Vehicle Status Distribution"
            subtitle="Current allocation breakdown across all fleet vehicles"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.vehicleStatusDistribution || []}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={95}
                    paddingAngle={4} dataKey="value"
                  >
                    {(data?.vehicleStatusDistribution || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"
                    formatter={v => <span className="text-xs font-semibold text-slate-600">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Driver Status Pie */}
        {loading ? <SkeletonChart /> : (
          <ChartCard
            title="Driver Status Distribution"
            subtitle="Active, available, and suspended driver headcount breakdown"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.driverStatusDistribution || []}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={95}
                    paddingAngle={4} dataKey="value"
                  >
                    {(data?.driverStatusDistribution || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS2[i % PIE_COLORS2.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"
                    formatter={v => <span className="text-xs font-semibold text-slate-600">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* ── Trip Status Bar Chart ─────────────── */}
      {loading ? <SkeletonChart /> : (
        <ChartCard
          title="Trip Status Breakdown"
          subtitle="Current distribution of all trip records across status states"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.tripStatusDistribution || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickLine={false} axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={90} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" name="Trips" radius={[0, 6, 6, 0]} maxBarSize={32}>
                  {(data?.tripStatusDistribution || []).map((entry, i) => {
                    const colors = [PALETTE.blue, PALETTE.slate, PALETTE.emerald, PALETTE.rose];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
