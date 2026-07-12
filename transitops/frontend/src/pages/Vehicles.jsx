import React, { useState, useEffect } from 'react';
import { getVehicles } from '../services/vehicleApi';
import { Truck, Plus, Search } from 'lucide-react';

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Error loading vehicles:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Active</span>;
      case 'IN_MAINTENANCE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">In Maintenance</span>;
      case 'OUT_OF_SERVICE':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Out of Service</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Vehicle Roster</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage and monitor vehicle availability, odometer, and fuel levels</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Fleet Manager') && (
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
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
            placeholder="Search license plate, make, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'ACTIVE', 'IN_MAINTENANCE', 'OUT_OF_SERVICE'].map((status) => (
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
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Loading vehicles...</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">No vehicles found matching the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Vehicle Info</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Odometer</th>
                  <th className="py-4 px-6">Fuel Level</th>
                  <th className="py-4 px-6">Status</th>
                  {(user?.role === 'Admin' || user?.role === 'Fleet Manager') && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-500">{vehicle.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-bold text-slate-900">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-slate-500">{vehicle.licensePlate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{vehicle.type}</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{vehicle.odometer.toLocaleString()} mi</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              vehicle.fuelLevel > 50 
                                ? 'bg-emerald-500' 
                                : vehicle.fuelLevel > 20 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${vehicle.fuelLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{vehicle.fuelLevel}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(vehicle.status)}</td>
                    {(user?.role === 'Admin' || user?.role === 'Fleet Manager') && (
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors mr-3">Edit</button>
                        <button className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors">Delete</button>
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
