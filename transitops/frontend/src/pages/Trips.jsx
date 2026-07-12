import React, { useState, useEffect } from 'react';
import { 
  getTrips, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  dispatchTrip, 
  completeTrip, 
  cancelTrip, 
  getAvailableVehicles, 
  getAvailableDrivers 
} from '../services/tripApi';
import { getVehicles } from '../services/vehicleApi';
import { getDrivers } from '../services/driverApi';

import TripTable from '../components/TripTable';
import TripForm from '../components/TripForm';
import CompleteTripModal from '../components/CompleteTripModal';
import CancelTripModal from '../components/CancelTripModal';
import ViewTripModal from '../components/ViewTripModal';

import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

import { Plus, Route, AlertCircle, RefreshCw } from 'lucide-react';

export default function Trips({ user }) {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Selection states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  
  const [completingTripId, setCompletingTripId] = useState(null);
  const [cancellingTripId, setCancellingTripId] = useState(null);
  const [dispatchingTripId, setDispatchingTripId] = useState(null);
  const [deletingTripId, setDeletingTripId] = useState(null);

  // Confirm dialogue triggers
  const [isDispatchConfirmOpen, setIsDispatchConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tList, vList, dList, avList, adList] = await Promise.all([
        getTrips(),
        getVehicles(),
        getDrivers(),
        getAvailableVehicles(),
        getAvailableDrivers()
      ]);
      setTrips(tList);
      setVehicles(vList);
      setDrivers(dList);
      setAvailableVehicles(avList);
      setAvailableDrivers(adList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch transit records. Please try again.');
      showToast('Error loading dispatch board data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, formData);
        showToast('Trip modified successfully.');
      } else {
        await createTrip(formData);
        showToast('Trip scheduled successfully.');
      }
      setIsFormOpen(false);
      setEditingTrip(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast(editingTrip ? 'Failed to modify trip' : 'Failed to create trip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dispatch lifecycle
  const handleDispatchTrigger = (id) => {
    setDispatchingTripId(id);
    setIsDispatchConfirmOpen(true);
  };

  const handleDispatchConfirm = async () => {
    setIsDispatchConfirmOpen(false);
    if (!dispatchingTripId) return;
    setLoading(true);
    try {
      await dispatchTrip(dispatchingTripId);
      showToast('Trip successfully dispatched!');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Dispatch failed. Please check driver/vehicle status.', 'error');
    } finally {
      setDispatchingTripId(null);
      setLoading(false);
    }
  };

  // Completion lifecycle
  const handleCompleteTrigger = (id) => {
    setCompletingTripId(id);
  };

  const handleCompleteSubmit = async (completionData) => {
    const id = completingTripId;
    setCompletingTripId(null);
    if (!id) return;
    setLoading(true);
    try {
      await completeTrip(id, completionData);
      showToast('Trip completed successfully!');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to record trip completion details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancellation lifecycle
  const handleCancelTrigger = (id) => {
    setCancellingTripId(id);
  };

  const handleCancelSubmit = async (reason) => {
    const id = cancellingTripId;
    setCancellingTripId(null);
    if (!id) return;
    setLoading(true);
    try {
      await cancelTrip(id, reason);
      showToast('Trip cancelled successfully.');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Cancellation request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Deletion lifecycle
  const handleDeleteTrigger = (id) => {
    setDeletingTripId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteConfirmOpen(false);
    const id = deletingTripId;
    setDeletingTripId(null);
    if (!id) return;
    setLoading(true);
    try {
      await deleteTrip(id);
      showToast('Trip deleted successfully.');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Deletion failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTrip(null);
    setIsFormOpen(true);
  };

  const openEditModal = (trip) => {
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  const openViewModal = (trip) => {
    setViewingTrip(trip);
  };

  // Filtering list matches
  const filteredTrips = trips.filter((t) => {
    const matchedVehicle = vehicles.find((v) => v.id === t.vehicleId);
    const matchedDriver = drivers.find((d) => d.id === t.driverId);

    const vehiclePlate = matchedVehicle ? matchedVehicle.registrationNumber : '';
    const driverName = matchedDriver ? matchedDriver.name : '';

    const matchesSearch = 
      t.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Dispatched', label: 'Dispatched' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const activeCompletingTrip = trips.find(t => t.id === completingTripId);
  const activeCompletingVehicle = activeCompletingTrip ? vehicles.find(v => v.id === activeCompletingTrip.vehicleId) : null;

  const activeViewingTrip = viewingTrip;
  const activeViewingVehicle = activeViewingTrip ? vehicles.find(v => v.id === activeViewingTrip.vehicleId) : null;
  const activeViewingDriver = activeViewingTrip ? drivers.find(d => d.id === activeViewingTrip.driverId) : null;

  const isDispatcher = user?.role === 'Admin' || user?.role === 'Dispatcher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Trip Dispatch Control Board</h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule routes, dispatch vehicles, and track ongoing trip completions</p>
        </div>
        {isDispatcher && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Trip</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search source, destination, vehicle, driver..."
        />

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <FilterDropdown 
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            label="Status"
          />
          <button 
            onClick={loadData}
            title="Reload Trips"
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
            <span className="text-sm font-bold text-slate-500">Loading dispatch records...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-red-500 gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <p className="font-bold text-lg">{error}</p>
              <button 
                onClick={loadData} 
                className="mt-2 text-sm font-bold text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Route className="w-16 h-16 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-lg text-slate-600">No Trips Scheduled</p>
              <p className="text-sm mt-0.5">Try adjusting search query filters or schedule a new trip record.</p>
            </div>
          </div>
        ) : (
          <TripTable 
            trips={filteredTrips}
            vehicles={vehicles}
            drivers={drivers}
            onDispatch={handleDispatchTrigger}
            onEdit={openEditModal}
            onDelete={handleDeleteTrigger}
            onComplete={handleCompleteTrigger}
            onCancel={handleCancelTrigger}
            onView={openViewModal}
          />
        )}
      </div>

      {/* Modals & Popups */}
      <TripForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        trip={editingTrip}
        availableVehicles={availableVehicles}
        availableDrivers={availableDrivers}
        vehicles={vehicles}
        drivers={drivers}
      />

      <CompleteTripModal 
        isOpen={completingTripId !== null}
        onClose={() => setCompletingTripId(null)}
        onSubmit={handleCompleteSubmit}
        trip={activeCompletingTrip}
        vehicle={activeCompletingVehicle}
      />

      <CancelTripModal 
        isOpen={cancellingTripId !== null}
        onClose={() => setCancellingTripId(null)}
        onConfirm={handleCancelSubmit}
      />

      <ViewTripModal 
        isOpen={viewingTrip !== null}
        onClose={() => setViewingTrip(null)}
        trip={activeViewingTrip}
        vehicle={activeViewingVehicle}
        driver={activeViewingDriver}
      />

      {/* Confirm dialogues */}
      <ConfirmDialog 
        isOpen={isDispatchConfirmOpen}
        onClose={() => setIsDispatchConfirmOpen(false)}
        onConfirm={handleDispatchConfirm}
        title="Confirm Dispatch"
        message="Are you sure you want to dispatch this trip? This will mark the trip status as 'Dispatched' and allocate the assigned vehicle and driver resources."
        confirmText="Dispatch"
        cancelText="Cancel"
      />

      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip"
        message="Are you sure you want to delete this trip schedule? This will permanently remove the record from the database."
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
