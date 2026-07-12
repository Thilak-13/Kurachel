import React from 'react';

export default function FilterDropdown({ value, onChange, options, label }) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">{label}:</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-700 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
