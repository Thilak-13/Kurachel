import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const LICENSE_CATEGORIES = ['Class A', 'Class B', 'Class C', 'Class D', 'Class M'];
const DRIVER_STATUSES = ['Available', 'On Trip', 'Suspended', 'Off Duty'];
const LICENSE_NUMBER_PATTERN = /^[A-Z]{2}\d{2}\s?\d{11}$/;
const INDIAN_PHONE_PATTERN = /^\+91-?\d{10}$/;

export default function DriverForm({ isOpen, onClose, onSubmit, driver }) {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    phoneNumber: '',
    safetyScore: '',
    status: 'Available',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        licenseNumber: driver.licenseNumber || '',
        licenseCategory: driver.licenseCategory || 'Class A',
        licenseExpiryDate: driver.licenseExpiryDate || '',
        phoneNumber: driver.phoneNumber || '',
        safetyScore: driver.safetyScore !== undefined ? driver.safetyScore : '',
        status: driver.status || 'Available',
      });
    } else {
      setFormData({
        name: '',
        licenseNumber: '',
        licenseCategory: 'Class A',
        licenseExpiryDate: '',
        phoneNumber: '',
        safetyScore: '100',
        status: 'Available',
      });
    }
    setErrors({});
  }, [driver, isOpen]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Driver Name is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License Number is required';
    } else if (!LICENSE_NUMBER_PATTERN.test(formData.licenseNumber.trim())) {
      newErrors.licenseNumber = 'Format: DL14 20180098765';
    }

    if (!formData.licenseCategory) {
      newErrors.licenseCategory = 'License Category is required';
    }

    if (!formData.licenseExpiryDate) {
      newErrors.licenseExpiryDate = 'License Expiry Date is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!INDIAN_PHONE_PATTERN.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Format: +91-9876543210';
    }

    // Safety Score
    if (formData.safetyScore === '' || formData.safetyScore === undefined) {
      newErrors.safetyScore = 'Safety Score is required';
    } else {
      const score = Number(formData.safetyScore);
      if (isNaN(score)) {
        newErrors.safetyScore = 'Safety Score must be a valid number';
      } else if (score < 0 || score > 100) {
        newErrors.safetyScore = 'Safety Score must be between 0 and 100';
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
              {driver ? 'Edit Driver Info' : 'Add New Driver'}
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
                Driver Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-bold text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g. DL14 20180098765"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.licenseNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.licenseNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  License Category *
                </label>
                <select
                  name="licenseCategory"
                  value={formData.licenseCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {LICENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  License Expiry Date *
                </label>
                <input
                  type="date"
                  name="licenseExpiryDate"
                  value={formData.licenseExpiryDate}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.licenseExpiryDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.licenseExpiryDate && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.licenseExpiryDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +91-9876543210"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Safety Score (0-100) *
                </label>
                <input
                  type="number"
                  name="safetyScore"
                  value={formData.safetyScore}
                  onChange={handleChange}
                  placeholder="e.g. 95"
                  min="0"
                  max="100"
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.safetyScore ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.safetyScore && (
                  <p className="mt-1 text-xs font-bold text-red-500">{errors.safetyScore}</p>
                )}
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
                  {DRIVER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
                {driver ? 'Save Changes' : 'Create Driver'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
