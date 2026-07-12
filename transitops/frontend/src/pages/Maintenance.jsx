import React, { useState } from 'react';
import { Wrench, Plus, Search, Calendar, PenTool } from 'lucide-react';

const initialLogs = [
  { id: 'm1', vehicle: 'v2 (TX-9012)', serviceType: 'Routine', description: 'Oil change and tire rotation', cost: 150, status: 'IN_PROGRESS', date: '2026-07-10' },
  { id: 'm2', vehicle: 'v4 (TX-5555)', serviceType: 'Repair', description: 'Brake pad replacement and rotor resurfacing', cost: 420, status: 'SCHEDULED', date: '2026-07-15' },
  { id: 'm3', vehicle: 'v1 (TX-1234)', serviceType: 'Inspection', description: 'Annual safety inspection and emission testing', cost: 85, status: 'COMPLETED', date: '2026-07-05' },
];

export default function Maintenance({ user }) {
  const [logs, setLogs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">In Progress</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Completed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Maintenance Tracking & Logging</h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule repairs, record log costs, and track fleet safety maintenance</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Dispatcher' || user?.role === 'Maintenance Manager') && (
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>Log Service</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search vehicle, service type, log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No maintenance logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-4 px-6">Log ID</th>
                  <th className="py-4 px-6">Vehicle</th>
                  <th className="py-4 px-6">Service Type</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Logged Date</th>
                  <th className="py-4 px-6">Estimated Cost</th>
                  <th className="py-4 px-6">Status</th>
                  {(user?.role === 'Admin' || user?.role === 'Maintenance Manager') && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-500">{log.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{log.vehicle}</td>
                    <td className="py-4 px-6 font-semibold text-blue-600">
                      <span className="flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{log.serviceType}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium max-w-xs truncate" title={log.description}>{log.description}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{log.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">${log.cost}</td>
                    <td className="py-4 px-6">{getStatusBadge(log.status)}</td>
                    {(user?.role === 'Admin' || user?.role === 'Maintenance Manager') && (
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors mr-3">Edit</button>
                        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors">Resolve</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
