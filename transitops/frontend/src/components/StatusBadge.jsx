import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'On Trip':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Shop':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Retired':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Suspended':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
}
