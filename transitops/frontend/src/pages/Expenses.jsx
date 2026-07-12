import React, { useState, useEffect } from 'react';
import { getExpenses, createExpense, getTrips } from '../services/tripApi';
import SearchBar from '../components/SearchBar';
import Toast from '../components/Toast';
import { DollarSign, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Tolls', 'Fuel', 'Food', 'Lodging', 'Maintenance', 'Miscellaneous'];

export default function Expenses({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    tripId: '',
    category: 'Tolls',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
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
      const [eList, tList] = await Promise.all([
        getExpenses(),
        getTrips()
      ]);
      setExpenses(eList);
      setTrips(tList);
    } catch (err) {
      console.error(err);
      setError('Failed to load expense records.');
      showToast('Error loading expenses ledger', 'error');
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
    if (!formData.tripId) errors.tripId = 'Trip selection is required';
    if (!formData.category) errors.category = 'Expense Category is required';
    
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else {
      const amt = Number(formData.amount);
      if (isNaN(amt) || amt <= 0) errors.amount = 'Must be greater than 0';
    }

    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Expense date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createExpense(formData);
      showToast('Expense logged successfully.');
      setFormData({
        tripId: '',
        category: 'Tolls',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to record expense logs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getTripLabel = (tId) => {
    const t = trips.find(item => item.id === tId);
    return t ? `Trip #${t.id} (${t.source} ➔ ${t.destination})` : `Trip #${tId}`;
  };

  const filteredExpenses = expenses.filter(exp => {
    const desc = exp.description || '';
    const cat = exp.category || '';
    const tLabel = getTripLabel(exp.tripId);
    
    return desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trip Expense Ledger</h2>
          <p className="text-sm text-slate-500 mt-0.5">Record trip expenses, toll fees, maintenance charges, and lodging logs</p>
        </div>
        <button 
          onClick={loadData}
          title="Reload Expenses"
          className="p-2 text-slate-500 hover:bg-white hover:text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Record Trip Expense
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    Trip #{t.id} ({t.source} ➔ {t.destination})
                  </option>
                ))}
              </select>
              {formErrors.tripId && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.tripId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Expense Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Amount (₹ INR) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 250.00"
                step="0.01"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.amount ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {formErrors.amount && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.amount}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. NH-44 Toll Plaza charges"
                className={`w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  formErrors.description ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                }`}
              />
              {formErrors.description && <p className="mt-1 text-xs font-bold text-red-500">{formErrors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Log Date *
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </form>
        </div>

        {/* Expense History Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Expense History Log
            </h3>
            <div className="w-48 sm:w-60">
              <SearchBar 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search category or route..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-550">Loading expenses log...</span>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <DollarSign className="w-12 h-12 text-slate-300" />
                <div className="text-center">
                  <p className="font-bold text-slate-600">No Expenses Logged</p>
                  <p className="text-xs mt-0.5">Use the entry form to submit trip expense details.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Trip Assignment</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Expense Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 text-xs font-bold text-slate-900 truncate max-w-[200px]" title={getTripLabel(exp.tripId)}>
                          {getTripLabel(exp.tripId)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="inline-flex px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600">₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={exp.description}>
                          {exp.description}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{exp.date}</td>
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
