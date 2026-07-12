import React from 'react';
import { X, Calendar, Wrench, ShieldCheck, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ViewMaintenanceModal({ isOpen, onClose, log, vehicle }) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-md border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900">Service Record Details</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase text-xs">Status</span>
              <StatusBadge status={log.status} />
            </div>
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Vehicle</span>
              <span className="font-bold text-slate-800">
                {vehicle ? `${vehicle.registrationNumber} (${vehicle.model})` : log.vehicleId}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]"><Wrench className="inline w-3 h-3 mr-1" />Type</span>
                <span className="font-bold text-blue-600">{log.type}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]"><Calendar className="inline w-3 h-3 mr-1" />Opened Date</span>
                <span className="font-bold text-slate-800">{log.openedDate}</span>
              </div>
            </div>
            {log.closedDate && (
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]"><Calendar className="inline w-3 h-3 mr-1" />Closed Date</span>
                <span className="font-bold text-emerald-600">{log.closedDate}</span>
              </div>
            )}
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1 mb-1">
                <FileText className="w-3.5 h-3.5" /> Description of Issue
              </span>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {log.description}
              </p>
            </div>
            {log.remarks && (
              <div>
                <span className="block text-emerald-500 font-bold uppercase text-[10px] flex items-center gap-1 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Resolution remarks
                </span>
                <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  {log.remarks}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg">
              Close Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
