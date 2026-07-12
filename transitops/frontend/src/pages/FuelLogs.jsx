import React, { useState, useEffect } from 'react';
import { getFuelLogs, createFuelLog, getTrips } from '../services/tripApi';
import { getVehicles } from '../services/vehicleApi';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import { Fuel, Plus, AlertCircle, RefreshCw } from 'lucide-react';

export default function FuelLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    vehicleId: '',
    tripId: '',
    quantity: '',
    cost: '',
    station: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fList, vList, tList] = await Promise.all([
        getFuelLogs(),
        getVehicles(),
        getTrips()
      ]);
      setLogs(fList);
      setVehicles(vList);
      setTrips(tList);
    } catch (err) {
      console.error(err);
      setError('Failed to load fuel records.');
      showToast('Error loading fuel logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.vehicleId) errors.vehicleId = 'Vehicle selection is required';
    if (!formData.tripId) errors.tripId = 'Trip assignment is required';
    
    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else {
      const qty = Number(formData.quantity);
      if (isNaN(qty) || qty <= 0) errors.quantity = 'Must be greater than 0';
    }

    if (!formData.cost) {
      errors.cost = 'Cost is required';
    } else {
      const cst = Number(formData.cost);
      if (isNaN(cst) || cst <= 0) errors.cost = 'Must be greater than 0';
    }

    if (!formData.station.trim()) errors.station = 'Fuel Station name is required';
    if (!formData.date) errors.date = 'Refuel date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createFuelLog(formData);
      showToast('Fuel transaction logged successfully.');
      setFormData({
        vehicleId: '',
        tripId: '',
        quantity: '',
        cost: '',
        station: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to log fuel cost details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Label helpers
  const getVehicleLabel = (vId) => {
    const v = vehicles.find(item => item.id === vId);
    return v ? `${v.registrationNumber} (${v.model})` : vId;
  };

  const getTripLabel = (tId) => {
    const t = trips.find(item => item.id === tId);
    return t ? `Trip #${t.id} (${t.source} ➔ ${t.destination})` : `Trip #${tId}`;
  };

  const filteredLogs = logs.filter(log => {
    const matchedVehicle = vehicles.find(v => v.id === log.vehicleId);
    const regNo = matchedVehicle ? matchedVehicle.registrationNumber : '';
    const station = log.station || '';
    
    return regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           station.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.notes?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Fuel Transaction Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Record and monitor fuel purchases, volume logs, and station receipts</p>
        </div>
        <button 
          onClick={loadData}
          title="Reload Logs"
          className="p-2 text-slate-500 hover:bg-white hover:text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Log Fuel Purchase
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Vehicle *
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                  formErrors.vehicleId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} ({v.model})
                  </option>
                ))}
              </select>
              {formErrors.vehicleId && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.vehicleId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Active Trip *
              </label>
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
                  formErrors.tripId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              >
                <option value="">-- Choose Assigned Trip --</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>
                    Trip #{t.id} ({t.source} ➔ {t.destination} - {t.status})
                  </option>
                ))}
              </select>
              {formErrors.tripId && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.tripId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quantity (gal) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  step="0.01"
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.quantity ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.quantity && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.quantity}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Total Cost ($) *
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="e.g. 52.50"
                  step="0.01"
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.cost ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {formErrors.cost && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.cost}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Fuel Station *
              </label>
              <input
                type="text"
                name="station"
                value={formData.station}
                onChange={handleChange}
                placeholder="e.g. Texaco Austin"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.station ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {formErrors.station && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.station}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Refuel Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.date ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {formErrors.date && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Transaction Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Remarks, receipt number..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              <span>Log Receipt</span>
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Fuel Log Ledger
            </h3>
            <div className="w-48 sm:w-60">
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search plate or station..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-550">Loading ledger logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Fuel className="w-12 h-12 text-slate-300" />
                <div className="text-center">
                  <p className="font-bold text-slate-600">No Logs Recorded</p>
                  <p className="text-xs mt-0.5">Use the entry form to submit fuel transaction details.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Vehicle</th>
                      <th className="py-3 px-4">Trip</th>
                      <th className="py-3 px-4">Quantity (gal)</th>
                      <th className="py-3 px-4">Cost ($)</th>
                      <th className="py-3 px-4">Fuel Station</th>
                      <th className="py-3 px-4">Refuel Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-bold">{getVehicleLabel(log.vehicleId)}</td>
                        <td className="py-3 px-4 text-xs text-slate-500 truncate max-w-[150px]" title={getTripLabel(log.tripId)}>
                          {getTripLabel(log.tripId)}
                        </td>
                        <td className="py-3 px-4">{log.quantity} gal</td>
                        <td className="py-3 px-4 font-bold text-slate-900">${Number(log.cost).toFixed(2)}</td>
                        <td className="py-3 px-4">{log.station}</td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
