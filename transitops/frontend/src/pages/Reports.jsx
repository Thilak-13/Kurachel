import React, { useState, useEffect } from 'react';
import { getReportData } from '../services/reportApi';
import { FileText, Download, TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react';

export default function Reports({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReportData() {
      try {
        const result = await getReportData();
        setData(result);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Loading reports...</div>;
  }

  if (!data) return <div className="text-red-500 font-semibold">Error loading reports.</div>;

  const highlights = [
    { name: 'Fleet Uptime', value: `${data.fleetUptime}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Completed Trips', value: data.completedTripsCount.toLocaleString(), icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { name: 'Fuel Expenses', value: `$${data.fuelExpenses.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Maintenance Downtime', value: `${data.maintenanceDowntimeHours} hrs`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Operational Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Analyze monthly highlights, fleet metrics, and financial expenses</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 self-start sm:self-auto">
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Grid of highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
                <p className="text-2xl font-extrabold text-slate-950 mt-1">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical table card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Monthly Historical Trends</h3>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Year-to-date</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                <th className="py-4 px-6">Month</th>
                <th className="py-4 px-6">Completed Trips</th>
                <th className="py-4 px-6">Average Fleet Uptime</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {data.monthlyStats.map((stat) => (
                <tr key={stat.month} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{stat.month}</td>
                  <td className="py-4 px-6">{stat.trips.toLocaleString()}</td>
                  <td className="py-4 px-6">{stat.uptime}%</td>
                  <td className="py-4 px-6 text-right">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700">finalized</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
