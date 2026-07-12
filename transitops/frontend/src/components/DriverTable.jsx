import React from 'react';
import StatusBadge from './StatusBadge';
import { Pencil, Trash2 } from 'lucide-react';

export default function DriverTable({ drivers, onEdit, onDelete, userRole }) {
  const isEditable = userRole === 'Admin';

  const getSafetyScoreClass = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[800px]">
        {/* Sticky Header */}
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
          <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Driver Name</th>
            <th className="py-3.5 px-6">License Number</th>
            <th className="py-3.5 px-6">License Category</th>
            <th className="py-3.5 px-6">License Expiry</th>
            <th className="py-3.5 px-6">Phone Number</th>
            <th className="py-3.5 px-6">Safety Score</th>
            <th className="py-3.5 px-6">Status</th>
            {isEditable && <th className="py-3.5 px-6 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-slate-50/75 transition-colors">
              <td className="py-4 px-6 font-bold text-slate-900">{driver.name}</td>
              <td className="py-4 px-6 text-slate-600">{driver.licenseNumber}</td>
              <td className="py-4 px-6 font-semibold">{driver.licenseCategory}</td>
              <td className="py-4 px-6 text-slate-600">{driver.licenseExpiryDate}</td>
              <td className="py-4 px-6 text-slate-600">{driver.phoneNumber}</td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2 py-1.5 rounded-lg text-xs font-extrabold ${getSafetyScoreClass(driver.safetyScore)}`}>
                  {driver.safetyScore} / 100
                </span>
              </td>
              <td className="py-4 px-6">
                <StatusBadge status={driver.status} />
              </td>
              {isEditable && (
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => onEdit(driver)}
                      title="Edit Driver"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 active:scale-95 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(driver.id)}
                      title="Delete Driver"
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
