import React from 'react';
import { X, MapPin, Truck, User, Calendar, ShieldCheck, XOctagon } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ViewTripModal({ isOpen, onClose, trip, vehicle, driver }) {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-md border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Trip Summary</span>
              <span className="text-xs font-medium text-slate-400">#{trip.id}</span>
            </h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Status</span>
              <StatusBadge status={trip.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Source</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {trip.source}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Destination</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {trip.destination}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5"><Truck className="w-4 h-4" /> Vehicle</span>
                <span className="font-bold text-slate-800">
                  {vehicle ? `${vehicle.registrationNumber} (${vehicle.model})` : trip.vehicleId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5"><User className="w-4 h-4" /> Assigned Driver</span>
                <span className="font-bold text-slate-800">
                  {driver ? driver.name : trip.driverId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Start Date</span>
                <span className="font-bold text-slate-800">{trip.expectedStartDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">Cargo Weight</span>
                <span className="font-bold text-slate-800">{Number(trip.cargoWeight).toLocaleString('en-IN')} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">Route Distance</span>
                <span className="font-bold text-slate-800">{Number(trip.plannedDistance).toLocaleString('en-IN')} km</span>
              </div>
            </div>

            {trip.notes && (
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Trip Instructions</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  "{trip.notes}"
                </p>
              </div>
            )}

            {trip.status === 'Completed' && trip.remarks && (
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] text-emerald-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Delivery Remarks
                </span>
                <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 italic">
                  "{trip.remarks}"
                </p>
              </div>
            )}

            {trip.status === 'Cancelled' && trip.cancelReason && (
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] text-rose-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <XOctagon className="w-3.5 h-3.5" /> Cancellation Reason
                </span>
                <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-100 italic">
                  "{trip.cancelReason}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Close Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
