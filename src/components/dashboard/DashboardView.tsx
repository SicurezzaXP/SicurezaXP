import React from 'react';
import { KPIStats } from './KPIStats';
import { CaseCharts } from './CaseCharts';
import { ExecutiveSummaryTable } from './ExecutiveSummaryTable';
import { CaseFilterState, CaseItem } from '../../types/case';
import { addDaysToDateString, isDateInPeruRange } from '../../utils/dateUtils';

interface DashboardViewProps {
  allCases: CaseItem[];
  filteredCases: CaseItem[];
  filters: CaseFilterState;
  onUpdateFilters: (newFilters: Partial<CaseFilterState>) => void;
  onViewCase: (c: CaseItem) => void;
  onGoToExplorer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  allCases,
  filteredCases,
  filters,
  onUpdateFilters,
  onViewCase,
  onGoToExplorer,
}) => {
  // Calculate Previous Period of the exact same number of days
  const startDay = new Date(filters.fechaInicio).getTime();
  const endDay = new Date(filters.fechaFin).getTime();
  const diffDays = Math.max(1, Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1);

  const prevEndStr = addDaysToDateString(filters.fechaInicio, -1);
  const prevStartStr = addDaysToDateString(prevEndStr, -(diffDays - 1));

  const previousPeriodCases = allCases.filter(
    (c) => !c.isArchived && isDateInPeruRange(c.fechaIngreso, prevStartStr, prevEndStr)
  );

  const handleSelectStatus = (status: string) => {
    const val = filters.estado === status ? '' : status;
    onUpdateFilters({ estado: val });
  };

  const handleSelectStore = (store: string) => {
    const val = filters.origenVenta === store || filters.tienda === store ? '' : store;
    onUpdateFilters({ origenVenta: val, tienda: val });
  };

  const handleSelectCategory = (category: string) => {
    const val = filters.motivo === category || filters.categoria === category ? '' : category;
    onUpdateFilters({ motivo: val, categoria: val });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards with Comparison */}
      <KPIStats
        currentCases={filteredCases}
        previousPeriodCases={previousPeriodCases}
        onSelectStatus={handleSelectStatus}
        onSelectStore={handleSelectStore}
      />

      {/* Main Charts */}
      <CaseCharts
        cases={filteredCases}
        onSelectStatus={handleSelectStatus}
        onSelectStore={handleSelectStore}
        onSelectCategory={handleSelectCategory}
        activeStatusFilter={filters.estado}
        activeStoreFilter={filters.origenVenta || filters.tienda}
        activeCategoryFilter={filters.motivo || filters.categoria}
      />

      {/* Executive Summary Table */}
      <ExecutiveSummaryTable
        cases={filteredCases}
        onViewCase={onViewCase}
        onGoToExplorer={onGoToExplorer}
      />
    </div>
  );
};
