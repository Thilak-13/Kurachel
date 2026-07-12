import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TripForm({ isOpen, onClose, onSubmit, trip, availableVehicles = [], availableDrivers = [], vehicles = [], drivers = [] }) {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoWeight: '',
    plannedDistance: '',
    expectedStartDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (trip) {
      setFormData({
        source: trip.source || '',
        destination: trip.destination || '',
        vehicleId: trip.vehicleId || '',
        driverId: trip.driverId || '',
        cargoWeight: trip.cargoWeight !== undefined ? trip.cargoWeight : '',
        plannedDistance: trip.plannedDistance !== undefined ? trip.plannedDistance : '',
        expectedStartDate: trip.expectedStartDate || '',
        notes: trip.notes || '',
      });
    } else {
      setFormData({
        source: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        plannedDistance: '',
        expectedStartDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setErrors({});
  }, [trip, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.source.trim()) {
      newErrors.source = 'Source location is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination location is required';
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Assigning a vehicle is required';
    }

    if (!formData.driverId) {
      newErrors.driverId = 'Assigning a driver is required';
    }

    // Cargo Weight
    if (formData.cargoWeight === '' || formData.cargoWeight === undefined) {
      newErrors.cargoWeight = 'Cargo Weight is required';
    } else {
      const weight = Number(formData.cargoWeight);
      if (isNaN(weight)) {
        newErrors.cargoWeight = 'Must be a valid number';
      } else if (weight <= 0) {
        newErrors.cargoWeight = 'Cargo Weight must be greater than 0';
      }
    }

    // Planned Distance
    if (formData.plannedDistance === '' || formData.plannedDistance === undefined) {
      newErrors.plannedDistance = 'Planned Distance is required';
    } else {
      const dist = Number(formData.plannedDistance);
      if (isNaN(dist)) {
        newErrors.plannedDistance = 'Must be a valid number';
      } else if (dist <= 0) {
        newErrors.plannedDistance = 'Planned Distance must be greater than 0';
      }
    }

    if (!formData.expectedStartDate) {
      newErrors.expectedStartDate = 'Expected Start Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Compile vehicle selections (available + currently selected in trip)
  const finalVehicles = [...availableVehicles];
  if (trip && trip.vehicleId && !finalVehicles.some(v => v.id === trip.vehicleId)) {
    const matched = vehicles.find(v => v.id === trip.vehicleId);
    if (matched) {
      finalVehicles.push(matched);
    } else {
      finalVehicles.push({ id: trip.vehicleId, registrationNumber: trip.vehicleId, model: 'Assigned Vehicle', maxLoadCapacity: '' });
    }
  }

  // Compile driver selections (available + currently selected in trip)
  const finalDrivers = [...availableDrivers];
  if (trip && trip.driverId && !finalDrivers.some(d => d.id === trip.driverId)) {
    const matched = drivers.find(d => d.id === trip.driverId);
    if (matched) {
      finalDrivers.push(matched);
    } else {
      finalDrivers.push({ id: trip.driverId, name: 'Assigned Driver', licenseCategory: '', safetyScore: '' });
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-lg border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {trip ? 'Edit Trip Scheduling' : 'Create Transit Route'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Source Location *
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g. Chennai Hub"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.source ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.source && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.source}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Destination Location *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru Depot"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.destination ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.destination && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.destination}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Available Vehicle *
                </label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                    errors.vehicleId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Select Available Vehicle --</option>
                  {finalVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.model} - Max Load: {v.maxLoadCapacity} kg)
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.vehicleId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Available Driver *
                </label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                    errors.driverId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Select Available Driver --</option>
                  {finalDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseCategory} - Score: {d.safetyScore})
                    </option>
                  ))}
                </select>
                {errors.driverId && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.driverId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Cargo Weight (kg) *
                </label>
                <input
                  type="number"
                  name="cargoWeight"
                  value={formData.cargoWeight}
                  onChange={handleChange}
                  placeholder="e.g. 2500"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.cargoWeight ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.cargoWeight && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.cargoWeight}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Distance (km) *
                </label>
                <input
                  type="number"
                  name="plannedDistance"
                  value={formData.plannedDistance}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.plannedDistance ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.plannedDistance && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.plannedDistance}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Expected Start *
                </label>
                <input
                  type="date"
                  name="expectedStartDate"
                  value={formData.expectedStartDate}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.expectedStartDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.expectedStartDate && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.expectedStartDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional shipment cargo instructions..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
              >
                {trip ? 'Save Changes' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
