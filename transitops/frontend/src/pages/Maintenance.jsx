import React, { useState, useEffect } from 'react';
import { getMaintenance, createMaintenance, closeMaintenance } from '../services/tripApi';
import { getVehicles } from '../services/vehicleApi';

import MaintenanceTable from '../components/MaintenanceTable';
import MaintenanceForm from '../components/MaintenanceForm';
import CloseMaintenanceModal from '../components/CloseMaintenanceModal';
import ViewMaintenanceModal from '../components/ViewMaintenanceModal';

import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Toast from '../components/Toast';

import { Plus, Wrench, AlertCircle, RefreshCw } from 'lucide-react';

export default function Maintenance({ user }) {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [closingLogId, setClosingLogId] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [mList, vList] = await Promise.all([
        getMaintenance(),
        getVehicles()
      ]);
      setLogs(mList);
      setVehicles(vList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch maintenance logs.');
      showToast('Error loading maintenance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (formData) => {
    try {
      await createMaintenance(formData);
      showToast('Maintenance logged successfully. Vehicle status set to In Shop.');
      setIsFormOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to create maintenance record.', 'error');
    }
  };

  const handleCloseTrigger = (id) => {
    setClosingLogId(id);
  };

  const handleCloseSubmit = async (remarks) => {
    const id = closingLogId;
    setClosingLogId(null);
    if (!id) return;
    try {
      await closeMaintenance(id, remarks);
      showToast('Maintenance closed successfully. Vehicle status restored.');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to close maintenance record.', 'error');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchedVehicle = vehicles.find(v => v.id === log.vehicleId);
    const regNo = matchedVehicle ? matchedVehicle.registrationNumber : '';
    const model = matchedVehicle ? matchedVehicle.model : '';

    const matchesSearch =
      log.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' }
  ];

  const activeViewingVehicle = viewingLog ? vehicles.find(v => v.id === viewingLog.vehicleId) : null;
  const isManager = user?.role === 'Admin' || user?.role === 'Maintenance Manager' || user?.role === 'Dispatcher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Maintenance Tracking & Logging</h2>
          <p className="text-sm text-slate-500 mt-0.5">Schedule repairs, record log costs, and track fleet safety maintenance</p>
        </div>
        {isManager && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Log Service</span>
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search vehicle, maintenance type, desc..."
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
            title="Reload Maintenance"
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
            <span className="text-sm font-bold text-slate-500">Loading service logs...</span>
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
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Wrench className="w-16 h-16 text-slate-300" />
            <div className="text-center">
              <p className="font-bold text-lg text-slate-600">No Service Logs Found</p>
              <p className="text-sm mt-0.5">Fleet is fully operational. Add a record to track repairs.</p>
            </div>
          </div>
        ) : (
          <MaintenanceTable 
            logs={filteredLogs}
            vehicles={vehicles}
            onCloseRecord={handleCloseTrigger}
            onViewRecord={(log) => setViewingLog(log)}
            userRole={user?.role}
          />
        )}
      </div>

      {/* Forms & Dialogs */}
      <MaintenanceForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateSubmit}
        vehicles={vehicles}
      />

      <CloseMaintenanceModal 
        isOpen={closingLogId !== null}
        onClose={() => setClosingLogId(null)}
        onSubmit={handleCloseSubmit}
      />

      <ViewMaintenanceModal 
        isOpen={viewingLog !== null}
        onClose={() => setViewingLog(null)}
        log={viewingLog}
        vehicle={activeViewingVehicle}
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
