import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CompleteTripModal({ isOpen, onClose, onSubmit, trip, vehicle }) {
  const [formData, setFormData] = useState({
    finalOdometer: '',
    fuelUsed: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        finalOdometer: vehicle ? String(vehicle.odometer) : '',
        fuelUsed: '',
        remarks: '',
      });
      setErrors({});
    }
  }, [isOpen, vehicle]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.finalOdometer) {
      newErrors.finalOdometer = 'Final Odometer is required';
    } else {
      const odo = Number(formData.finalOdometer);
      if (isNaN(odo)) {
        newErrors.finalOdometer = 'Must be a valid number';
      } else if (vehicle && odo < vehicle.odometer) {
        newErrors.finalOdometer = `Final odometer must be at least the current odometer (${vehicle.odometer} km)`;
      }
    }

    if (!formData.fuelUsed) {
      newErrors.fuelUsed = 'Fuel Used is required';
    } else {
      const fuel = Number(formData.fuelUsed);
      if (isNaN(fuel)) {
        newErrors.fuelUsed = 'Must be a valid number';
      } else if (fuel < 0) {
        newErrors.fuelUsed = 'Fuel used cannot be negative';
      }
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all w-full max-w-md border border-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-slate-900">Complete Trip</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Final Odometer (km) *
              </label>
              <input
                type="number"
                value={formData.finalOdometer}
                onChange={(e) => setFormData({ ...formData, finalOdometer: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.finalOdometer ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
                placeholder={vehicle ? `Current: ${vehicle.odometer}` : 'e.g. 46200'}
              />
              {errors.finalOdometer && <p className="mt-1 text-xs font-bold text-red-500">{errors.finalOdometer}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fuel Used (litres) *
              </label>
              <input
                type="number"
                value={formData.fuelUsed}
                onChange={(e) => setFormData({ ...formData, fuelUsed: e.target.value })}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.fuelUsed ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
                placeholder="e.g. 15.5"
              />
              {errors.fuelUsed && <p className="mt-1 text-xs font-bold text-red-500">{errors.fuelUsed}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows={3}
                placeholder="Remarks about the trip delivery status..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
              >
                Submit Completion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
