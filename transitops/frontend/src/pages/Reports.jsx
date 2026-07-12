import React, { useState, useEffect, useCallback } from 'react';
import { getReportData, exportReportCSV } from '../services/reportApi';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  FileText, Download, TrendingUp, DollarSign, Clock, Fuel,
  AlertCircle, RefreshCw, Filter, Search, BarChart2
} from 'lucide-react';

const PALETTE = {
  blue:   '#3b82f6',
  emerald:'#10b981',
  amber:  '#f59e0b',
  violet: '#8b5cf6',
  rose:   '#ef4444',
};

// ── Shared tooltip ─────────────────────────────
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

// ── Chart card wrapper ──────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Skeleton ────────────────────────────────────
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-100">
    {[...Array(10)].map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

export default function Reports({ user }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError]       = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    vehicle: '',
    dateFrom: '',
    dateTo: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getReportData(filters);
      setData(result);
    } catch (err) {
      console.error('Reports load error:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = async () => {
    if (!data?.vehicleReports?.length) return;
    setExporting(true);
    try {
      await exportReportCSV(data.vehicleReports);
    } catch (err) {
      console.error('CSV export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // ── Highlight KPIs ─────────────────────────
  const highlights = data ? [
    { name: 'Fleet Uptime',       value: `${data.fleetUptime}%`,                     icon: TrendingUp,  color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Completed Trips',    value: data.completedTripsCount.toLocaleString(),   icon: FileText,    color: 'text-blue-600 bg-blue-50' },
    { name: 'Fuel Expenses',      value: `$${data.fuelExpenses.toLocaleString()}`,    icon: DollarSign,  color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Maintenance Downtime', value: `${data.maintenanceDowntimeHours} hrs`,    icon: Clock,       color: 'text-amber-600 bg-amber-50' },
  ] : [];

  const rows         = data?.vehicleReports || [];
  const charts       = data?.analyticsCharts || {};

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operational Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Analyze fleet performance, fuel efficiency, revenue, and ROI metrics
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setFiltersOpen(f => !f)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold rounded-xl border transition-all
              ${filtersOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading || !rows.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700
              text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95
              disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────── */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Vehicle / Reg. No.
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={filters.vehicle}
                onChange={e => setFilters(f => ({ ...f, vehicle: e.target.value }))}
                placeholder="e.g. TX-1234"
                className="pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setFilters({ vehicle: '', dateFrom: '', dateTo: '' })}
            className="px-3 py-2 text-sm font-bold text-slate-600 border border-slate-200
              bg-white rounded-xl hover:bg-slate-50 transition-all"
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
          <button onClick={loadData} className="text-sm font-bold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* ── Highlight KPIs ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm animate-pulse h-24" />
          ))
          : highlights.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`p-3 rounded-xl flex-shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">{item.value}</p>
                </div>
              </div>
            );
          })
        }
      </div>

      {/* ── Analytics Charts ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Efficiency Bar Chart */}
        <ChartCard title="Fuel Efficiency (mpg)" subtitle="Miles per gallon by vehicle registration">
          <div className="h-60">
            {loading
              ? <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.fuelEfficiency || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="vehicle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit=" mpg" />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="efficiency" name="Fuel Efficiency (mpg)" fill={PALETTE.emerald}
                      radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </ChartCard>

        {/* Operational Cost Bar Chart */}
        <ChartCard title="Operational Cost ($)" subtitle="Total operating costs by vehicle">
          <div className="h-60">
            {loading
              ? <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.operationalCost || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="vehicle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="cost" name="Operational Cost ($)" fill={PALETTE.amber}
                      radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
          </div>
        </ChartCard>

        {/* Revenue Line Chart */}
        <ChartCard title="Revenue ($)" subtitle="Total revenue generated per vehicle">
          <div className="h-60">
            {loading
              ? <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.revenue || []} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="vehicle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<DarkTooltip />} />
                    <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke={PALETTE.blue}
                      strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.blue }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </ChartCard>

        {/* ROI Line Chart */}
        <ChartCard title="Return on Investment (%)" subtitle="ROI percentage by vehicle">
          <div className="h-60">
            {loading
              ? <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.roi || []} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="vehicle" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                    <Tooltip content={<DarkTooltip />} />
                    <Line type="monotone" dataKey="roi" name="ROI (%)" stroke={PALETTE.violet}
                      strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.violet }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </ChartCard>
      </div>

      {/* ── Vehicle Report Table ──────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900">Fleet Performance Report</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {rows.length} vehicle{rows.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Vehicle</th>
                <th className="py-3.5 px-5">Reg. Number</th>
                <th className="py-3.5 px-5">Distance (mi)</th>
                <th className="py-3.5 px-5">Fuel (gal)</th>
                <th className="py-3.5 px-5">Efficiency (mpg)</th>
                <th className="py-3.5 px-5">Fuel Cost ($)</th>
                <th className="py-3.5 px-5">Maint. Cost ($)</th>
                <th className="py-3.5 px-5">Op. Cost ($)</th>
                <th className="py-3.5 px-5">Revenue ($)</th>
                <th className="py-3.5 px-5">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {loading
                ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={10}>
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                          <FileText className="w-12 h-12 text-slate-300" />
                          <div className="text-center">
                            <p className="font-bold text-slate-600">No Report Data</p>
                            <p className="text-xs mt-0.5">Adjust filters or refresh to load vehicle analytics.</p>
                          </div>
                          <button onClick={loadData} className="text-sm font-bold text-blue-600 hover:underline">
                            Refresh
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                  : rows.map(row => {
                    const roiGood = row.roi >= 90;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{row.vehicle}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-500">{row.registrationNumber}</td>
                        <td className="py-3.5 px-5 tabular-nums">{row.distanceTravelled.toLocaleString()}</td>
                        <td className="py-3.5 px-5 tabular-nums">{row.fuelConsumed.toLocaleString()}</td>
                        <td className="py-3.5 px-5 tabular-nums font-bold text-emerald-600">{row.fuelEfficiency}</td>
                        <td className="py-3.5 px-5 tabular-nums">${row.fuelCost.toLocaleString()}</td>
                        <td className="py-3.5 px-5 tabular-nums">${row.maintenanceCost.toLocaleString()}</td>
                        <td className="py-3.5 px-5 tabular-nums font-bold text-amber-600">${row.operationalCost.toLocaleString()}</td>
                        <td className="py-3.5 px-5 tabular-nums font-bold text-blue-600">${row.revenue.toLocaleString()}</td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-extrabold
                            ${roiGood
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                            {row.roi}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
