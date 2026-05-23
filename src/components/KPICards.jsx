import React from 'react';
import { ClipboardList, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

/**
 * Renders a card displaying a specific metric.
 */
function KPICard({ title, value, icon: Icon, className, prefix = '' }) {
  return (
    <div className={`kpi-card ${className}`}>
      <div className="kpi-info">
        <h3>{title}</h3>
        <div className="kpi-value">
          {prefix}{value}
        </div>
      </div>
      <div className="kpi-icon-wrapper">
        <Icon className="icon" size={24} />
      </div>
    </div>
  );
}

/**
 * Dashboard KPI Cards block.
 * Uses useMemo for computations inside App.jsx, receives aggregated values.
 */
export default function KPICards({ kpis }) {
  const { totalRegistered, approved, rejected, collection } = kpis;

  // Format currency with Indian formatting (en-IN)
  const formatCurrency = (val) => {
    return Math.round(val).toLocaleString('en-IN');
  };

  const formatNumber = (val) => {
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="kpi-grid">
      <KPICard
        title="Total Registered"
        value={formatNumber(totalRegistered)}
        icon={ClipboardList}
        className="kpi-registered"
      />
      <KPICard
        title="Approved Properties"
        value={formatNumber(approved)}
        icon={CheckCircle}
        className="kpi-approved"
      />
      <KPICard
        title="Rejected Properties"
        value={formatNumber(rejected)}
        icon={XCircle}
        className="kpi-rejected"
      />
      <KPICard
        title="Total Collection"
        value={formatCurrency(collection)}
        prefix="₹ "
        icon={IndianRupee}
        className="kpi-collection"
      />
    </div>
  );
}
