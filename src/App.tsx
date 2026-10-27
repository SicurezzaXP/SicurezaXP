import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DateFilterBar } from './components/filters/DateFilterBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { CaseRegistrationForm } from './components/cases/CaseRegistrationForm';
import { CaseExplorerView } from './components/cases/CaseExplorerView';
import { ReportsView } from './components/reports/ReportsView';
import { HistoricalMigrationView } from './components/migration/HistoricalMigrationView';
import { FieldConfiguratorView } from './components/admin/FieldConfiguratorView';
import { FieldConfiguratorModal } from './components/admin/FieldConfiguratorModal';
import { FirebaseConfigModal } from './components/admin/FirebaseConfigModal';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { CaseEditModal } from './components/cases/CaseEditModal';
import { CaseFilterState, CaseItem } from './types/case';
import { subscribeToCases } from './services/db';
import { calculateDatePresetRange, isDateInPeruRange } from './utils/dateUtils';
import { getCaseFollowUpInfo } from './utils/followUpUtils';
import {
  LayoutDashboard,
  PlusCircle,
  TableProperties,
  Sliders,
  FileSpreadsheet,
  Database,
  Bell,
} from 'lucide-react';

function MainApp() {
  const { user } = useAuth();

  // Tab navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // All cases from Firestore/Local
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  // Modals
  const [isFieldConfigOpen, setIsFieldConfigOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<CaseItem | null>(null);
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<CaseItem | null>(null);

  // Global Date and Attribute Filters
  const initialRange = useMemo(() => calculateDatePresetRange('ultimos_30_dias'), []);
  const [filters, setFilters] = useState<CaseFilterState>({
    fechaInicio: initialRange.inicio,
    fechaFin: initialRange.fin,
    preset: 'ultimos_30_dias',
    origenVenta: '',
    tipoCaso: '',
    motivo: '',
    estado: '',
    canal: '',
    cierre: '',
    searchTerm: '',
    tienda: '',
    categoria: '',
  });

  // Subscribe to database in real-time
  useEffect(() => {
    setIsLoadingCases(true);
    const unsubscribe = subscribeToCases((cases) => {
      setAllCases(cases);
      setIsLoadingCases(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter cases according to active filters
  const filteredCases = useMemo(() => {
    return allCases.filter((c) => {
      if (c.isArchived) return false;
      // Date filter by case entry date in America/Lima
      if (!isDateInPeruRange(c.fechaIngreso, filters.fechaInicio, filters.fechaFin)) {
        return false;
      }
      const storeFilter = filters.origenVenta || filters.tienda;
      if (storeFilter && c.origenVenta !== storeFilter && c.tienda !== storeFilter) {
        return false;
      }
      const motiveFilter = filters.motivo || filters.categoria;
      if (motiveFilter && c.motivo !== motiveFilter && c.categoria !== motiveFilter) {
        return false;
      }
      if (filters.tipoCaso && c.tipoCaso !== filters.tipoCaso) {
        return false;
      }
      if (filters.canal && c.canal !== filters.canal) {
        return false;
      }
      if (filters.estado && c.estado !== filters.estado) {
        return false;
      }
      if (filters.cierre && c.cierre !== filters.cierre) {
        return false;
      }
      return true;
    });
  }, [allCases, filters]);

  const handleApplyFilters = (newFilters: CaseFilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    const defaultRange = calculateDatePresetRange('ultimos_30_dias');
    setFilters({
      fechaInicio: defaultRange.inicio,
      fechaFin: defaultRange.fin,
      preset: 'ultimos_30_dias',
      origenVenta: '',
      tipoCaso: '',
      motivo: '',
      estado: '',
      canal: '',
      cierre: '',
      searchTerm: '',
      tienda: '',
      categoria: '',
    });
  };

  const handleUpdateFiltersPartial = (partial: Partial<CaseFilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  // Follow-ups counter
  const followUpsCount = useMemo(() => {
    return allCases.filter((c) => !c.isArchived && getCaseFollowUpInfo(c).isNeeded).length;
  }, [allCases]);

  const TOP_TABS: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Métricas (BI)', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'new_case', label: 'Registrar Caso', icon: <PlusCircle className="w-3.5 h-3.5" /> },
    { id: 'explorer', label: 'Base de Casos', icon: <TableProperties className="w-3.5 h-3.5" /> },
    {
      id: 'followups',
      label: `Seguimientos & Alertas ${followUpsCount > 0 ? `(${followUpsCount})` : ''}`,
      icon: <Bell className="w-3.5 h-3.5" />,
    },
    { id: 'reports', label: 'Reportes & Excel', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: 'migration', label: 'Migración Histórica', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onOpenFieldConfigurator={() => setIsFieldConfigOpen(true)}
        cases={allCases}
        onOpenFollowUpsView={() => setCurrentTab('followups')}
        onViewCaseDetail={(c) => setSelectedCaseForDetail(c)}
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Navy Left Sidebar (from image_a57a0a97.png) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          totalCasesCount={allCases.filter((c) => !c.isArchived).length}
          followUpsCount={followUpsCount}
          onOpenFieldConfigurator={() => setIsFieldConfigOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto">
          {/* Top Category Tabs (Format exactly like the top bar in screenshot!) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-2">
            {TOP_TABS.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                    isActive
                      ? 'bg-[#161c36] text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date & Filter Bar (Visible on Dashboard) */}
          {currentTab === 'dashboard' && (
            <DateFilterBar
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              totalFilteredCount={filteredCases.length}
              totalAllCount={allCases.filter((c) => !c.isArchived).length}
            />
          )}

          {/* Module Views */}
          {currentTab === 'dashboard' && (
            <DashboardView
              allCases={allCases}
              filteredCases={filteredCases}
              filters={filters}
              onUpdateFilters={handleUpdateFiltersPartial}
              onViewCase={(c) => setSelectedCaseForDetail(c)}
              onGoToExplorer={() => setCurrentTab('explorer')}
            />
          )}

          {currentTab === 'new_case' && (
            <CaseRegistrationForm
              onCaseCreated={(caseId) => {
                // optionally stay or let user continue
              }}
              onOpenFieldConfigurator={() => setIsFieldConfigOpen(true)}
              onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
            />
          )}

          {currentTab === 'explorer' && (
            <CaseExplorerView
              cases={allCases}
              onExportFiltered={() => setCurrentTab('reports')}
            />
          )}

          {currentTab === 'followups' && (
            <FollowUpsView
              cases={allCases}
              onViewCaseDetail={(c) => setSelectedCaseForDetail(c)}
            />
          )}


          {currentTab === 'reports' && (
            <ReportsView
              allCases={allCases}
              defaultFilters={filters}
            />
          )}

          {currentTab === 'migration' && (
            <HistoricalMigrationView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {isFieldConfigOpen && (
        <FieldConfiguratorModal
          isOpen={isFieldConfigOpen}
          onClose={() => setIsFieldConfigOpen(false)}
        />
      )}

      {isFirebaseModalOpen && (
        <FirebaseConfigModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
        />
      )}

      {selectedCaseForDetail && (
        <CaseDetailModal
          caseItem={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
          onEdit={(c) => {
            setSelectedCaseForDetail(null);
            setSelectedCaseForEdit(c);
          }}
          onArchive={(c) => {
            setSelectedCaseForDetail(null);
          }}
        />
      )}

      {selectedCaseForEdit && (
        <CaseEditModal
          caseItem={selectedCaseForEdit}
          onClose={() => setSelectedCaseForEdit(null)}
          onUpdated={() => {
            // Updated in reactive listener
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
