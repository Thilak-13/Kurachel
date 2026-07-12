import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../services/driverApi';
import DriverTable from '../components/DriverTable';
import DriverForm from '../components/DriverForm';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Plus, Users, AlertCircle, RefreshCw } from 'lucide-react';

export default function Drivers({ user }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals / Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch drivers. Please try again.');
      showToast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsFormOpen(false);
    try {
      if (editingDriver) {
        // Update
        const updated = await updateDriver(editingDriver.id, formData);
        setDrivers(prev => prev.map(d => d.id === editingDriver.id ? updated : d));
        showToast('Driver Updated successfully!');
      } else {
        // Create
        const created = await createDriver(formData);
        setDrivers(prev => [...prev, created]);
        showToast('Driver Created successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast(editingDriver ? 'Failed to update driver' : 'Failed to create driver', 'error');
    }
    setEditingDriver(null);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteDriver(deletingId);
      setDrivers(prev => prev.filter(d => d.id !== deletingId));
      showToast('Driver Deleted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete driver', 'error');
    } finally {
      setDeletingId(null);
      setIsConfirmOpen(false);
    }
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setIsFormOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  // Instant filter logic
  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || d.licenseCategory === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Class A', label: 'Class A' },
    { value: 'Class B', label: 'Class B' },
    { value: 'Class C', label: 'Class C' },
    { value: 'Class D', label: 'Class D' },
    { value: 'Class M', label: 'Class M' }
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'On Trip', label: 'On Trip' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const canEdit = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Driver Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track, update, and manage driver logs, licensing, and safety statuses</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search name or license number..."
        />

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <FilterDropdown 
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            label="Category"
          />
          <FilterDropdown 
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            label="Status"
          />
          <button 
            onClick={loadDrivers}
            title="Reload Drivers"
            className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl border border-slate-200 transition-colors ml-auto md:ml-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-500">Loading drivers list...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-red-500 gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <p className="font-bold text-lg">{error}</p>
              <button 
                onClick={loadDrivers} 
                className="mt-2 text-sm font-bold text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Users className="w-16 h-16 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-lg text-slate-600">No Drivers Found</p>
              <p className="text-sm mt-0.5">Try searching another term, adjusting filters, or adding a new driver.</p>
            </div>
          </div>
        ) : (
          <DriverTable 
            drivers={filteredDrivers}
            onEdit={openEditModal}
            onDelete={handleDeleteTrigger}
            userRole={user?.role}
          />
        )}
      </div>

      {/* Forms & Dialogs */}
      <DriverForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        driver={editingDriver}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver"
        message="Are you sure you want to delete this driver from the directory? This will permanently erase their licensing history and active statuses."
        confirmText="Delete"
        cancelText="Cancel"
      />

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
