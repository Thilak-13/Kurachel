import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const VEHICLE_TYPES = ['Van', 'Box Truck', 'Flatbed', 'Sedan', 'Trailer'];
const VEHICLE_STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];

export default function VehicleForm({ isOpen, onClose, onSubmit, vehicle }) {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    type: 'Van',
    maxLoadCapacity: '',
    odometer: '',
    acquisitionCost: '',
    status: 'Available',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        registrationNumber: vehicle.registrationNumber || '',
        model: vehicle.model || '',
        type: vehicle.type || 'Van',
        maxLoadCapacity: vehicle.maxLoadCapacity !== undefined ? vehicle.maxLoadCapacity : '',
        odometer: vehicle.odometer !== undefined ? vehicle.odometer : '',
        acquisitionCost: vehicle.acquisitionCost !== undefined ? vehicle.acquisitionCost : '',
        status: vehicle.status || 'Available',
      });
    } else {
      setFormData({
        registrationNumber: '',
        model: '',
        type: 'Van',
        maxLoadCapacity: '',
        odometer: '',
        acquisitionCost: '',
        status: 'Available',
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

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

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration Number is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.type) {
      newErrors.type = 'Vehicle Type is required';
    }

    // Max Load Capacity
    if (formData.maxLoadCapacity === '' || formData.maxLoadCapacity === undefined) {
      newErrors.maxLoadCapacity = 'Max Load is required';
    } else {
      const val = Number(formData.maxLoadCapacity);
      if (isNaN(val)) {
        newErrors.maxLoadCapacity = 'Must be a valid number';
      } else if (val <= 0) {
        newErrors.maxLoadCapacity = 'Max Load must be > 0';
      }
    }

    // Odometer
    if (formData.odometer === '' || formData.odometer === undefined) {
      newErrors.odometer = 'Odometer is required';
    } else {
      const val = Number(formData.odometer);
      if (isNaN(val)) {
        newErrors.odometer = 'Must be a valid number';
      } else if (val < 0) {
        newErrors.odometer = 'Odometer cannot be negative';
      }
    }

    // Acquisition Cost
    if (formData.acquisitionCost === '' || formData.acquisitionCost === undefined) {
      newErrors.acquisitionCost = 'Cost is required';
    } else {
      const val = Number(formData.acquisitionCost);
      if (isNaN(val)) {
        newErrors.acquisitionCost = 'Must be a valid number';
      } else if (val < 0) {
        newErrors.acquisitionCost = 'Cost cannot be negative';
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-lg border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">
              {vehicle ? 'Edit Vehicle Info' : 'Add New Fleet Vehicle'}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. TN 01 AB 1234"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.registrationNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.registrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Model Name *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Tata Ultra 1412"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.model ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {errors.model && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.model}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Vehicle Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {VEHICLE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {VEHICLE_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Max Load (kg) *
                </label>
                <input
                  type="number"
                  name="maxLoadCapacity"
                  value={formData.maxLoadCapacity}
                  onChange={handleChange}
                  placeholder="e.g. 3500"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.maxLoadCapacity ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.maxLoadCapacity && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.maxLoadCapacity}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Odometer (km) *
                </label>
                <input
                  type="number"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.odometer ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.odometer && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.odometer}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Cost (₹ INR) *
                </label>
                <input
                  type="number"
                  name="acquisitionCost"
                  value={formData.acquisitionCost}
                  onChange={handleChange}
                  placeholder="e.g. 1850000"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.acquisitionCost ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.acquisitionCost && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.acquisitionCost}</p>
                )}
              </div>
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
                {vehicle ? 'Save Changes' : 'Create Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
