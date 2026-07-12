import React from 'react';
import StatusBadge from './StatusBadge';
import { Pencil, Trash2 } from 'lucide-react';

export default function VehicleTable({ vehicles, onEdit, onDelete, userRole }) {
  const isEditable = userRole === 'Admin' || userRole === 'Fleet Manager';

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        {/* Sticky Header */}
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
          <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Registration Number</th>
            <th className="py-3.5 px-6">Model</th>
            <th className="py-3.5 px-6">Type</th>
            <th className="py-3.5 px-6">Max Load (lbs)</th>
            <th className="py-3.5 px-6">Odometer</th>
            <th className="py-3.5 px-6">Acquisition Cost</th>
            <th className="py-3.5 px-6">Status</th>
            {isEditable && <th className="py-3.5 px-6 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-slate-50/75 transition-colors">
              <td className="py-4 px-6 font-bold text-slate-900">{vehicle.registrationNumber}</td>
              <td className="py-4 px-6 text-slate-600">{vehicle.model}</td>
              <td className="py-4 px-6">{vehicle.type}</td>
              <td className="py-4 px-6">{Number(vehicle.maxLoadCapacity).toLocaleString()}</td>
              <td className="py-4 px-6">{Number(vehicle.odometer).toLocaleString()} mi</td>
              <td className="py-4 px-6">${Number(vehicle.acquisitionCost).toLocaleString()}</td>
              <td className="py-4 px-6">
                <StatusBadge status={vehicle.status} />
              </td>
              {isEditable && (
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => onEdit(vehicle)}
                      title="Edit Vehicle"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      title="Delete Vehicle"
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
