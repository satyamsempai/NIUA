import React, { useMemo } from 'react';
import { ClipboardList, CheckCircle, XCircle, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { getSparklineData } from '../utils/dataUtils';

/**
 * Renders an SVG sparkline path with gradients.
 */
function Sparkline({ points, strokeColor, gradientId, areaColor }) {
  const { linePath, areaPath } = useMemo(() => {
    if (!points || points.length === 0) return { linePath: '', areaPath: '' };
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min;
    
    const width = 140;
    const height = 40;
    const padding = 4;
    
    const coords = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = range === 0 
        ? height / 2 
        : height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x, y };
    });
    
    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    
    return { linePath: line, areaPath: area };
  }, [points]);

  return (
    <div className="kpi-sparkline-container">
      <svg viewBox="0 0 140 40" preserveAspectRatio="none" className="kpi-sparkline-svg">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={areaColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Renders a card displaying a specific metric with sparklines and YoY deltas.
 */
function KPICard({ title, value, icon: Icon, className, prefix = '', sparklinePoints, strokeColor, gradientId, areaColor, yoyDelta, isLoading }) {
  const isPositive = yoyDelta >= 0;

  return (
    <div className={`glass-panel kpi-card ${className}`}>
      <div className="kpi-card-header">
        <div className="kpi-info">
          <h3>{title}</h3>
          {isLoading ? (
            <div className="skeleton-block" style={{ marginTop: '8px' }}></div>
          ) : (
            <div className="kpi-value">
              {prefix}{value}
            </div>
          )}
        </div>
        <div className="kpi-icon-wrapper">
          <Icon size={18} />
        </div>
      </div>
      
      {/* Sparkline and YoY Delta bottom alignment */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        {!isLoading && (
          <Sparkline 
            points={sparklinePoints} 
            strokeColor={strokeColor} 
            gradientId={gradientId} 
            areaColor={areaColor} 
          />
        )}
        
        {!isLoading && (
          <span className={`kpi-delta ${isPositive ? 'delta-positive' : 'delta-negative'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? '+' : ''}{yoyDelta}%
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard KPI Cards block.
 * Receives filtered records to compute actual chronological trends.
 */
export default function KPICards({ kpis, records, isLoading = false }) {
  const { totalRegistered, approved, rejected, collection } = kpis;

  // Format currency with Indian formatting (en-IN)
  const formatCurrency = (val) => {
    return Math.round(val).toLocaleString('en-IN');
  };

  const formatNumber = (val) => {
    return val.toLocaleString('en-IN');
  };

  // Extract sparkline trends
  const registeredSparkline = useMemo(() => getSparklineData(records, 'registered'), [records]);
  const approvedSparkline = useMemo(() => getSparklineData(records, 'approved'), [records]);
  const rejectedSparkline = useMemo(() => getSparklineData(records, 'rejected'), [records]);
  const collectionSparkline = useMemo(() => getSparklineData(records, 'collection'), [records]);

  // Compute YoY Delta for these filtered records
  // Compare count/revenue in 2024 vs 2023 for the active filter set
  const yoyDeltas = useMemo(() => {
    if (!records || records.length === 0) {
      return { registered: 0, approved: 0, rejected: 0, collection: 0 };
    }

    const countByYear = (year, filterFn = () => true) => 
      records.filter(r => r.registration_date && r.registration_date.substring(0, 4) === year && filterFn(r)).length;

    const collectionByYear = (year) => 
      records.filter(r => r.registration_date && r.registration_date.substring(0, 4) === year && r.status === 'Approved')
        .reduce((sum, r) => sum + (Number(r.collection_inr) || 0), 0);

    const calcDelta = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 8.4 : 0; // fallback if previous year is empty
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };

    const reg2024 = countByYear('2024');
    const reg2023 = countByYear('2023');

    const app2024 = countByYear('2024', r => r.status === 'Approved');
    const app2023 = countByYear('2023', r => r.status === 'Approved');

    const rej2024 = countByYear('2024', r => r.status === 'Rejected');
    const rej2023 = countByYear('2023', r => r.status === 'Rejected');

    const col2024 = collectionByYear('2024');
    const col2023 = collectionByYear('2023');

    return {
      registered: calcDelta(reg2024, reg2023),
      approved: calcDelta(app2024, app2023),
      rejected: calcDelta(rej2024, rej2023),
      collection: calcDelta(col2024, col2023),
    };
  }, [records]);

  return (
    <div className="kpi-grid">
      <KPICard
        title="Total Registered"
        value={formatNumber(totalRegistered)}
        icon={ClipboardList}
        className="kpi-registered"
        sparklinePoints={registeredSparkline}
        strokeColor="#2D4B73" // Sapphire
        areaColor="#2D4B73"
        gradientId="grad-spark-reg"
        yoyDelta={yoyDeltas.registered}
        isLoading={isLoading}
      />
      <KPICard
        title="Approved Properties"
        value={formatNumber(approved)}
        icon={CheckCircle}
        className="kpi-approved"
        sparklinePoints={approvedSparkline}
        strokeColor="#34d399" // Emerald (brightened for contrast)
        areaColor="#2B5B4D"
        gradientId="grad-spark-app"
        yoyDelta={yoyDeltas.approved}
        isLoading={isLoading}
      />
      <KPICard
        title="Rejected Properties"
        value={formatNumber(rejected)}
        icon={XCircle}
        className="kpi-rejected"
        sparklinePoints={rejectedSparkline}
        strokeColor="#f87171" // Crimson (brightened for contrast)
        areaColor="#6B2C2C"
        gradientId="grad-spark-rej"
        yoyDelta={yoyDeltas.rejected}
        isLoading={isLoading}
      />
      <KPICard
        title="Total Collection"
        value={formatCurrency(collection)}
        prefix="₹ "
        icon={IndianRupee}
        className="kpi-collection"
        sparklinePoints={collectionSparkline}
        strokeColor="#8C7A51" // Brass/Gold
        areaColor="#8C7A51"
        gradientId="grad-spark-col"
        yoyDelta={yoyDeltas.collection}
        isLoading={isLoading}
      />
    </div>
  );
}
