import React from 'react';

export default function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s) {
      // General Available / Closed / Completed
      case 'Available':
      case 'Completed':
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      
      // Dispatched / On Trip
      case 'Dispatched':
      case 'On Trip':
        return 'bg-blue-100 text-blue-800 border-blue-200';

      // Draft
      case 'Draft':
        return 'bg-slate-100 text-slate-600 border-slate-200';

      // Cancelled
      case 'Cancelled':
      case 'Suspended':
        return 'bg-rose-100 text-rose-800 border-rose-200';

      // Maintenance Open / In Shop / On Break
      case 'Open':
      case 'In Shop':
      case 'On Break':
        return 'bg-amber-100 text-amber-800 border-amber-200';

      // Inactive / Retired
      case 'Inactive':
      case 'Retired':
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
