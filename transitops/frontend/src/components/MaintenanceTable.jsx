import React from 'react';
import StatusBadge from './StatusBadge';
import { ShieldCheck, Eye, Wrench } from 'lucide-react';

export default function MaintenanceTable({ logs, vehicles, onCloseRecord, onViewRecord, userRole }) {
  const getVehicleLabel = (vId) => {
    const v = vehicles.find(item => item.id === vId);
    return v ? `${v.registrationNumber} (${v.model})` : vId || 'Unknown';
  };

  const isEditable = userRole === 'Admin' || userRole === 'Maintenance Manager';

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
          <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Vehicle</th>
            <th className="py-3.5 px-6">Maintenance Type</th>
            <th className="py-3.5 px-6">Opened Date</th>
            <th className="py-3.5 px-6">Closed Date</th>
            <th className="py-3.5 px-6">Status</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
              <td className="py-4 px-6 font-bold text-slate-900">{getVehicleLabel(log.vehicleId)}</td>
              <td className="py-4 px-6 font-bold text-blue-600">
                <span className="inline-flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" />
                  {log.type}
                </span>
              </td>
              <td className="py-4 px-6 text-slate-600">{log.openedDate}</td>
              <td className="py-4 px-6 text-slate-600">{log.closedDate || '---'}</td>
              <td className="py-4 px-6">
                <StatusBadge status={log.status} />
              </td>
              <td className="py-4 px-6 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  {log.status === 'Open' && isEditable && (
                    <button
                      onClick={() => onCloseRecord(log.id)}
                      title="Close Maintenance"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  )}
                  <button
                    onClick={() => onViewRecord(log)}
                    title="View Log Summary"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
