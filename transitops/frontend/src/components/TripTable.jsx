import React from 'react';
import StatusBadge from './StatusBadge';
import { Play, Check, X, Eye, Pencil, Trash2 } from 'lucide-react';

export default function TripTable({ trips, vehicles, drivers, onDispatch, onEdit, onDelete, onComplete, onCancel, onView }) {
  
  const getVehicleLabel = (vId) => {
    const v = vehicles.find(item => item.id === vId);
    return v ? `${v.registrationNumber} (${v.model})` : vId || 'Unassigned';
  };

  const getDriverLabel = (dId) => {
    const d = drivers.find(item => item.id === dId);
    return d ? d.name : dId || 'Unassigned';
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-[950px]">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 shadow-sm">
          <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-6">Trip ID</th>
            <th className="py-3.5 px-6">Source</th>
            <th className="py-3.5 px-6">Destination</th>
            <th className="py-3.5 px-6">Vehicle</th>
            <th className="py-3.5 px-6">Driver</th>
            <th className="py-3.5 px-6">Cargo Weight</th>
            <th className="py-3.5 px-6">Distance</th>
            <th className="py-3.5 px-6">Status</th>
            <th className="py-3.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
          {trips.map((trip) => (
            <tr key={trip.id} className="hover:bg-slate-50/75 transition-colors">
              <td className="py-4 px-6 font-semibold text-slate-500">{trip.id}</td>
              <td className="py-4 px-6 font-bold text-slate-900">{trip.source}</td>
              <td className="py-4 px-6 font-bold text-slate-900">{trip.destination}</td>
              <td className="py-4 px-6 text-xs">{getVehicleLabel(trip.vehicleId)}</td>
              <td className="py-4 px-6 text-xs">{getDriverLabel(trip.driverId)}</td>
              <td className="py-4 px-6">{Number(trip.cargoWeight).toLocaleString('en-IN')} kg</td>
              <td className="py-4 px-6">{Number(trip.plannedDistance).toLocaleString('en-IN')} km</td>
              <td className="py-4 px-6">
                <StatusBadge status={trip.status} />
              </td>
              <td className="py-4 px-6 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  {/* Status: Draft */}
                  {trip.status === 'Draft' && (
                    <>
                      <button
                        onClick={() => onDispatch(trip.id)}
                        title="Dispatch Trip"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                      <button
                        onClick={() => onEdit(trip)}
                        title="Edit Trip"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(trip.id)}
                        title="Delete Trip"
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Status: Dispatched */}
                  {trip.status === 'Dispatched' && (
                    <>
                      <button
                        onClick={() => onComplete(trip.id)}
                        title="Complete Trip"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => onCancel(trip.id)}
                        title="Cancel Trip"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={() => onView(trip)}
                        title="View Trip Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Status: Completed or Cancelled */}
                  {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                    <button
                      onClick={() => onView(trip)}
                      title="View Details"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
