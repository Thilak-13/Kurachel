import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicleApi';
import VehicleTable from '../components/VehicleTable';
import VehicleForm from '../components/VehicleForm';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { Plus, Truck, AlertCircle, RefreshCw } from 'lucide-react';

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals / Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch vehicles. Please try again.');
      showToast('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setIsFormOpen(false);
    try {
      if (editingVehicle) {
        // Update
        const updated = await updateVehicle(editingVehicle.id, formData);
        setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updated : v));
        showToast('Vehicle Updated successfully!');
      } else {
        // Create
        const created = await createVehicle(formData);
        setVehicles(prev => [...prev, created]);
        showToast('Vehicle Created successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast(editingVehicle ? 'Failed to update vehicle' : 'Failed to create vehicle', 'error');
    }
    setEditingVehicle(null);
  };

  const handleDeleteTrigger = (id) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteVehicle(deletingId);
      setVehicles(prev => prev.filter(v => v.id !== deletingId));
      showToast('Vehicle Deleted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete vehicle', 'error');
    } finally {
      setDeletingId(null);
      setIsConfirmOpen(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  // Instant filter logic
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const typeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: 'Van', label: 'Van' },
    { value: 'Box Truck', label: 'Box Truck' },
    { value: 'Flatbed', label: 'Flatbed' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Trailer', label: 'Trailer' }
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'On Trip', label: 'On Trip' },
    { value: 'In Shop', label: 'In Shop' },
    { value: 'Retired', label: 'Retired' }
  ];

  const canEdit = user?.role === 'Admin' || user?.role === 'Fleet Manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vehicle Roster</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track, update, and manage vehicle fleet registration and states</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search registration or model..."
        />

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <FilterDropdown 
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            label="Type"
          />
          <FilterDropdown 
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            label="Status"
          />
          <button 
            onClick={loadVehicles}
            title="Reload Vehicles"
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
            <span className="text-sm font-bold text-slate-500">Loading vehicles list...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-red-500 gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <p className="font-bold text-lg">{error}</p>
              <button 
                onClick={loadVehicles} 
                className="mt-2 text-sm font-bold text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Truck className="w-16 h-16 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-lg text-slate-600">No Vehicles Found</p>
              <p className="text-sm mt-0.5">Try searching another term, adjusting filters, or adding a new vehicle.</p>
            </div>
          </div>
        ) : (
          <VehicleTable 
            vehicles={filteredVehicles}
            onEdit={openEditModal}
            onDelete={handleDeleteTrigger}
            userRole={user?.role}
          />
        )}
      </div>

      {/* Forms & Dialogs */}
      <VehicleForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        vehicle={editingVehicle}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle from the roster? This will permanently remove its tracking records."
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
